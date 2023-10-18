import { check, group, sleep } from 'k6';
import exec from 'k6/execution';
import { chunk } from 'lodash';
import {
  CONFIGS,
  GET,
  POST,
  TEST_COMMUNITY_NAME,
  TEST_GROUP_NAME,
  TEST_USER_NAME,
} from '../../configs';
import { generateGroupSeed } from '../../scripts/allocate-users';

const NUMBER_OF_INVITERS = Number(__ENV.NUM_OF_GROUP_ADMINS) || 1;
const MAX_INVITEES = 20;
const inviteeCount = Number(__ENV.INVITEE_COUNT) || 2;

const groupIndices = Array.from(
  { length: NUMBER_OF_INVITERS },
  (_, k) => k + 1,
);

async function getJoinedCommunities(
  groupAdminUsername: string,
): Promise<{ id: string; name: string }[]> {
  return (
    await GET({
      actorUsername: groupAdminUsername,
      url: `${CONFIGS.GROUP}/me/communities?limit=500`,
    })
  ).data;
}

async function getTargetGroup(
  groupAdminUsername: string,
  communityIndex: number,
  groupIndex: number,
): Promise<{ id: string; name: string }> {
  const joinedCommunities = await getJoinedCommunities(groupAdminUsername);
  const targetCommunityName = `${TEST_COMMUNITY_NAME} ${communityIndex}`;

  const targetCommunity = joinedCommunities.find(
    (c) => c.name === targetCommunityName,
  );

  const joinedGroupsInCommunity = (
    await GET({
      actorUsername: groupAdminUsername,
      url: `${CONFIGS.GROUP}/me/communities/${targetCommunity?.id}/groups?list_by=flat&limit=500`,
    })
  ).data as { id: string; name: string }[];

  const targetGroupName = `${TEST_GROUP_NAME} ${groupIndex}`;
  const targetGroup = joinedGroupsInCommunity.find(
    (g) => g.name === targetGroupName,
  ) as { id: string; name: string };

  return targetGroup;
}

function processInvitation(targetId: string, username: string) {
  const userIndex = Number(username.substring(TEST_USER_NAME.length));
  if (userIndex % 2 === 1) {
  }
}

function acceptInvitation(username: string) {
  
}

export async function createGroupInvitations(
  targetGroupId: string,
  groupAdminUsername: string,
) {
  const invitees = await getInvitees(groupAdminUsername, targetGroupId);
  const inviteeIds = invitees.map((i) => i.id);
  const inviteeIdsBatches = chunk(inviteeIds, MAX_INVITEES);
  inviteeIdsBatches.forEach((inviteeIds) =>
    POST({
      actorUsername: groupAdminUsername,
      url: `${CONFIGS.GROUP}/invitations`,
      body: {
        target_id: targetGroupId,
        target_type: 'GROUP',
        invitee_ids: inviteeIds,
      },
    }),
  );

  const invitations = await getGroupInvitations(
    targetGroupId,
    groupAdminUsername,
  );

  const invitedUserIds = invitations.map((i) => i.invitee.id);

  check(null, {
    ['invited users successfully']: () =>
      inviteeIds.every((inviteeId) => invitedUserIds.includes(inviteeId)),
  });
}

async function getInvitees(
  groupAdminUsername: string,
  targetGroupId: string,
): Promise<
  {
    id: string;
    fullname: string;
  }[]
> {
  const response = await GET({
    actorUsername: groupAdminUsername,
    url: `${CONFIGS.GROUP}/groups/${targetGroupId}/joinable-users?limit=${inviteeCount}&key=${TEST_USER_NAME}`,
  });
  return response.data;
}

async function getGroupInvitations(
  targetGroupId: string,
  groupAdminUsername: string,
): Promise<{ invitee: { id: string; username: string } }[]> {
  return (
    await GET({
      actorUsername: groupAdminUsername,
      url: `${CONFIGS.GROUP}/groups/${targetGroupId}/invitations?limit=500`,
    })
  ).data;
}

export default async function invitationTest() {
  const communityIndex = exec.vu.idInTest;
  const inviters = groupIndices.map((groupIndex) => {
    const usersAllocationInGroup = generateGroupSeed(
      communityIndex,
      groupIndex,
    );
    const pickedGroupAdmin = usersAllocationInGroup.admins[0];
    return {
      groupAdminUsername: pickedGroupAdmin,
    };
  });

  group('group admin invites users to group', function () {
    inviters.forEach(async ({ groupAdminUsername }, index) => {
      const groupIndex = index + 1;
      const targetGroup = await getTargetGroup(
        groupAdminUsername,
        communityIndex,
        groupIndex,
      );
      const targetGroupId = targetGroup.id;

      sleep(0.2);

      createGroupInvitations(targetGroupId, groupAdminUsername);
    });
  });
}

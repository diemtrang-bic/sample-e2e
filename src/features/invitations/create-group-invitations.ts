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
  getToken,
} from '../../configs';
import { getGroupUsersAllocation } from '../../scripts/allocate-users';

const NUMBER_OF_INVITERS = Number(__ENV.NUM_OF_GROUP_ADMINS) || 1;
const MAX_INVITEES = 20;
const inviteeCount = Number(__ENV.INVITEE_COUNT) || 2;

const groupIndices = Array.from(
  { length: NUMBER_OF_INVITERS },
  (_, k) => k + 1,
);

function getJoinedCommunities(
  groupAdminUsername: string,
  token: string,
): { id: string; name: string }[] {
  return GET({
    actorUsername: groupAdminUsername,
    url: `${CONFIGS.GROUP}/me/communities?limit=500`,
    token,
  }).data;
}

function getTargetGroup(
  groupAdminUsername: string,
  communityIndex: number,
  groupIndex: number,
  token: string,
): { id: string; name: string } {
  const joinedCommunities = getJoinedCommunities(groupAdminUsername, token);
  const targetCommunityName = `${TEST_COMMUNITY_NAME} ${communityIndex}`;

  const targetCommunity = joinedCommunities.find(
    (c) => c.name === targetCommunityName,
  );

  const joinedGroupsInCommunity = GET({
    token,
    actorUsername: groupAdminUsername,
    url: `${CONFIGS.GROUP}/me/communities/${targetCommunity?.id}/groups?list_by=flat&limit=500`,
  }).data as { id: string; name: string }[];

  const targetGroupName = `${TEST_GROUP_NAME} ${groupIndex}`;
  const targetGroup = joinedGroupsInCommunity.find(
    (g) => g.name === targetGroupName,
  ) as { id: string; name: string };

  return targetGroup;
}

export function createGroupInvitations(
  targetGroupId: string,
  groupAdminUsername: string,
  token: string,
) {
  const invitees = getInvitees(groupAdminUsername, token, targetGroupId);
  const inviteeIds = invitees.map((i) => i.id);
  const inviteeIdsBatches = chunk(inviteeIds, MAX_INVITEES);
  inviteeIdsBatches.forEach((inviteeIds) =>
    POST({
      token,
      actorUsername: groupAdminUsername,
      url: `${CONFIGS.GROUP}/invitations`,
      body: {
        target_id: targetGroupId,
        target_type: 'GROUP',
        invitee_ids: inviteeIds,
      },
    }),
  );

  const invitations = getGroupInvitations(
    targetGroupId,
    groupAdminUsername,
    token,
  );

  const invitedUserIds = invitations.map((i) => i.invitee.id);

  check(null, {
    ['invited users successfully']: () =>
      inviteeIds.every((inviteeId) => invitedUserIds.includes(inviteeId)),
  });
}

function getInvitees(
  groupAdminUsername: string,
  token: string,
  targetGroupId: string,
): {
  id: string;
  fullname: string;
}[] {
  const response = GET({
    actorUsername: groupAdminUsername,
    token,
    url: `${CONFIGS.GROUP}/groups/${targetGroupId}/joinable-users?limit=${inviteeCount}&key=${TEST_USER_NAME}`,
  });
  return response.data;
}

function getGroupInvitations(
  targetGroupId: string,
  groupAdminUsername: string,
  token: string,
): { invitee: { id: string } }[] {
  return GET({
    token,
    actorUsername: groupAdminUsername,
    url: `${CONFIGS.GROUP}/groups/${targetGroupId}/invitations?limit=${inviteeCount}`,
  }).data;
}

export default function testCreateGroupInvitation() {
  const communityIndex = exec.vu.idInTest;
  const inviters = groupIndices.map((groupIndex) => {
    const usersAllocationInGroup = getGroupUsersAllocation(
      communityIndex,
      groupIndex,
    );
    const pickedGroupAdmin = usersAllocationInGroup.admins[0];
    return {
      groupAdminUsername: pickedGroupAdmin,
      token: getToken(pickedGroupAdmin),
    };
  });

  group('group admin invites users to group', function () {
    inviters.forEach(({ groupAdminUsername, token }, index) => {
      const groupIndex = index + 1;
      const targetGroup = getTargetGroup(
        groupAdminUsername,
        communityIndex,
        groupIndex,
        token,
      );
      const targetGroupId = targetGroup.id;

      sleep(0.2);

      createGroupInvitations(targetGroupId, groupAdminUsername, token);
    });
  });
}

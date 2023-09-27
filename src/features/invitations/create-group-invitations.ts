import { check, group, sleep } from 'k6';
import exec from 'k6/execution';
import { CONFIGS, DEFAULT_OPTIONS, OK, get, post, testUsersIdentifier } from '../../configs.ts';
import {
  INVITATION_TARGET_GROUP_ADMIN,
  // INVITATION_TARGET_GROUP_ADMIN,
  INVITATION_TARGET_GROUP_ID,
} from './config.ts';

export const options = DEFAULT_OPTIONS;

Object.assign(options, {
  vus: __ENV.INVITER_COUNT || 1,
});

const inviteeCount = Number(__ENV.INVITEE_COUNT) || 2;

export let invitees: Record<string, any>;

export function createGroupInvitations() {
  const response: any = post(
    INVITATION_TARGET_GROUP_ADMIN,
    `${CONFIGS.GROUP}/invitations`,
    {
      target_id: INVITATION_TARGET_GROUP_ID,
      target_type: 'GROUP',
      invitee_ids: Object.values(invitees),
    },
  );

  check(
    response,
    Object.keys(invitees).reduce((checkers, inviteeUsername) => {
      if (response.code === OK) {
        return Object.assign(checkers, {
          [`invited ${inviteeUsername} successfully`]: true,
        });
      } else {
        return { 'invite user': false };
      }
    }, {}),
  );
}

function expectInviteesGotNotification() {
  sleep(0.5);
  Object.keys(invitees).forEach((inviteeUsername) => {
    const response = get(
      inviteeUsername,
      `${CONFIGS.NOTI}/notifications/?limit=20&offset=0&flag=ALL`,
    );

    check(response, {
      [`invitee ${inviteeUsername} received noti`]: (response) => {
        const notifications = response.data.list;

        return notifications.some(
          (noti: any) =>
            noti.extra.type === 'group.invitation' &&
            noti.activities.some(
              (act: any) =>
                act.invitation.target.id === INVITATION_TARGET_GROUP_ID &&
                act.invitation.status === 'WAITING',
            ),
        );
      },
    });
  });
}

function getInvitees() {
  const response = get(
    INVITATION_TARGET_GROUP_ADMIN,
    `${
      CONFIGS.GROUP
    }/groups/${INVITATION_TARGET_GROUP_ID}/joinable-users?limit=${inviteeCount}&key=${testUsersIdentifier}&offset=${
      exec.vu.idInTest * inviteeCount
    }`,
  );

  invitees = response.data.reduce(
    (map, user) =>
      Object.assign(map, {
        [user.username]: user.id,
      }),
    {},
  );

  return response.data;
}

export default function testCreateGroupInvitation() {
  getInvitees();

  group('group admin invites users to group', function () {
    createGroupInvitations();
  });

  group('invitees received notification', function () {
    expectInviteesGotNotification();
  });
}

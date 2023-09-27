import { check, group } from 'k6';
import { CONFIGS, get, put } from '../../configs.ts';
import { INVITATION_TARGET_GROUP_ID } from './config.ts';
import testCreateGroupInvitation, {
  invitees,
} from './create-group-invitations.ts';

function declineGroupInvitation() {
  Object.keys(invitees).forEach((inviteeUsername: string) => {
    const invitations = get(
      inviteeUsername,
      `${CONFIGS.GROUP}/me/invitations?limit=500`,
    ).data;

    const targetInvitation = invitations.find(
      (i: any) => i.target_info.id === INVITATION_TARGET_GROUP_ID,
    );

    put(
      inviteeUsername,
      `${CONFIGS.GROUP}/invitations/${targetInvitation.id}/decline`,
    );
  });
}

function expectInvitationsAreRemovedFromUserInvitationList() {
  group("declined invitations are removed from users' invitation list", () => {
    Object.keys(invitees).forEach((inviteeUsername) => {
      const invitations = get(
        inviteeUsername,
        `${CONFIGS.GROUP}/me/invitations?limit=500`,
      ).data;

      const targetInvitation = invitations.find(
        (i) => i.target_info.id === INVITATION_TARGET_GROUP_ID,
      );

      check(invitations, {
        [`invitation is removed from user ${inviteeUsername}'s invitation list`]:
          () => {
            return !targetInvitation;
          },
      });
    });
  });
}

export default function testDeclineGroupInvitation() {
  testCreateGroupInvitation();
  declineGroupInvitation();
  expectInvitationsAreRemovedFromUserInvitationList();
}

// export default function (params) {

// }

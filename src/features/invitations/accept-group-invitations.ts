import { sleep } from 'k6';

function acceptGroupInvitations(actorUsername: string) {
  // const invitations = get(
  //   actorUsername,
  //   `${CONFIGS.GROUP}/me/invitations`,
  // ).data;
  // const targetInvitation = invitations.find(
  //   (i: any) => i.target_info.id === INVITATION_TARGET_GROUP_ID,
  // );
  // put(
  //   actorUsername,
  //   `${CONFIGS.GROUP}/invitations/${targetInvitation.id}/accept`,
  // );
}

function expectInviteesExistInGroupMembers() {
  sleep(0.5);
  // const response = get(
  //   INVITATION_TARGET_GROUP_ADMIN,
  //   `${CONFIGS.GROUP}/groups/${INVITATION_TARGET_GROUP_ID}/users?limit=500`,
  // );

  // check(response, {
  //   'members includes invitees': (response) => {
  //     const groupMembers = response.data.group_member.data;

  //     return Object.values(invitees).every((userId) =>
  //       groupMembers.some((member: any) => member.id === userId),
  //     );
  //   },
  // });
}

function expectInviteesHaveTargetGroupInJoinedGroups() {
  // Object.keys(invitees).forEach((inviteeUsername) => {
  //   const response = get(
  //     inviteeUsername,
  //     `${CONFIGS.GROUP}/me/communities/${INVITATION_COMMUNITY_ID}/groups?list_by=flat&limit=500`,
  //   );
  //   check(response, {
  //     [`invitee ${inviteeUsername} has target group in joined groups`]:
  //       response.data.some(
  //         (group: any) => group.id === INVITATION_TARGET_GROUP_ID,
  //       ),
  //   });
  // });
}

function expectInviteesNotificationIsRemove() {
  sleep(0.5);
  // Object.keys(invitees).forEach((inviteeUsername) => {
  //   const response = get(
  //     inviteeUsername,
  //     `${CONFIGS.NOTI}/notifications/?limit=20&offset=0&flag=ALL`,
  //   );

  //   const ok = check(response, {
  //     [`invitee ${inviteeUsername} invitation notification is removed`]: (
  //       response,
  //     ) => {
  //       const notifications = response.data.list;

  //       return !notifications.some(
  //         (noti: any) =>
  //           noti.extra.type === 'group.invitation' &&
  //           noti.activities.some(
  //             (act: any) =>
  //               act.invitation.target.id === INVITATION_TARGET_GROUP_ID &&
  //               act.invitation.status === 'WAITING',
  //           ),
  //       );
  //     },
  //   });
  // });
}

function validateUserAcceptedSuccessfully() {
  expectInviteesExistInGroupMembers();
}

function reMoveMembers() {
  // put(
  //   INVITATION_TARGET_GROUP_ADMIN,
  //   `${CONFIGS.GROUP}/groups/${INVITATION_TARGET_GROUP_ID}/users/remove`,
  //   {
  //     user_ids: Object.values(invitees),
  //   },
  // );
}

export default function testAcceptGroupInvitation() {
  // testCreateGroupInvitation();
  // group('invitees accept invitation', function () {
  //   Object.keys(invitees).map((actorUsername) =>
  //     acceptGroupInvitations(actorUsername),
  //   );
  //   group(`invitees invitations in notification are remove`, () => {
  //     expectInviteesNotificationIsRemove();
  //   });
  //   group(`invitees are added to group successfully`, () => {
  //     validateUserAcceptedSuccessfully();
  //   });
  //   group(`invitees have the target group in joined groups`, () => {
  //     expectInviteesHaveTargetGroupInJoinedGroups();
  //   });
  // });
  // reMoveMembers();
}

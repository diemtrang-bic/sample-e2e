import testCreateGroupInvitation from './create-group-invitations';

export const options = {
  vus: 1,
};


export default function invitationUseCases() {
  testCreateGroupInvitation();
  // testAcceptGroupInvitation();
  // testDeclineGroupInvitation();
}

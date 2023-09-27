import testAcceptGroupInvitation from './accept-group-invitations.ts';
import testDeclineGroupInvitation from './decline-group-invitations.ts';

export default function invitationUseCases() {
  testAcceptGroupInvitation();
  testDeclineGroupInvitation();
}

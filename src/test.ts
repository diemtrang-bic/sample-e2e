import { group } from 'k6';
import { DEFAULT_OPTIONS } from './configs';
import invitationUseCases from './features/invitations/tests';

export const options = DEFAULT_OPTIONS;

export default function () {
  [invitationUseCases].forEach((func) => {
    group(func.name, () => {
      func();
    });
  });
}

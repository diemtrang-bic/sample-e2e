import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { group } from 'k6';
import { DEFAULT_OPTIONS } from './configs';
import invitationTest from './features/invitations/test';

export const options = DEFAULT_OPTIONS;

export default function () {
  [invitationTest].forEach((func) => {
    group(func.name, () => {
      func();
    });
  });
}

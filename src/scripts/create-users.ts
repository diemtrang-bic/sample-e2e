import {generateUserSeed, SEED_CONFIG} from "./allocate-users";
import {stringify} from 'csv-stringify/sync';
import {writeFileSync} from 'fs';

export function generateListUserSeed() {
    const users = []

    for (let i = 1; i <= SEED_CONFIG.numberOfUsers; i++) {
        const {username, fullName, email, password} = generateUserSeed(i)
        users.push([fullName, username, email, password])
    }

    return users
}

const users = generateListUserSeed()
users.unshift(['fullname', 'username', 'email', 'password'])
writeFileSync('users.csv', stringify(users))
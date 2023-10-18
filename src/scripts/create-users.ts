import {generateUserSeed, SEED_CONFIG} from "./allocate-users";
import {stringify} from 'csv-stringify/sync';

export function generateListUserSeedCSV() {
    const users = []

    for (let i = 1; i <= SEED_CONFIG.numberOfUsers; i++) {
        const {username, fullName, email, password} = generateUserSeed(i)
        users.push([fullName, username, email, password])
    }

    users.unshift(['fullname', 'username', 'email', 'password'])

    return stringify(users)
}
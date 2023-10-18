import {generateGroupSeed, SEED_CONFIG} from "./allocate-users";

export function generateListGroupSeed(communityNumber:number, groupNumber:number) {
    const groups = []
    for (let i = 1; i <= SEED_CONFIG.numberOfCommunities; i++) {
        for (let j = 1; j <= SEED_CONFIG.numberOfGroupsInCommunity; j++) {
            const groupSeed = generateGroupSeed(i, j)
            groups.push(groupSeed)
        }
    }
    return groups
}
import {generateGroupSeed, makeArrayFromRange, SEED_CONFIG} from "./allocate-users";

export function generateListGroupSeedInCommunity(communityNumber: number) {
    return makeArrayFromRange(1, SEED_CONFIG.numberOfGroupsInCommunity).map(groupNumber => generateGroupSeed(communityNumber, groupNumber))
}

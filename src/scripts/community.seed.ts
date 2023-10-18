import {generateCommunitySeed, makeArrayFromRange, SEED_CONFIG} from "./allocate-users";

export function generateListCommunitySeed() {
    return makeArrayFromRange(1, SEED_CONFIG.numberOfCommunities).map(generateCommunitySeed)
}
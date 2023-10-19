import {generateGroupSeed, makeArrayFromRange, SEED_CONFIG} from "./allocate-users";
import {stringify} from "csv-stringify/sync";

export function generateListGroupSeedInCommunity(communityNumber: number) {
    return makeArrayFromRange(1, SEED_CONFIG.numberOfGroupsInCommunity).map(groupNumber => generateGroupSeed(communityNumber, groupNumber))
}

export function generateListGroupSeedCSV(communityNumber: number) {
    const groupSeeds = generateListGroupSeedInCommunity(communityNumber)

    const groups = groupSeeds.map((group, index) => [
        index + 1,
        group.name,
        `Group description of ${group.name}`,
        '',
        'CLOSED'
    ])

    groups[3][3] = groups[0][0]
    groups[4][3] = groups[0][0]

    groups[5][3] = groups[1][0]
    groups[6][3] = groups[1][0]

    groups[7][3] = groups[2][0]
    groups[8][3] = groups[2][0]

    groups[9][3] = groups[3][0]

    groups.unshift(['group_temporary_id', 'name', 'description', 'outer_group_temporary_id', 'privacy'])

    return stringify(groups)
}

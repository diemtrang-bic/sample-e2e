export const SEED_CONFIG = {
    usernamePrefix: 'betestuser',
    domainEmail: 'be.in',
    defaultPassword: '1$orMore',
    fullNamePrefix: 'BETest fullName of',

    communityNamePrefix: 'BE Test Community',
    groupNamePrefix: 'BE Test Group',

    numberOfUsers: 10000,
    numberOfCommunities: 100,
    numberOfGroupsInCommunity: 10,

    numberOfCommunityAdminsInCommunity: 5,
    numberOfCommunityMembersInCommunity: 2000,

    numberOfGroupAdminsInGroup: 10,
    numberOfGroupMembersInGroup: 200,
}

export function generateUserNameSeed(userNumber: number) {
    return `${SEED_CONFIG.usernamePrefix}${userNumber}`;
}

export function generateUserSeed(userNumber: number) {
    const username = generateUserNameSeed(userNumber);
    const fullName = `${SEED_CONFIG.fullNamePrefix} ${username}`;
    const email = `${username}@${SEED_CONFIG.domainEmail}`

    return {
        username,
        fullName,
        email,
        password: SEED_CONFIG.defaultPassword
    };
}

export function makeArrayFromRange(startNumber: number, endNumber: number) {
    const data = [];
    for (let i = startNumber; i <= endNumber; i++) {
        data.push(i);
    }

    return data;
}

export function generateCommunitySeed(communityNumber: number) {
    const firstUserIndex = (communityNumber - 1) * SEED_CONFIG.numberOfCommunities + 1;
    const lastUserIndex =
        firstUserIndex + SEED_CONFIG.numberOfCommunityMembersInCommunity - 1;

    const memberRange =
        lastUserIndex <= SEED_CONFIG.numberOfUsers
            ? [firstUserIndex, lastUserIndex]
            : [
                SEED_CONFIG.numberOfUsers - SEED_CONFIG.numberOfCommunityMembersInCommunity + 1,
                SEED_CONFIG.numberOfUsers,
            ];

    const members = makeArrayFromRange(memberRange[0], memberRange[1]).map(
        generateUserSeed,
    );
    const admins = members.slice(0, SEED_CONFIG.numberOfCommunityAdminsInCommunity);

    return {
        name: `${SEED_CONFIG.communityNamePrefix} ${communityNumber}`,
        owner: generateUserSeed(communityNumber),
        members,
        admins,
    };
}

export function generateGroupSeed(communityNumber: number, groupNumber: number) {
    const {members: communityMembers} =
        generateCommunitySeed(communityNumber);
    const firstMemberNumber = (groupNumber - 1) * SEED_CONFIG.numberOfGroupMembersInGroup + 1;
    const lastMemberNumber = firstMemberNumber + SEED_CONFIG.numberOfGroupMembersInGroup - 1;

    const memberIndexRange =
        lastMemberNumber <= SEED_CONFIG.numberOfCommunityMembersInCommunity
            ? [firstMemberNumber - 1, lastMemberNumber - 1]
            : [
                SEED_CONFIG.numberOfCommunityMembersInCommunity - SEED_CONFIG.numberOfGroupMembersInGroup,
                SEED_CONFIG.numberOfCommunityMembersInCommunity - 1,
            ];

    const members = communityMembers.slice(
        memberIndexRange[0],
        memberIndexRange[1] + 1,
    );
    const admins = members.slice(0, SEED_CONFIG.numberOfGroupAdminsInGroup);

    return {
        name: `${SEED_CONFIG.groupNamePrefix} ${groupNumber}`,
        members,
        admins,
    };
}

const numberOfUsers = 10000;
const numberOfCommunities = 100;
const numberOfGroupsInCommunity = 10;

const numberOfCommunityAdminsInCommunity = 5;
const numberOfCommunityMembersInCommunity = 1000;

const numberOfGroupAdminsInGroup = 10;
const numberOfGroupMembersInGroup = 200;

function getUserName(index: number) {
  return `trangtestuser${index}`;
}

function makeArrayFromRange(fromIndex: number, toIndex: number) {
  const data = [];
  for (let i = fromIndex; i <= toIndex; i++) {
    data.push(i);
  }
  return data;
}

export function getCommunityUsersAllocation(communityIndex: number) {
  const firstUserIndex = (communityIndex - 1) * numberOfCommunities + 1;
  const lastUserIndex =
    firstUserIndex + numberOfCommunityMembersInCommunity - 1;

  const memberRange =
    lastUserIndex <= numberOfUsers
      ? [firstUserIndex, lastUserIndex]
      : [
          numberOfUsers - numberOfCommunityMembersInCommunity + 1,
          numberOfUsers,
        ];

  const members = makeArrayFromRange(memberRange[0], memberRange[1]).map(
    getUserName,
  );
  const admins = members.slice(0, numberOfCommunityAdminsInCommunity);

  const data = {
    owner: getUserName(communityIndex),
    members,
    admins,
  };

  return data;
}

export function getGroupUsersAllocation(
  communityIndex: number,
  groupIndex: number,
): { members: string[]; admins: string[] } {
  const { members: communityMembers } =
    getCommunityUsersAllocation(communityIndex);
  const firstMemberNumber = (groupIndex - 1) * numberOfGroupMembersInGroup + 1;
  const lastMemberNumber = firstMemberNumber + numberOfGroupMembersInGroup - 1;

  const memberIndexRange =
    lastMemberNumber <= numberOfCommunityMembersInCommunity
      ? [firstMemberNumber - 1, lastMemberNumber - 1]
      : [
          numberOfCommunityMembersInCommunity - numberOfGroupMembersInGroup,
          numberOfCommunityMembersInCommunity - 1,
        ];

  const members = communityMembers.slice(
    memberIndexRange[0],
    memberIndexRange[1] + 1,
  );
  const admins = members.slice(0, numberOfGroupAdminsInGroup);

  const data = {
    members,
    admins,
  };

  return data;
}

const communityNumber = 1;
const groupNumber = 1;
// console.log(JSON.stringify(getCommunityUsersAllocation(communityNumber)));
// console.log(
//   JSON.stringify(getGroupUsersAllocation(communityNumber, groupNumber)),
// );

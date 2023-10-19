import {HttpService} from "./http-service";
import {generateListCommunitySeed} from "./community.seed";
import {generateListGroupSeedCSV, generateListGroupSeedInCommunity} from "./group.seed";
import {stringify} from "csv-stringify/sync";
import FormData from "form-data";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function run() {
    const apiEndpoint = 'https://api.beincom.io/v1'
    const sysAdmin = {
        username: 'betestsystemadmin',
        password: '1$orMore'
    }

    const sysAdminAuth = await HttpService.getToken(sysAdmin.username, sysAdmin.password)
    const httpService = new HttpService({
        apiEndpoint,
        authToken: sysAdminAuth.idToken
    })

    const userIdByEmails: Map<string, string> = new Map()
    const communityIdByName: Map<string, string> = new Map()

    try {
        console.log('** Start generate the seed communities')
        const seedCommunities = generateListCommunitySeed()
        for (const community of seedCommunities) {
            console.log('> Working on the community', community.name)

            const communityPayload = {
                name: community.name,
                privacy: 'PRIVATE',
                owner_id: ''
            }

            const owner = community.owner
            if (userIdByEmails.has(owner.email)) {
                communityPayload.owner_id = userIdByEmails.get(owner.email) as string
            } else {
                const user = await httpService.findUserByEmail(owner.email)
                communityPayload.owner_id = user.id
                userIdByEmails.set(owner.email, user.id)
            }

            console.log(' >> Create community', community.name)
            try {
                const newCommunityRes = await httpService.http.post('/group/admin/communities', communityPayload)
                communityIdByName.set(community.name, newCommunityRes.data.data.id)
            } catch (e) {
                const isExist = e.response.data.code === 'community.create.name_already_exists'
                if (isExist) {
                    const existedCommunity = await httpService.findCommunityByName(community.name)
                    if (existedCommunity?.id) {
                        communityIdByName.set(community.name, existedCommunity.id)
                    } else {
                        throw new Error(`Community ${community.name} is not exist`)
                    }
                } else {
                    throw e
                }
            }

            /**
             * Import the community members
             */
            console.log(' >> Import community members', community.name)
            const communityId = communityIdByName.get(community.name) as string
            const communityMembers = community.members.map(member => [member.email, communityId])
            communityMembers.unshift(['user_email', 'community_id'])

            const form = new FormData()
            form.append('file', stringify(communityMembers), 'community-member.csv')
            await httpService.http.post('/group/admin/csv/import-community-members', form)
            await sleep(2000)

            const [communityNumber] = community.name.match(/\d+$/) as RegExpMatchArray
            console.log(' >> Create the groups in', community.name)
            try {
                const groupCSV = generateListGroupSeedCSV(communityNumber as unknown as number)
                const form = new FormData()
                form.append('community_id', communityId)
                form.append('admin_id', communityPayload.owner_id)
                form.append('file', groupCSV, 'groups.csv')
                await httpService.http.post('/group/admin/csv/import-groups', form)
            } catch (e) {
                console.error(' >> Error', JSON.stringify(e.response.data, null, 2))
            }

            await sleep(5000)
            console.log(' >> Import group members', community.name)
            const seedGroups = generateListGroupSeedInCommunity(communityNumber as unknown as number)
            const groupsInCommunity = await httpService.findAllGroupsInCommunity(communityId)

            if (groupsInCommunity.length < seedGroups.length) {
                await sleep(10000)
            }

            const parentIdSet = new Set<string>()
            for (const group of groupsInCommunity) {
                const {parents} = group
                for (const parentId of parents) {
                    parentIdSet.add(parentId)
                }
            }

            const groupIdByName = new Map<string, string>(groupsInCommunity.map(({id, name}: {
                id: string,
                name: string
            }) => [name, id]))
            for (const group of seedGroups) {
                const groupId = groupIdByName.get(group.name) as string

                if (parentIdSet.has(groupId)) {
                    continue
                }

                const {
                    members: groupMembers,
                    admins: groupAdmins
                } = group

                const groupAdminEmailSet = new Set(groupAdmins.map(admin => admin.email))
                const groupMemberCSV = []

                for (const groupAdmin of groupAdmins) {
                    groupMemberCSV.push([groupAdmin.email, groupId, 'GROUP_ADMIN'])
                }

                for (const groupMember of groupMembers) {
                    if (!groupAdminEmailSet.has(groupMember.email)) {
                        groupMemberCSV.push([groupMember.email, groupId, 'MEMBER'])
                    }
                }

                groupMemberCSV.unshift(['user_email', 'group_ids', 'role'])

                const form = new FormData()
                form.append('file', stringify(groupMemberCSV), 'group-member.csv')
                await httpService.http.post('/group/admin/users/add-users-to-groups-from-csv', form)
                await sleep(1000)
            }
        }
    } catch (e) {
        console.error(e.response.data)
    }
}

run().catch(console.error)

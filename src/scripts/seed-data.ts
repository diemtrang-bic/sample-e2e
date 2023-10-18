import {HttpService} from "./http-service";
import {generateListCommunitySeed} from "./community.seed";
import FormData from "form-data";
import {stringify} from 'csv-stringify/sync';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const sysAdmin = {
    username: 'betestsystemadmin',
    password: '1$orMore'
}
const apiEndpoint = 'https://api.beincom.io/v1'

HttpService.getToken(sysAdmin.username, sysAdmin.password).then(async res => {
    const httpService = new HttpService({
        apiEndpoint,
        authToken: res.idToken
    })

    const userIdByEmails: Map<string, string> = new Map()
    const communityIdByName: Map<string, string> = new Map()

    try {
        console.log('** Start generate the seed communities')
        const seedCommunities = [generateListCommunitySeed()[9]]
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

            await sleep(5000)
            console.log(' >> Create community members', community.name)
            const communityId = communityIdByName.get(community.name) as string
            const communityMembers = community.members.map(member => [member.email, communityId])
            communityMembers.unshift(['user_email', 'community_id'])

            const form = new FormData()
            form.append('file', stringify(communityMembers), 'community-member.csv')
            await httpService.http.post('/group/admin/csv/import-community-members', form)
        }
    } catch (e) {
        console.error(e)
    }
}).catch(console.error)
import {HttpService} from "./http-service";
import {generateListCommunitySeed} from "./community.seed";

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
        // const user = await httpService.findUserByEmail('thuquyen@evol.vn')
        // console.log(user.id)
        //
        // const community = await httpService.findCommunityByName('back-end')
        // console.log(community.id)
        //
        // const group = await httpService.findGroupInCommunityByName('group 111', community.id)
        // console.log(group.id)

        const seedCommunities = generateListCommunitySeed()
        for (const community of seedCommunities) {
            const communityPayload = {
                name: community.name,
                privacy: 'CLOSED',
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

            try {
                const newCommunityRes = await httpService.http.post('/group/admin/communities', communityPayload)
                communityIdByName.set(community.name, newCommunityRes.data.data.id)
            } catch (e) {
                const isExist = e.response.data.code === 'community.create.name_already_exists'
                if (isExist) {
                    const existedCommunity = await httpService.findCommunityByName(community.name)
                    communityIdByName.set(community.name, existedCommunity.id)
                } else {
                    throw e
                }
            }
        }
    } catch (e) {
        console.error(e)
    }
}).catch(console.error)
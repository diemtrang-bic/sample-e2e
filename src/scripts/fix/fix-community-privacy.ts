import {HttpService} from "../http-service";
import {generateListCommunitySeed} from "../community.seed";

const sysAdmin = {
    username: 'betestsystemadmin',
    password: '1$orMore'
}
const apiEndpoint = 'https://api.beincom.io/v1'

async function fix() {
    const sysAdminAuth = await HttpService.getToken(sysAdmin.username, sysAdmin.password)
    const sysAdminHttpService = new HttpService({
        apiEndpoint,
        authToken: sysAdminAuth.idToken
    })

    const seedCommunities = generateListCommunitySeed()
    for (const community of seedCommunities) {
        const ownerUserName = community.owner.username
        const ownerPassword = community.owner.password
        const ownerAuth = await HttpService.getToken(ownerUserName, ownerPassword)
        const httpService = new HttpService({
            apiEndpoint,
            authToken: ownerAuth.idToken
        })

        try {
            const existedCommunity = await sysAdminHttpService.findCommunityByName(community.name)
            if (existedCommunity && existedCommunity.privacy !== 'PRIVATE') {
                await httpService.http.put(`/group/groups/${existedCommunity.group_id}`, {
                    privacy: 'PRIVATE'
                })
                console.log('Fix community', community.name)
            }
        } catch (e) {
            console.error(222, e)
        }
    }
}

fix().finally()
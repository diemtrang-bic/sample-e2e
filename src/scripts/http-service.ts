import {HttpAdapter} from "./http.adapter";
import axios from "axios";

interface CognitoToken {
    idToken: string;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
}

interface IHttpServiceOption {
    apiEndpoint: string;
    authToken?: string;
}

export class HttpService {
    public readonly http: HttpAdapter;

    constructor(options: IHttpServiceOption) {
        this.http = new HttpAdapter({
            baseURL: options.apiEndpoint,
            headers: {
                authorization: options.authToken
            }
        })
    }

    async findUserByEmail(email: string): Promise<{
        id: string;
        username: string;
    }> {
        try {
            const res = await this.http.get('/user/admin/users', {
                params: {
                    key: email,
                    offset: 0,
                    limit: 10,
                }
            })

            return res.data.data.find((user: any) => user.email === email)
        } catch (e) {
            console.error('findUserByEmail', e)
            throw new Error(`Cannot find user with email: ${email}`)
        }
    }

    async findCommunityByName(name: string): Promise<{
        id: string;
        privacy: string;
        group_id: string
    }> {
        try {
            const res = await this.http.get('/group/admin/communities', {
                params: {
                    key: name,
                    offset: 0,
                    limit: 10,
                    sort: 'name:asc'
                }
            })

            return res.data.data.find((community: any) => community.name === name)
        } catch (e) {
            console.error('findCommunityByName', e.response)
            throw new Error(`Cannot find the community with name: ${name}`)
        }
    }

    async findGroupInCommunityByName(groupName: string, communityId: string) {
        try {
            const res = await this.http.get('/group/admin/groups', {
                params: {
                    key: groupName,
                    community_id: communityId,
                    offset: 0,
                    limit: 10,
                    sort: 'name:asc'
                }
            })

            return res.data.data.find((group: any) => group.name === groupName)
        } catch (e) {
            console.error('findGroupInCommunityByName', e)
            throw new Error(`Cannot find the group with name: ${groupName} in the community ${communityId}`)
        }
    }

    async findAllGroupsInCommunity(communityId: string) {
        try {
            const res = await this.http.get('/group/admin/groups', {
                params: {
                    community_id: communityId,
                    offset: 0,
                    limit: 200,
                    sort: 'name:asc'
                }
            })

            return res.data.data
        } catch (e) {
            console.error('findAllGroupsInCommunity', e)
            throw new Error(`Cannot find the groups in the community ${communityId}`)
        }
    }

    static async getToken(username: string, password: string): Promise<CognitoToken> {
        try {
            const userPool = 'https://cognito-idp.ap-southeast-1.amazonaws.com'
            const clientId = 'j71t9dm5kgn54ee8hq9559i67'

            const res = await axios.post(userPool, {
                AuthParameters: {
                    USERNAME: username,
                    PASSWORD: password,
                },
                AuthFlow: 'USER_PASSWORD_AUTH',
                ClientId: clientId,
            }, {
                headers: {
                    Accept: '*/*',
                    'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
                    'Content-Type': 'application/x-amz-json-1.1',
                }
            })

            return {
                idToken: res.data.AuthenticationResult.IdToken,
                accessToken: res.data.AuthenticationResult.AccessToken,
                refreshToken: res.data.AuthenticationResult.RefreshToken,
                expiresIn: res.data.AuthenticationResult.ExpiresIn,
                tokenType: res.data.AuthenticationResult.TokenType,
            }
        } catch (e) {
            console.error(e.response.data)
            throw new Error(` Cannot get token for user: ${username}`)
        }
    }
}
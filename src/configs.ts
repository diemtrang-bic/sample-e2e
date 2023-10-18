import http from 'k6/http';

interface ApiData {
  token: string;
  actorUsername: string;
  url: string;
  body?: any;
  headers?: object;
}

export const CONFIGS = {
  API: {
    HEADER: 'x-version-id',
    VERSION: '1.1.0',
  },
  GROUP: 'https://api.beincom.io/v1/group',
  USER: 'https://api.beincom.io/v1/user',
  NOTI: 'https://api.beincom.io/v1/notification',

  COGNITO_CLIENT_ID: 'j71t9dm5kgn54ee8hq9559i67',
};

export const DEFAULT_OPTIONS = {
  vus: 1,
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    checks: ['rate==1.0'],
  },
};

export const OK = 'api.ok';

export function getToken(username: string) {
  let res: any;
  try {
    res = http.post(
      'https://cognito-idp.ap-southeast-1.amazonaws.com/',
      JSON.stringify({
        AuthParameters: {
          USERNAME: username,
          PASSWORD: '1$orMore',
        },
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: CONFIGS.COGNITO_CLIENT_ID,
      }),
      {
        headers: {
          Accept: '*/*',
          'X-Amz-Target': 'AWSCognitoIdentityProviderService.InitiateAuth',
          'Content-Type': 'application/x-amz-json-1.1',
        },
      },
    );

    if (!JSON.parse(res.body).AuthenticationResult) {
      throw new Error(`Cannot get token for user: ${username}`);
    }
    const token = JSON.parse(res.body).AuthenticationResult.IdToken;
    return token;
  } catch (error) {
    console.log('ERROR: ', res);
    throw error;
  }
}

// @ts-ignore
export function post(data: ApiData) {
  let res;

  try {
    res = http.post(data.url, JSON.stringify(data.body), {
      headers: Object.assign(
        {
          'Content-Type': 'application/json',
          authorization: data.token,
          [CONFIGS.API.HEADER]: CONFIGS.API.VERSION,
        },
        data.headers,
      ),
    });

    if (res.error_code) {
      if (res.error_code === 401) {
        data.token = getToken(data.actorUsername);

        return post(data);
      } else {
        throw new Error('FAILED: ' + res.body);
      }
    }

    return res.json();
  } catch (error) {
    console.log('ERROR: ', res);
    throw error;
  }
}

// @ts-ignore
export function put(data: ApiData) {
  const { actorUsername, token, body, url, headers } = data;
  let res;
  try {
    res = http.put(url, JSON.stringify(body), {
      headers: Object.assign(
        {
          'Content-Type': 'application/json',
          authorization: token,
          [CONFIGS.API.HEADER]: CONFIGS.API.VERSION,
        },
        headers,
      ),
    });

    if (res.error_code) {
      if (res.error_code === 401) {
        data.token = getToken(actorUsername);

        return put(data);
      } else {
        throw new Error('FAILED: ' + res.body);
      }
    }

    return res.json();
  } catch (error) {
    console.log('ERROR: ', res);
    throw error;
  }
}

export function get(data: ApiData): any {
  const { actorUsername, token, url, headers } = data;
  let res;
  try {
    res = http.get(url, {
      headers: Object.assign(
        {
          authorization: token,
          [CONFIGS.API.HEADER]: CONFIGS.API.VERSION,
        },
        headers,
      ),
    });

    if (res.error_code) {
      if (res.error_code === 401) {
        data.token = getToken(actorUsername);

        return get(data);
      } else {
        throw new Error('FAILED: ' + res.body);
      }
    }

    return res.json();
  } catch (error) {
    console.log('ERROR: ', res);
    throw error;
  }
}

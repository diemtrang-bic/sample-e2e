import http from 'k6/http';

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

function getToken(username: string) {
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
      console.log('777777777777777777777777777res.body\n', res.body);

      console.log('777777777777777777777777777username\n', username);
    }
    const token = JSON.parse(res.body).AuthenticationResult.IdToken;
    return token;
  } catch (error) {
    console.log('ERROR: ', res);
    throw error;
  }
}

export function post(
  actorUsername: string,
  url: string,
  body = {},
  headers = {},
) {
  let res;

  try {
    res = http.post(url, JSON.stringify(body), {
      headers: Object.assign(
        {
          'Content-Type': 'application/json',
          authorization: getToken(actorUsername),
          [CONFIGS.API.HEADER]: CONFIGS.API.VERSION,
        },
        headers,
      ),
    });

    if (res.error_code) {
      throw new Error('FAILED: ' + res.body);
    }

    return res.json();
  } catch (error) {
    console.log('ERROR: ', res);
    throw error;
  }
}

export function put(
  actorUsername: string,
  url: string,
  body = {},
  headers = {},
) {
  let res;
  try {
    res = http.put(url, JSON.stringify(body), {
      headers: Object.assign(
        {
          'Content-Type': 'application/json',
          authorization: getToken(actorUsername),
          [CONFIGS.API.HEADER]: CONFIGS.API.VERSION,
        },
        headers,
      ),
    });

    if (res.error_code) {
      throw new Error('FAILED: ' + res.body);
    }

    return res.json();
  } catch (error) {
    console.log('ERROR: ', res);
    throw error;
  }
}

export function sendPut(
  actorUsername: string,
  url: string,
  body = {},
  headers = {},
) {
  http.put(url, body, {
    headers: Object.assign(
      {
        authorization: getToken(actorUsername),
        [CONFIGS.API.HEADER]: CONFIGS.API.VERSION,
      },
      headers,
    ),
  });
}

export function get(actorUsername: string, url: string, headers = {}): any {
  let res;
  try {
    res = http.get(url, {
      headers: Object.assign(
        {
          authorization: getToken(actorUsername),
          [CONFIGS.API.HEADER]: CONFIGS.API.VERSION,
        },
        headers,
      ),
    });

    if (res.error_code) {
      throw new Error('FAILED: ' + res.body);
    }

    return res.json();
  } catch (error) {
    console.log('ERROR: ', res);
    throw error;
  }
}
export const SUPER_ADMIN_USERNAME = 'betestsystemadmin';
export const testUsersIdentifier = 'betestuser';

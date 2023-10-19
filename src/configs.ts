import http from 'k6/http';
import { openKv } from 'k6/x/kv';

interface ApiData {
  token?: string;
  actorUsername: string;
  url: string;
  body?: any;
  headers?: object;
}

interface EnvConfigs {
  GROUP: string;
  USER: string;
  NOTI: string;
  COGNITO_CLIENT_ID: string;
}

export interface User {
  id: string;
  username: string;
  fullname: string;
}

export interface Group {
  id: string;
  name: string;
}

export const kv: {
  get: (k: string) => Promise<any>;
  set: (k: string, v: any) => Promise<any>;
  clear: () => Promise<any>;
} = openKv();

const TEST_ENV = (__ENV.TEST_ENV as 'develop' | 'staging') ?? 'develop';

const SERVICE_HOSTS: Record<typeof TEST_ENV, EnvConfigs> = {
  develop: {
    GROUP: 'https://api.beincom.io/v1/group',
    USER: 'https://api.beincom.io/v1/user',
    NOTI: 'https://api.beincom.io/v1/notification',
    COGNITO_CLIENT_ID: 'j71t9dm5kgn54ee8hq9559i67',
  },
  staging: {
    GROUP: 'https://api.beincom.app/v1/group',
    USER: 'https://api.beincom.app/v1/user',
    NOTI: 'https://api.beincom.app/v1/notification',
    COGNITO_CLIENT_ID: '6eef5i1emhj7b6qu2nhtikff8e',
  },
};

export const CONFIGS = {
  API_VERSION: {
    HEADER: 'x-version-id',
    VERSION: '1.1.0',
  },
  ...SERVICE_HOSTS[TEST_ENV],
};

export const DEFAULT_OPTIONS = {
  vus: 1,
  throw: true,
  thresholds: {
    http_req_failed: ['rate<=0.5'],
    checks: ['rate==1.0'],
  },
};

export async function getToken(username: string) {
  const res: any = http.post(
    'https://cognito-idp.ap-southeast-1.amazonaws.com/',
    JSON.stringify({
      AuthParameters: {
        USERNAME: username,
        PASSWORD,
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

  if (!res.json().AuthenticationResult) {
    throw new Error(`Cannot get token for user: ${username}`);
  }
  const token = res.json().AuthenticationResult.IdToken;
  await kv.set(username, token);
  return token;
}

export async function POST(data: ApiData) {
  const request = () =>
    http.post(data.url, JSON.stringify(data.body), {
      headers: Object.assign(
        {
          'Content-Type': 'application/json',
          authorization: data.token,
          [CONFIGS.API_VERSION.HEADER]: CONFIGS.API_VERSION.VERSION,
        },
        data.headers,
      ) as any,
    });

  return await sendHttpRequest(request, data);
}

export async function PUT(data: ApiData) {
  const request = () =>
    http.put(data.url, JSON.stringify(data.body), {
      headers: Object.assign(
        {
          'Content-Type': 'application/json',
          authorization: data.token,
          [CONFIGS.API_VERSION.HEADER]: CONFIGS.API_VERSION.VERSION,
        },
        data.headers,
      ) as any,
    });

  return await sendHttpRequest(request, data);
}

export async function GET(data: ApiData): Promise<any> {
  const request = () =>
    http.get(encodeURI(data.url), {
      headers: Object.assign(
        {
          authorization: data.token,
          [CONFIGS.API_VERSION.HEADER]: CONFIGS.API_VERSION.VERSION,
        },
        data.headers,
      ) as any,
    });

  return await sendHttpRequest(request, data);
}

async function sendHttpRequest(request: Function, data: ApiData) {
  const currentToken = await kv.get(data.actorUsername).catch((e: any) => {
    if (e.name != 'KeyNotFoundError') {
      throw e;
    }
  });
  data.token = currentToken;

  const res = request();

  if (res.error_code) {
    if (res.status === 401) {
      data.token = await getToken(data.actorUsername);

      return await sendHttpRequest(request, data);
    } else {
      throw new Error('HTTP_ERROR: ' + res.body);
    }
  }

  return res.json();
}

export const SUPER_ADMIN_USERNAME = 'betestsystemadmin';
export const TEST_USER_NAME = 'BE Test User';
export const TEST_COMMUNITY_NAME = 'BE Test Community';
export const TEST_GROUP_NAME = 'BE Test Group';
export const PASSWORD = '1$orMore';

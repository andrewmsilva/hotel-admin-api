export class AccessToken {
  constructor(public accessToken: string) {}
}

export interface AccessTokenPayload {
  id: string;
  firstName: string;
  email: string;
}

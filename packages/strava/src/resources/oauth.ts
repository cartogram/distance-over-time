import {InitConfig, RefreshTokenResponse} from '../types'
import {STRAVA_URL} from '../constants'

export class Oauth {
  constructor(private config: InitConfig) {}

  async refreshTokens(token: InitConfig): Promise<RefreshTokenResponse> {
    if (!token) {
      throw new Error('No token provided')
    }
    const query: string = new URLSearchParams({
      // client_id: token.client_id,
      // client_secret: token.client_secret,
      refresh_token: token.refresh_token,
      grant_type: 'refresh_token',
    }).toString()

    const response = await fetch(
      `https://www.strava.com/oauth/token?${query}`,
      {
        method: 'post',
      },
    )
    if (!response.ok) {
      throw response
    }
    return (await response.json()) as RefreshTokenResponse
  }

  url(): string {
    const stravaSearchParams = new URLSearchParams({
      // client_id: this.config.client_id,
      response_type: 'code',
      redirect_uri: 'http://localhost:3000/connect',
      approval_prompt: 'force',
      scope: 'read',
    })

    return `${STRAVA_URL}?${stravaSearchParams.toString()}`
  }
}

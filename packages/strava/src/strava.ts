import {Request as LocalRequest} from './request'
import {
  Activities,
  Athletes,
  Clubs,
  Gears,
  Routes,
  RunningRaces,
  SegmentEfforts,
  Segments,
  Streams,
  Subscriptions,
  Uploads,
} from './resources'

import {DetailedAthlete} from './models'
import {Oauth} from './resources/oauth'
import {RefreshTokenRequest, InitConfig} from './types'
import {STRAVA_URL} from './constants'
import {type SessionStorage, type Session} from '@shopify/remix-oxygen'

export * from './types'
export * from './enums'
export * from './models'

export class Strava {
  private request: LocalRequest | null = null
  activities: Activities | null = null
  athletes: Athletes | null = null
  // clubs: Clubs | null = null
  // gears: Gears | null = null
  // oauth: Oauth | null = null
  // routes: Routes | null = null
  // runningRaces: RunningRaces | null = null
  // segmentEfforts: SegmentEfforts | null = null
  // segments: Segments | null = null
  // streams: Streams | null = null
  // subscriptions: Subscriptions | null = null
  // uploads: Uploads | null = null

  private cookie: string
  private session: Session | null = null
  public headers = new Headers()

  get accessToken(): string | null {
    if (!this.session) {
      return null
    }
    return this.session.get('accessToken')
  }

  set accessToken(accessToken: string | null) {
    if (!this.session) {
      return
    }

    this.session.set('accessToken', accessToken)
  }

  get refreshToken(): string | null {
    if (!this.session) {
      return null
    }
    return this.session.get('refreshToken')
  }

  set refreshToken(refreshToken: string | null) {
    if (!this.session) {
      return
    }
    this.session.set('refreshToken', refreshToken)
  }

  constructor(
    private config: RefreshTokenRequest,
    private storage: SessionStorage,
    request: Request,
  ) {
    this.request = new LocalRequest(config)
    this.cookie = request.headers.get('Cookie') || ''
  }

  public getOAuthRedirectUrl(): string {
    const stravaSearchParams = new URLSearchParams({
      client_id: this.config.client_id,
      response_type: 'code',
      redirect_uri: 'http://localhost:3000/connect',
      approval_prompt: 'force',
      scope: 'read,activity:read',
    })

    return `${STRAVA_URL}?${stravaSearchParams.toString()}`
  }

  async exchangeCodeForToken(code: string) {
    if (!code) {
      return {
        status: 400,
        statusText: 'Bad Request',
        headers: {},
        errors: [
          {
            message: 'Missing Strava oauth code',
            resource: 'Oauth',
            field: 'code',
            code: 'missing',
          },
        ],
      }
    }

    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.client_id,
        client_secret: this.config.client_secret,
        code,
        grant_type: 'authorization_code',
      }),
    })

    const {access_token, refresh_token, athlete, ...rest} =
      await response.json<{
        refresh_token: string
        access_token: string
        athlete: DetailedAthlete
      }>()

    console.log('what else?', rest)

    return {
      data: {
        access_token,
        refresh_token,
        athlete,
      },
      errors: [],
    }
  }

  async init(config: InitConfig) {
    this.session = await this.storage.getSession(this.cookie)
    this.accessToken = config.access_token
    this.refreshToken = config.refresh_token
    this.headers.set(
      'Set-Cookie',
      await this.storage.commitSession(this.session),
    )

    console.log('doing init', config)

    let status = 200

    if (config.redirect) {
      this.headers.set('Location', config.redirect)
      status = 302
    }

    if (!this.request) {
      return {
        headers: this.headers,
        status,
      }
    }

    this.activities = new Activities(this.request, config.access_token)
    this.athletes = new Athletes(this.request, config.access_token)

    console.log(await this.activities.getLoggedInAthleteActivities())
    return {
      headers: this.headers,
      status,
    }

    // this.clubs = new Clubs(this.request)
    // this.gears = new Gears(this.request)
    // // Maybe move all the oauth stuff out of here
    // this.oauth = new Oauth(config)
    // this.routes = new Routes(this.request)
    // this.runningRaces = new RunningRaces(this.request)
    // this.segmentEfforts = new SegmentEfforts(this.request)
    // this.segments = new Segments(this.request)
    // this.streams = new Streams(this.request)
    // this.subscriptions = new Subscriptions(this.request)
    // this.uploads = new Uploads(this.request)
    //   await context.strava.init({
    //     refresh_token,
    //     access_token,
    //   })
    //   console.log('access_token', access_token)
    //   console.log('refresh_token', refresh_token)
    //   context.session.set('stravaAccessStoken', access_token)
    //   context.session.set('stravaRefreshToken', refresh_token)
    //   // console.log(athlete)
    //   console.log(session)
    //   console.log(res)
    //   return redirect('/', {
    //     headers: {
    //       'Set-Cookie': await context.session.commit(),
    //     },
    //   })
    // }
  }
}

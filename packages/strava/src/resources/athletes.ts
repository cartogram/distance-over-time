import {ActivityStats, DetailedAthlete, Zones} from '../models'
import {Request} from '../request'

type getStatsRequest = {
  id: number
}

type UpdateLoggedInAthleteRequest = {
  weight: number
}

export class Athletes {
  private readonly request: Request
  private accessToken: string

  constructor(request: Request, accessToken: string) {
    this.request = request
    this.accessToken = accessToken
  }

  async getLoggedInAthlete(
    access_token: string = this.accessToken,
  ): Promise<DetailedAthlete> {
    return await this.request.makeApiRequest<DetailedAthlete>(
      'get',
      '/athlete',
      {access_token},
    )
  }

  async getLoggedInAthleteZones(
    access_token: string = this.accessToken,
  ): Promise<Zones> {
    return await this.request.makeApiRequest<Zones>('get', '/athlete/zones', {
      access_token,
    })
  }

  async getStats(
    params: getStatsRequest,
    access_token: string = this.accessToken,
  ): Promise<ActivityStats> {
    const {id} = params
    return await this.request.makeApiRequest<ActivityStats>(
      'get',
      `/athletes/${id}/stats`,
      {access_token},
    )
  }

  async updateLoggedInAthlete(
    params: UpdateLoggedInAthleteRequest,
    access_token: string = this.accessToken,
  ): Promise<DetailedAthlete> {
    return await this.request.makeApiRequest<DetailedAthlete>(
      'put',
      `/athlete`,
      {body: params, access_token},
    )
  }
}

import {
  redirect,
  type ActionFunction,
  type LoaderArgs,
} from '@shopify/remix-oxygen'

const CLIENT_ID = '73615'
const STRAVA_URL = `https://www.strava.com/oauth/authorize`

export const action: ActionFunction = async ({request}) => {
  const stravaSearchParams = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: 'http://localhost:3000/connect',
    approval_prompt: 'force',
    scope: 'read',
  })

  const stravaUrl = `${STRAVA_URL}?${stravaSearchParams.toString()}`

  return redirect(stravaUrl)
}

export async function loader({context, request}: LoaderArgs) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (code) {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: context.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    })

    const {access_token, refresh_token, athlete} = await response.json<{
      refresh_token: string
      access_token: string
      athlete: Record<string, unknown>
    }>()

    console.log('access_token', access_token)
    console.log('refresh_token', refresh_token)

    context.session.set('stravaAccessStoken', access_token)
    context.session.set('stravaRefreshToken', refresh_token)

    // console.log(athlete)

    console.log(session)
    console.log(res)
    return redirect('/', {
      headers: {
        'Set-Cookie': await context.session.commit(),
      },
    })
  }

  throw new Error('Connection failed')
}

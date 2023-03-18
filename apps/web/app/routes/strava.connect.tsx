import {
  redirect,
  type ActionFunction,
  type LoaderArgs,
} from '@shopify/remix-oxygen'
import {exchangeCodeForToken} from '~/lib/strava'

export async function loader({context, request}: LoaderArgs) {
  const {env, session} = context
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (!code) {
    throw new Error('No code returned from Strava')
  }

  const data = await exchangeCodeForToken<Record<string, string>>({
    client_id: env.PUBLIC_STRAVA_CLIENT_ID,
    client_secret: env.STRAVA_CLIENT_SECRET,
    code,
  })

  session.set('strava_refresh_token', data.refresh_token)
  session.set('strava_access_token', data.access_token)

  return redirect('/account', {
    headers: {
      'Set-Cookie': await session.commit(),
    },
  })
}

export default function Connect() {
  return <>Connecting to strava...</>
}

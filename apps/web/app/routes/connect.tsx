import {
  redirect,
  type ActionFunction,
  type LoaderArgs,
} from '@shopify/remix-oxygen'

const CLIENT_ID = '73615'
const STRAVA_URL = `https://www.strava.com/oauth/authorize`

export const action: ActionFunction = async ({context, request}) => {
  return redirect(getOAuthRedirectUrl(request.url))
}

export async function loader({context, request}: LoaderArgs) {
  const {customer} = context
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const step = url.searchParams.get('step')
  const athelete = url.searchParams.get('athelete')

  const stage = step ? parseInt(step, 10) : code ? 1 : 0

  return null
  // switch (stage) {
  //   case 0: {
  //     break
  //   }
  //   case 1: {
  //     if (!code) {
  //       throw new Error('No code returned from Strava')
  //     }

  //     const {data} = await strava.exchangeCodeForToken(code)

  //     if (!data) {
  //       throw new Error('No data returned from Strava')
  //     }

  //     const {headers, status} = await strava.init({
  //       refresh_token: data.refresh_token,
  //       access_token: data.access_token,
  //       redirect: `/connect?step=2&athelete=${JSON.stringify(data.athlete)}`,
  //     })

  //     return redirect(
  //       `/connect?step=2&athelete=${JSON.stringify(data.athlete)}`,
  //       {
  //         status,
  //         headers,
  //       },
  //     )
  //   }

  //   case 2: {
  //     if (!athelete) {
  //       throw new Error('No athelete data')
  //     }

  //     const {firstname, lastname, ...rest} = JSON.parse(athelete)

  //     console.log(rest)

  //     const {data, status, headers} = await customer.update(
  //       {
  //         firstName: firstname,
  //         // lastName: id,
  //         phone: null,
  //       },
  //       {redirect: '/account'},
  //     )

  //     console.log(data)

  //     return redirect(`/account`, {
  //       status,
  //       headers,
  //     })
  //   }
  // }

  // return new Response('Something went wrong in authentication flow', {
  //   status: 400,
  // })
}

function getOAuthRedirectUrl(url: string): string {
  const stravaSearchParams = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: url,
    approval_prompt: 'force',
    scope: 'read,activity:read',
  })

  return `${STRAVA_URL}?${stravaSearchParams.toString()}`
}

export default function Connect() {
  return <>Connect...</>
}

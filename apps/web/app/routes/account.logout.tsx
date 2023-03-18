import {
  redirect,
  type ActionFunction,
  type LoaderFunction,
} from '@shopify/remix-oxygen'

export const action: ActionFunction = async ({context}) => {
  const {customer, session} = context

  session.unset('strava_refresh_token')
  session.unset('strava_access_token')

  const result = await customer.logout()

  return redirect('/', {headers: result.headers})
}

export const loader: LoaderFunction = async ({context}) => {
  const {customer, session} = context

  session.unset('strava_refresh_token')
  session.unset('strava_access_token')

  const result = await customer.logout()

  return redirect('/', {headers: result.headers})
}

export default function Logout() {
  return null
}

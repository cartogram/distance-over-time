import {type LoaderArgs, defer} from '@shopify/remix-oxygen'
import {useRouteLoaderData, useLoaderData} from '@remix-run/react'
import {redirect} from '@shopify/remix-oxygen'
import {Main, Button, Box, Section} from '@cartogram/ui'
import type {DetailedAthlete, DetailedActivity} from 'strava'
import {getOAuthRedirectUrl} from '~/lib/strava'
import {Link} from '~/components'

export async function loader({context, request}: LoaderArgs) {
  const {customer, strava, session} = context

  if (!customer.isAuthenticated) return redirect('/')
  if (!session.get('strava_refresh_token'))
    return redirect(
      getOAuthRedirectUrl({
        base_url: new URL(request.url).origin,
        client_id: context.env.PUBLIC_STRAVA_CLIENT_ID,
      }),
    )

  return new Response(null)
}

export default function Account() {
  return (
    <Main>
      <Section>
        <form method="post" action="/account/logout">
          <Button type="submit">Log out</Button>
        </form>
      </Section>
    </Main>
  )
}

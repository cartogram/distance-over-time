import {type LoaderArgs, defer} from '@shopify/remix-oxygen'
import {useRouteLoaderData, useLoaderData} from '@remix-run/react'
import {redirect} from '@shopify/remix-oxygen'
import {Main, Text, Box, Section} from '@cartogram/ui'
import type {DetailedAthlete, DetailedActivity} from 'strava'
import {getOAuthRedirectUrl} from '~/lib/strava'
import {Link} from '~/components'

export async function loader({context, request, params}: LoaderArgs) {
  const {customer, strava, session} = context

  if (!customer.isAuthenticated) return redirect('/')
  if (!session.get('strava_refresh_token'))
    return redirect(
      getOAuthRedirectUrl({
        base_url: new URL(request.url).origin,
        client_id: context.env.PUBLIC_STRAVA_CLIENT_ID,
      }),
    )

  console.log('params', params)
  const activity = await strava?.activities.getActivityById({
    id: params.id,
  })

  console.log(activity, params)
  return defer({
    activity: {
      id: activity?.id,
      name: activity?.name,
      distance: activity?.distance,
      average_speed: activity?.average_speed,
      description: activity?.description,
      gear: activity?.gear,
      date: activity?.start_date_local,
    },
  })
}

export default function Activities() {
  const {activity} = useLoaderData()

  return (
    <Main>
      <pre>{JSON.stringify(activity, null, 2)}</pre>
    </Main>
  )
}

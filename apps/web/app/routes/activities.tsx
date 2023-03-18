import {type LoaderArgs, defer} from '@shopify/remix-oxygen'
import {useRouteLoaderData, useLoaderData} from '@remix-run/react'
import {redirect} from '@shopify/remix-oxygen'
import {Main, Text, Box, Section} from '@cartogram/ui'
import type {DetailedAthlete, DetailedActivity} from 'strava'
import {getOAuthRedirectUrl} from '~/lib/strava'
import {Link} from '~/components'

export async function loader({context, request}: LoaderArgs) {
  const {customer, strava, session} = context

  if (!customer.isAuthenticated) return redirect('/')
  if (!session.get('strava_refresh_token'))
    return redirect(
      getOAuthRedirectUrl({
        client_id: context.env.PUBLIC_STRAVA_CLIENT_ID,
      }),
    )

  const activities = await strava?.activities.getLoggedInAthleteActivities()

  return defer({activities})
}

export default function Activities() {
  const {athlete} = useRouteLoaderData('root') as {
    athlete: DetailedAthlete
  }

  const {activities} = useLoaderData()

  return (
    <Main>
      <ActivitiesList activities={activities} />
    </Main>
  )
}

function ActivitiesList({activities}: {activities: DetailedActivity[]}) {
  return (
    <div className="Section__full">
      <Box>
        {activities.map((activity) => (
          <div className="Activity" key={activity.id}>
            <Link to="">
              <Text as="span" className="Activity__title">
                {activity.name}
              </Text>
              <Text as="span" className="Activity__distance">
                {activity.distance}
              </Text>
              <Text as="span" className="Activity__time">
                {activity.average_speed}
              </Text>
            </Link>
          </div>
        ))}
      </Box>
    </div>
  )
}

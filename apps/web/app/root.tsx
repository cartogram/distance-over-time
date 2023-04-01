import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from '@remix-run/react'
import styles from '~/styles.css'
import ui from '@cartogram/ui/index.css'
import {Box, Button, Avatar} from '@cartogram/ui'
import {Header, Link, Error} from '~/components'
import type {Shop} from '@shopify/hydrogen/storefront-api-types'
import {type LoaderArgs, type MetaFunction, defer} from '@shopify/remix-oxygen'

export const links = () => [
  {rel: 'stylesheet', href: ui},
  {rel: 'stylesheet', href: styles},
]

export const meta: MetaFunction = () => {
  return {title: 'DOT'}
}

export async function loader({context}: LoaderArgs) {
  const shop = await context.storefront.query<{shop: Shop}>(QUERY)
  const customer = await context.customer.get()
  const athlete = context.strava
    ? await context.strava.athletes.getLoggedInAthlete()
    : null

  return defer({shop, customer, athlete})
}

export default function App() {
  const {customer, athlete} = useLoaderData()

  const links = customer
    ? [
        {content: 'Activities', href: '/activities'},
        {content: 'Events', href: '/events'},
      ]
    : [
        {content: 'Log in', href: '/account/login'},
        {content: 'Join', href: '/account/join'},
      ]

  const User = athlete ? (
    <>
      <Link to="/account">
        <Avatar shape="" source={athlete.profile_medium} />
      </Link>
    </>
  ) : null

  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
        <Header nav={links}>{User}</Header>

        <Outlet />
        <ScrollRestoration />
        <Scripts />
        {/* <LiveReload /> */}
      </body>
    </html>
  )
}

export function ErrorBoundary({error}: {error: Error}) {
  console.error(error)
  return (
    <html lang="en">
      <head>
        <title>Error</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Header />
        <Error error={error} />
        <Scripts />
      </body>
    </html>
  )
}

const QUERY = `#graphql
  query shop(
    $country: CountryCode
  ) @inContext(country: $country) {
    shop {
      name
      description
      brand {
        slogan
        shortDescription
      }
    }

  }
`

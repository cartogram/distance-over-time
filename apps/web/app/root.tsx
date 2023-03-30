import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import styles from '~/styles.css'
import ui from '@cartogram/ui/index.css'
import type {Shop} from '@shopify/hydrogen/storefront-api-types'
import {type LoaderArgs, type MetaFunction, defer} from '@shopify/remix-oxygen'

export const links = () => [
  {
    rel: 'stylesheet',
    href: 'https://api.fontshare.com/v2/css?f[]=jet-brains-mono@1,2&display=swap',
  },
  {rel: 'stylesheet', href: styles},
  {rel: 'stylesheet', href: ui},
]

export const meta: MetaFunction = () => {
  return {title: 'New Remix App'}
}

export async function loader({context, request}: LoaderArgs) {
  console.log('root loader')
  const shop = await context.storefront.query<{shop: Shop}>(QUERY)
  const customer = await context.customer.get()

  console.log(customer)

  return defer({shop, customer})
}

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="h-full">
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
        <title>Oh no!</title>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>Oh no!</h1>
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

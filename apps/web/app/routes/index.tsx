import type {Shop} from '@shopify/hydrogen/storefront-api-types'
import {type LoaderArgs, defer} from '@shopify/remix-oxygen'
import {useLoaderData} from '@remix-run/react'
import {Header} from '~/components'
import {Main, Button} from '@cartogram/ui'

export async function loader({context}: LoaderArgs) {
  const {shop} = await context.storefront.query<{shop: Shop}>(QUERY)

  return defer({shop})
}

export default function Index() {
  const {shop} = useLoaderData()
  const {name, description} = shop
  return (
    <Main>
      <Header />
      <h1>
        {name}
        {description}
      </h1>
      <Button href="mailto:distanceovertime@gmail.com">Get in touch</Button>
    </Main>
  )
}

export function ErrorBoundary({error}) {
  console.log(error)
  return (
    <Main>
      <h1>Application error.</h1>
      <p>Something went wrong.</p>

      {process.env.NODE_ENV === 'development' && (
        <pre style={{maxWidth: 400, whiteSpace: 'normal'}}>
          <code>{error.message}</code>
        </pre>
      )}
    </Main>
  )
}

const QUERY = `#graphql
  query shop(
    $country: CountryCode
  ) @inContext(country: $country) {
    shop {
      name
      description
    }
  }
`

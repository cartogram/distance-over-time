import {Main} from '@cartogram/ui'
import type {Shop, Customer} from '@shopify/hydrogen/storefront-api-types'
import type {DetailedAthlete} from 'strava'

export default function Index() {
  return <Main></Main>
}

export function ErrorBoundary({error}: {error: Error}) {
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
      brand {
        slogan
        shortDescription
      }
    }

  }
`

import {useLoaderData, Link} from '@remix-run/react'
import {LoaderArgs, defer} from '@shopify/remix-oxygen'
import {Header} from '~/components'
import {Main, Text, Box, Button} from '@cartogram/ui'
import {useOptionalUser} from '~/lib/user'
import {Shop} from '@shopify/hydrogen/storefront-api-types'

export async function loader({context}: LoaderArgs) {
  const {shop} = await context.storefront.query<{shop: Shop}>(QUERY)

  return defer({shop})
}

export default function Index() {
  const user = useOptionalUser()
  const {
    shop: {brand},
  } = useLoaderData<{shop: Shop}>()

  console.log(user)

  return (
    <Main>
      <Header />
      <pre>{JSON.stringify(user, null, 2)}</pre>
      <Box>
        <Text>{brand?.slogan}</Text>
      </Box>
      <Box>
        <Text>{brand?.shortDescription}</Text>
      </Box>
      <Box>
        <Button>
          <Link to="/join">Join</Link>
        </Button>
      </Box>
    </Main>
  )
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

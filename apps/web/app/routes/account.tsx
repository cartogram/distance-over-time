import type {LoaderArgs, MetaFunction} from '@shopify/remix-oxygen'
import {json, redirect} from '@shopify/remix-oxygen'
import {Form, Link, useLoaderData, useSearchParams} from '@remix-run/react'
import {Main, Text, Box, Button} from '@cartogram/ui'
import {Header} from '~/components'
import {z, ZodError} from 'zod'

export const meta: MetaFunction = () => {
  return {
    title: 'Sign Up',
  }
}

interface ActionData {
  errors: {
    email?: string
    password?: string
  }
}

export async function loader({context}: LoaderArgs) {
  const {customer} = context

  if (!customer.isAuthenticated) return redirect('/')

  return json({
    customer: customer.details,
  })
}

export default function Dashboard() {
  const {customer} = useLoaderData()

  return (
    <Main>
      <Header />
      <Box>
        <Text>Dashboard</Text>
      </Box>
      <Box>
        <Text block as="span">
          Email Address
        </Text>
      </Box>
      <Box>
        <pre>{JSON.stringify(customer, null, 2)}</pre>{' '}
      </Box>
      <Box>
        <Button type="submit">Update</Button>
      </Box>
    </Main>
  )
}

import {useRef, useEffect} from 'react'
import type {
  ActionFunction,
  LoaderArgs,
  MetaFunction,
} from '@shopify/remix-oxygen'
import {json, redirect} from '@shopify/remix-oxygen'
import {Form, Link, useActionData, useSearchParams} from '@remix-run/react'
import {Main, Text, Box, Button, Section} from '@cartogram/ui'
import {z} from 'zod'

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

const schema = z.object({
  email: z.string().email(),
})

export async function loader({context}: LoaderArgs) {
  const {customer} = context

  if (customer.isAuthenticated) return redirect('/')

  return json({})
}

export const action: ActionFunction = async ({request, context}) => {
  const formData = await request.formData()
  const {customer, session} = context

  const {email} = schema.parse({
    email: formData.get('email'),
  })

  const {status, headers} = await customer.recover({
    email,
  })

  return redirect('/account/reset', {status, headers})
}

export default function Join() {
  const actionData = useActionData() as ActionData
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef?.current?.focus()
    }
  }, [actionData])

  return (
    <Main>
      <Section>
        <Box>
          <Text>Recover password</Text>
        </Box>
        <Form method="post" noValidate>
          <Box>
            <label htmlFor="password">
              <Text block as="em">
                Email
              </Text>
              {actionData?.errors?.email && (
                <Text block as="span" id="email-error">
                  {actionData?.errors?.email}
                </Text>
              )}
            </label>
            <input
              type="email"
              name="email"
              id="email"
              required
              aria-invalid={actionData?.errors?.email ? true : undefined}
              aria-describedby="email-error"
              ref={emailRef}
            />
          </Box>
          <Box>
            <Button type="submit">Send recovery email</Button>
          </Box>

          <Button>
            <Link to={{pathname: '/account/join'}}>Back to login</Link>
          </Button>
        </Form>
      </Section>
    </Main>
  )
}

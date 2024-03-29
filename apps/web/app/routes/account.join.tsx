import {useRef, useEffect} from 'react'
import type {
  ActionFunction,
  LoaderArgs,
  MetaFunction,
} from '@shopify/remix-oxygen'
import {json, redirect} from '@shopify/remix-oxygen'
import {Form, Link, useActionData, useSearchParams} from '@remix-run/react'
import {Main, Text, Box, Button, Section} from '@cartogram/ui'
import {Header} from '~/components'
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
  password: z.string(),
  redirectTo: z.string().optional(),
})

export async function loader({context}: LoaderArgs) {
  const {customer} = context

  if (customer.isAuthenticated) return redirect('/account')

  return json({})
}

export const action: ActionFunction = async ({request, context}) => {
  const formData = await request.formData()

  const {
    email,
    password,
    redirectTo = '/account',
  } = schema.parse({
    email: formData.get('email'),
    password: formData.get('password'),
    redirectTo: formData.get('redirectTo'),
  })

  const {data, headers, status} = await context.customer.create({
    email,
    password,
  })

  if (status !== 400) {
    return json(data)
  }

  return redirect(redirectTo, {headers})
}

export default function Join() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') ?? undefined

  const actionData = useActionData() as ActionData
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef?.current?.focus()
    } else if (actionData?.errors?.password) {
      passwordRef?.current?.focus()
    }
  }, [actionData])

  return (
    <Main>
      <Section>
        <Box>
          <Text>Join</Text>
        </Box>
        <Form method="post" noValidate>
          <Box>
            <label htmlFor="email">
              <Text block as="span">
                Email Address
              </Text>
              {actionData?.errors?.email && (
                <Text block as="em" id="email-error">
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
            <label htmlFor="password">
              <Text block as="em">
                Password
              </Text>
              {actionData?.errors?.password && (
                <Text block as="span" id="password-error">
                  {actionData?.errors?.password}
                </Text>
              )}
            </label>
            <input
              id="password"
              type="password"
              name="password"
              autoComplete="new-password"
              aria-invalid={actionData?.errors?.password ? true : undefined}
              aria-describedby="password-error"
              ref={passwordRef}
            />
          </Box>
          <Box>
            <Button type="submit">Create Account</Button>
          </Box>
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <Text>
            Already have an account?{' '}
            <Button>
              <Link
                to={{
                  pathname: '/account/login',
                  search: searchParams.toString(),
                }}
              >
                Log in
              </Link>
            </Button>
          </Text>
        </Form>
      </Section>
    </Main>
  )
}

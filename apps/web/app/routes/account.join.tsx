import {useRef, useEffect} from 'react'
import type {
  ActionFunction,
  LoaderArgs,
  MetaFunction,
} from '@shopify/remix-oxygen'
import {json, redirect} from '@shopify/remix-oxygen'
import {Form, Link, useActionData, useSearchParams} from '@remix-run/react'
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

const schema = z.object({
  email: z.string().email(),
  password: z.string(),
  redirectTo: z.string().optional(),
})

export async function loader({context}: LoaderArgs) {
  const {customer} = context

  if (customer.isAuthenticated) return redirect('/')

  return json({})
}

export const action: ActionFunction = async ({request, context}) => {
  const formData = await request.formData()
  const {session, customer} = context

  try {
    const {
      email,
      password,
      redirectTo = new URL(request.url).pathname,
    } = schema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: formData.get('redirectTo'),
    })

    await customer.create({
      email,
      password,
    })

    return null
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return json({
        errors: error.errors.reduce((acc, error) => {
          acc[error.path[0]] = error.message

          return acc
        }, {} as Record<string, string>),
      })
    }

    console.log(error)

    return json({
      errors: {
        email: 'Unable to create user',
      },
    })
  }
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
      <Header />
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
    </Main>
  )
}

import {useRef, useEffect} from 'react'
import type {
  ActionFunction,
  LoaderArgs,
  MetaFunction,
} from '@shopify/remix-oxygen'
import {json, redirect} from '@shopify/remix-oxygen'
import {Form, useActionData, useSearchParams} from '@remix-run/react'
import {Main, Text, Box, Button, Section} from '@cartogram/ui'
import {z, ZodError} from 'zod'
import {Link} from '~/components'

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
  password: z.string().min(6),
  redirectTo: z.string().optional(),
  remember: z.boolean().optional(),
})

export async function loader({context}: LoaderArgs) {
  const {customer} = context

  if (customer.isAuthenticated) return redirect('/account')

  return json({})
}

export const action: ActionFunction = async ({request, context}) => {
  const formData = await request.formData()
  const {customer, session} = context

  try {
    const {
      email,
      password,
      redirectTo = '/account',
    } = schema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
      redirectTo: formData.get('redirectTo'),
      remember: Boolean(formData.get('remember')),
    })

    const {data, headers, status} = await customer.authenticate({
      email,
      password,
    })

    if (data.errors.length) {
      return json(
        {
          errors: {
            email: data.errors[0].message,
          },
        },
        {status, headers},
      )
    }

    return redirect(redirectTo, {headers})
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return json({
        errors: error.errors.reduce((acc, error) => {
          acc[error.path[0]] = error.message

          return acc
        }, {} as Record<string, string>),
      })
    }

    return json({
      errors: {
        email: 'Unable to authenticate user',
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
      <Section>
        <Box>
          <Text>Log in</Text>
        </Box>
        <Form method="post" noValidate>
          <Box>
            <label htmlFor="email">
              <Text block as="em">
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
            <Button type="submit">Log in</Button>
          </Box>

          <input type="hidden" name="redirectTo" value={redirectTo} />

          <Box>
            <Text>
              Don`t have an account?{' '}
              <Button>
                <Link
                  className="text-blue-500 underline"
                  to={{pathname: '/account/join'}}
                >
                  Join
                </Link>
              </Button>
            </Text>
          </Box>
          <Box>
            <Link to="/account/recover">Forgot your password</Link>
          </Box>
        </Form>
      </Section>
    </Main>
  )
}

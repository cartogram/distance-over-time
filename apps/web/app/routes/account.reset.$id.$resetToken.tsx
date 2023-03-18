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
  password: z.string().min(6),
})

export async function loader({context}: LoaderArgs) {
  const {customer} = context

  if (customer.isAuthenticated) return redirect('/')

  return json({})
}

export const action: ActionFunction = async ({
  request,
  context,
  params: {id, resetToken},
}) => {
  const formData = await request.formData()
  const {customer, session} = context

  console.log('id', id)
  console.log('resetToken', resetToken)

  if (!id || !resetToken) {
    return json({
      errors: {
        email: 'Missing token or id',
      },
    })
  }

  try {
    const {password} = schema.parse({
      password: formData.get('password'),
    })

    const {data, headers, status} = await customer.reset({
      password,
      id,
      resetToken,
    })

    return redirect('/dashboard', {
      headers,
      status,
    })
  } catch (error: unknown) {
    console.log(error)

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
      <Header />
      <Box>
        <Text>Reset password</Text>
      </Box>
      <Form method="post" noValidate>
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
          <input
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            id="remember"
            name="remember"
            type="checkbox"
          />
          <label
            className="ml-2 block text-sm text-gray-900"
            htmlFor="remember"
          >
            <Text as="span">Remember me</Text>
          </label>
        </Box>
        <Box>
          <Button type="submit">Log in</Button>
        </Box>

        <input type="hidden" name="redirectTo" value={redirectTo} />
        <Text>
          Don`t have an account?{' '}
          <Button>
            <Link className="text-blue-500 underline" to={{pathname: '/join'}}>
              Join
            </Link>
          </Button>
        </Text>
      </Form>
    </Main>
  )
}

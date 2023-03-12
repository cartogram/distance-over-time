// Virtual entry point for the app
import * as remixBuild from '@remix-run/dev/server-build'
import {createStorefrontClient, storefrontRedirect} from '@shopify/hydrogen'
import {
  createRequestHandler,
  getBuyerIp,
  createCookieSessionStorage,
  redirect,
  type CookieSerializeOptions,
  type SessionStorage,
  type Session,
} from '@shopify/remix-oxygen'
import {type AppLoadContext} from '@shopify/remix-oxygen'
import type {
  CustomerAccessTokenCreatePayload,
  CustomerCreatePayload,
  CustomerUpdatePayload,
  CustomerRecoverPayload,
  CustomerResetPayload,
  CustomerUserError,
  Customer,
} from '@shopify/hydrogen/storefront-api-types'

/**
 * Export a fetch handler in module format.
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    executionContext: ExecutionContext,
  ): Promise<Response> {
    try {
      /**
       * Open a cache instance in the worker and a custom session instance.
       */
      if (!env?.SESSION_SECRET) {
        throw new Error('SESSION_SECRET environment variable is not set')
      }

      const waitUntil = (p: Promise<any>) => executionContext.waitUntil(p)
      const [cache, session] = await Promise.all([
        caches.open('hydrogen'),
        HydrogenSession.init(request, [env.SESSION_SECRET]),
      ])

      /**
       * Create Hydrogen's Storefront client.
       */
      const {storefront} = createStorefrontClient({
        cache,
        waitUntil,
        buyerIp: getBuyerIp(request),
        i18n: {language: 'EN', country: 'US'},
        publicStorefrontToken: env.PUBLIC_STOREFRONT_API_TOKEN,
        privateStorefrontToken: env.PRIVATE_STOREFRONT_API_TOKEN,
        storeDomain: `https://${env.PUBLIC_STORE_DOMAIN}`,
        storefrontApiVersion: env.PUBLIC_STOREFRONT_API_VERSION || '2023-01',
        storefrontId: env.PUBLIC_STOREFRONT_ID,
        requestGroupId: request.headers.get('request-id'),
      })

      /**
       * Create a Hydrogen Customer client.
       */
      const customer = new CustomerContext(storefront, session)

      /**
       * Create a Remix request handler and pass
       * Hydrogen's Storefront client to the loader context.
       */
      const handleRequest = createRequestHandler({
        build: remixBuild,
        mode: process.env.NODE_ENV,
        getLoadContext: () => ({session, customer, storefront, env}),
      })

      const response = await handleRequest(request)

      if (response.status === 404) {
        /**
         * Check for redirects only when there's a 404 from the app.
         * If the redirect doesn't exist, then `storefrontRedirect`
         * will pass through the 404 response.
         */
        return storefrontRedirect({request, response, storefront})
      }

      return response
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error)
      return new Response('An unexpected error occurred', {status: 500})
    }
  },
}

/**
 * This is a custom session implementation for your Hydrogen shop.
 * Feel free to customize it to your needs, add helper methods, or
 * swap out the cookie-based implementation with something else!
 */
export class HydrogenSession {
  constructor(
    private sessionStorage: SessionStorage,
    private session: Session,
  ) {}

  static async init(request: Request, secrets: string[]) {
    const storage = createCookieSessionStorage({
      cookie: {
        name: 'session',
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secrets,
      },
    })

    const session = await storage.getSession(request.headers.get('Cookie'))

    return new this(storage, session)
  }

  get(key: string) {
    return this.session.get(key)
  }

  destroy() {
    return this.sessionStorage.destroySession(this.session)
  }

  flash(key: string, value: any) {
    this.session.flash(key, value)
  }

  unset(key: string) {
    this.session.unset(key)
  }

  set(key: string, value: any) {
    this.session.set(key, value)
  }

  commit(options?: CookieSerializeOptions) {
    console.log('commit', this.session.get('accessToken'))
    return this.sessionStorage.commitSession(this.session, options)
  }
}

type Storefront = AppLoadContext['storefront']

export type AuthenticationResult = {
  success?: boolean
  errors?: CustomerUserError[]
}

export type AuthenticationOptions = {
  successRedirect?: string
}

export class CustomerContext {
  constructor(
    private storefront: Storefront,
    private session: HydrogenSession,
  ) {}

  get accessToken() {
    console.log('get accessToken', this.session.get('accessToken'))
    return this.session.get('accessToken')
  }

  set accessToken(accessToken: string) {
    console.log('set accessToken', accessToken)
    this.session.set('accessToken', accessToken)
  }

  get isAuthenticated() {
    console.log('isAuthenticated', Boolean(this.accessToken))
    return Boolean(this.accessToken)
  }

  async logout(options: AuthenticationOptions = {}) {
    this.session.unset('accessToken')

    return redirect(options.successRedirect ?? '/', {
      headers: {
        'Set-Cookie': await this.session.commit(),
      },
    })
  }

  async authenticate(
    customer: {email: string; password: string},
    options: AuthenticationOptions = {},
  ): Promise<AuthenticationResult> {
    if (this.isAuthenticated) {
      redirect(options?.successRedirect ?? '/', {
        headers: {
          'Set-Cookie': await this.session.commit(),
        },
      })

      return {success: true}
    }

    console.log('authenticate', customer)

    const data = await this.storefront.mutate<{
      customerAccessTokenCreate: CustomerAccessTokenCreatePayload
    }>(this.LOGIN_MUTATION, {
      variables: {
        input: customer,
      },
    })

    if (data?.customerAccessTokenCreate?.customerAccessToken?.accessToken) {
      this.accessToken =
        data.customerAccessTokenCreate.customerAccessToken.accessToken

      redirect(options?.successRedirect ?? '/', {
        headers: {
          'Set-Cookie': await this.session.commit(),
        },
      })

      return {success: true}
    }

    console.log('errors')
    console.log(
      data.customerAccessTokenCreate.customerUserErrors.map((e) => e.message),
    )

    return {
      success: false,
      errors: data?.customerAccessTokenCreate?.customerUserErrors,
    }
  }

  async create(customer: {
    email: string
    password: string
  }): Promise<AuthenticationResult> {
    if (this.isAuthenticated) {
      return {
        success: false,
        errors: [
          {
            message: 'Customer already authenticated',
          },
        ],
      }
    }

    const data = await this.storefront.mutate<{
      customerCreate: CustomerCreatePayload
    }>(this.CUSTOMER_CREATE_MUTATION, {
      variables: {
        input: customer,
      },
    })

    if (data?.customerCreate?.customer?.id) {
      return this.authenticate(customer)
    }

    return {
      success: false,
      errors: data?.customerCreate?.customerUserErrors,
    }
  }

  async update(
    customer: Record<string, unknown>,
  ): Promise<AuthenticationResult> {
    if (!this.isAuthenticated) {
      return {
        success: false,
        errors: [
          {
            message: 'Customer is not authenticated',
          },
        ],
      }
    }

    const data = await this.storefront.mutate<{
      customerUpdate: CustomerUpdatePayload
    }>(this.CUSTOMER_UPDATE_MUTATION, {
      variables: {
        input: customer,
      },
    })

    return {
      success: false,
      errors: data?.customerUpdate?.customerUserErrors,
    }
  }

  async recover(customer: {email: string}): Promise<AuthenticationResult> {
    const data = await this.storefront.mutate<{
      customerRecover: CustomerRecoverPayload
    }>(this.CUSTOMER_RECOVER_MUTATION, {
      variables: {
        input: customer,
      },
    })

    return {
      success: false,
      errors: data?.customerRecover?.customerUserErrors,
    }
  }

  async reset(
    customer: {id: string; password: string; resetToken: string},
    options: AuthenticationOptions = {},
  ): Promise<AuthenticationResult> {
    const data = await this.storefront.mutate<{
      customerReset: CustomerResetPayload
    }>(this.CUSTOMER_RESET_MUTATION, {
      variables: {
        id: `gid://shopify/Customer/${customer.id}`,
        input: customer,
      },
    })

    if (
      data.customerReset?.customerAccessToken?.accessToken &&
      data.customerReset?.customer?.email
    ) {
      const email = data.customerReset.customer.email
      this.accessToken = data.customerReset.customerAccessToken.accessToken

      return this.authenticate({email, password: customer.password}, options)
    }

    return {
      success: false,
      errors: data?.customerReset?.customerUserErrors,
    }
  }

  private LOGIN_MUTATION = `#graphql
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerUserErrors {
          code
          field
          message
        }
        customerAccessToken {
          accessToken
          expiresAt
        }
      }
    }
    `

  private CUSTOMER_CREATE_MUTATION = `#graphql
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }
    `

  private CUSTOMER_UPDATE_MUTATION = `#graphql
    mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
      customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
        customerUserErrors {
          code
          field
          message
        }
      }
    }
    `

  private CUSTOMER_RECOVER_MUTATION = `#graphql
    mutation customerRecover($email: String!) {
      customerRecover(email: $email) {
        customerUserErrors {
          code
          field
          message
        }
      }
    }
  `

  private CUSTOMER_RESET_MUTATION = `#graphql
    mutation customerReset($id: ID!, $input: CustomerResetInput!) {
      customerReset(id: $id, input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
        customer {
          id
          email
        }
      }
    }
    `
}

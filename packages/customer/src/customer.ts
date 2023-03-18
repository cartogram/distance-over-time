import type {
  Cart as CartType,
  CartInput,
  CustomerCreatePayload,
  UserError,
  CustomerRecoverPayload,
  CustomerResetPayload,
  CustomerUserError,
  CustomerUpdatePayload,
  CustomerResetInput,
  CustomerCreateInput,
  Customer as CustomerType,
  CustomerAccessTokenCreatePayload,
  MutationCustomerRecoverArgs,
  MutationCustomerResetArgs,
  MutationCustomerUpdateArgs,
  MutationCustomerCreateArgs,
  CustomerAccessTokenCreateInput,
} from '@shopify/hydrogen/storefront-api-types'
import {createStorefrontClient} from '@shopify/hydrogen'
import {type SessionStorage, type Session} from '@shopify/remix-oxygen'

type Storefront = ReturnType<typeof createStorefrontClient>['storefront']

interface CustomerOptions {
  customerFragment?: string
}

interface Result {
  // | CustomerAccessTokenCreatePayload
  // | CustomerCreatePayload
  // | CustomerUpdatePayload
  token?: string
  customer?: CustomerType | null
  errors: CustomerUserError[]
}

interface OperationOptions {
  redirect?: string
}

export class Customer {
  private customerFragment: string
  public headers = new Headers()

  constructor(
    private sessionStorage: SessionStorage,
    private session: Session,
    private storefront: Storefront,
    options: CustomerOptions,
  ) {
    this.customerFragment = options.customerFragment || customerFragment
  }

  get profile(): CustomerType | null {
    if (!this.isAuthenticated) {
      return null
    }

    return this.session.get('customer')
  }

  set profile(customer: CustomerType | null) {
    this.session.set('customer', customer)
  }

  get token() {
    return this.session.get('token')
  }

  set token(token: string) {
    this.session.set('token', token)
  }

  get isAuthenticated() {
    return Boolean(this.token)
  }

  async get() {
    console.log('get customer', this.token)
    if (!this.isAuthenticated) {
      return null
    }

    const {customer} = await this.storefront.query<{
      customer: CustomerType
    }>(customerQuery(this.customerFragment), {
      variables: {
        customerAccessToken: this.token,
      },
    })

    return customer
  }

  async authenticate(
    input: CustomerAccessTokenCreateInput,
    options: OperationOptions = {},
  ) {
    if (this.isAuthenticated) {
      const response = await this.respond(
        {errors: [], customer: this.profile},
        options,
      )

      return response
    }

    console.log('authenticate', input)

    const {customerAccessTokenCreate} = await this.storefront.mutate<{
      customerAccessTokenCreate: CustomerAccessTokenCreatePayload
    }>(loginMutation(), {
      variables: {input},
    })

    const response = await this.respond(
      {
        token: customerAccessTokenCreate?.customerAccessToken?.accessToken,
        customer: this.profile,
        errors: customerAccessTokenCreate.customerUserErrors,
      },
      options,
    )

    return response
  }

  async create(input: CustomerCreateInput, options: OperationOptions = {}) {
    if (this.isAuthenticated) {
      const response = this.respond(
        {
          errors: [
            {
              message: 'Customer already authenticated',
            },
          ],
        },
        options,
      )

      return response
    }

    const data = await this.storefront.mutate<{
      customerCreate: CustomerCreatePayload
    }>(customerCreateMutation(this.customerFragment), {
      variables: {
        input,
      },
    })

    if (data?.customerCreate?.customer?.id) {
      return this.authenticate(input, options)
    }

    return this.respond(
      {
        errors: data.customerCreate?.customerUserErrors,
      },
      options,
    )
  }

  async update(
    input: MutationCustomerUpdateArgs,
    options: OperationOptions = {},
  ) {
    if (this.isAuthenticated) {
      const response = this.respond(
        {
          errors: [
            {
              message: 'Customer already authenticated',
            },
          ],
        },
        options,
      )

      return response
    }

    const {customerUpdate} = await this.storefront.mutate<{
      customerUpdate: CustomerUpdatePayload
    }>(customerUpdateMutation(this.customerFragment), {
      variables: {
        input,
      },
    })

    const response = await this.respond(
      {
        customer: customerUpdate.customer,
        errors: customerUpdate.customerUserErrors,
      },
      options,
    )

    return response
  }

  async recover(
    customer: MutationCustomerRecoverArgs,
    options: OperationOptions = {},
  ) {
    console.log('recover', customer)

    const {customerRecover} = await this.storefront.mutate<{
      customerRecover: CustomerRecoverPayload
    }>(customerRecoverMutation(this.customerFragment), {
      variables: customer,
    })

    const response = await this.respond(
      {
        errors: customerRecover.customerUserErrors,
      },
      options,
    )

    return response
  }

  async reset(
    input: CustomerResetInput & {id: string},
    options: OperationOptions = {},
  ) {
    const {customerReset} = await this.storefront.mutate<{
      customerReset: CustomerResetPayload
    }>(customerResetMutation(this.customerFragment), {
      variables: {
        id: `gid://shopify/Customer/${input.id}`,
        input: {
          password: input.password,
          resetToken: input.resetToken,
        },
      },
    })

    if (customerReset?.customer?.id) {
      return this.authenticate(
        {
          email: customerReset.customer.email || '',
          password: input.password,
        },
        options,
      )
    }

    return this.respond(
      {
        errors: customerReset?.customerUserErrors,
      },
      options,
    )
  }

  async addresses(): Promise<Customer | null> {
    // TODO: implement
    return Promise.resolve(null)
  }

  async orders(): Promise<Customer | null> {
    // TODO: implement
    return Promise.resolve(null)
  }

  async logout(options: OperationOptions = {}) {
    this.session.unset('token')
    this.session.unset('customer')
    let status = 200

    this.headers.set(
      'Set-Cookie',
      await this.sessionStorage.commitSession(this.session),
    )

    if (options?.redirect) {
      this.headers.set('Location', options.redirect)
      status = 302
    }

    return {headers: this.headers, status}
  }

  static async init(
    request: Request,
    storefront: Storefront,
    storage: SessionStorage,
    options: CustomerOptions = {},
  ) {
    const session = await storage.getSession(request.headers.get('Cookie'))
    return new this(storage, session, storefront, options)
  }

  private async respond(
    result: Result,
    options: OperationOptions = {},
  ): Promise<{data: Result; headers: Headers; status: number}> {
    let status = 200

    if (result.errors?.length) {
      status = 400
    }

    if (options?.redirect) {
      this.headers.set('Location', options.redirect)
      status = 302
    }

    this.token = result?.token || this.token
    this.profile = result?.customer || (await this.get()) || this.profile
    this.headers.set(
      'Set-Cookie',
      await this.sessionStorage.commitSession(this.session),
    )

    return {data: result, headers: this.headers, status}
  }
}

/**
 * QUERIES
 */
export const customerQuery = (
  customerFragment: string,
): string => /* GraphQL */ `
  query Customer($customerAccessToken: String!) {
    customer(customerAccessToken: $customerAccessToken) {
      ...Customer
    }
  }
  ${customerFragment}
`

/**
 * FRAGMENTS
 */
export const customerFragment = /* GraphQL */ `
  fragment Customer on Customer {
    id
    firstName
    lastName
    phone
    email
    defaultAddress {
      id
      formatted
      firstName
      lastName
      company
      address1
      address2
      country
      province
      city
      zip
      phone
    }
  }
`

export const errorFragment = /* GraphQL */ `
  fragment Error on CustomerUserError {
    message
    field
    code
  }
`

/**
 * MUTATIONS
 */
export const loginMutation = (): string => /* GraphQL */ `
  mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
    customerAccessTokenCreate(input: $input) {
      customerUserErrors {
        ...Error
      }
      customerAccessToken {
        accessToken
        expiresAt
      }
    }
  }
  ${errorFragment}
`

export const customerCreateMutation = (
  customerFragment: string,
): string => /* GraphQL */ `
  mutation customerCreate($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        ...Customer
      }
      customerUserErrors {
        ...Error
      }
    }
  }
  ${customerFragment}
  ${errorFragment}
`

export const customerUpdateMutation = (
  customerFragment: string,
): string => /* GraphQL */ `
  mutation customerUpdate(
    $customerAccessToken: String!
    $customer: CustomerUpdateInput!
  ) {
    customerUpdate(
      customerAccessToken: $customerAccessToken
      customer: $customer
    ) {
      customerUserErrors {
        ...Error
      }
      customer {
        ...Customer
      }
    }
  }
  ${customerFragment}
  ${errorFragment}
`

export const customerRecoverMutation = (
  customerFragment: string,
): string => /* GraphQL */ `
  mutation customerRecover($email: String!) {
    customerRecover(email: $email) {
      customerUserErrors {
        ...Error
      }
    }
  }
  ${errorFragment}
`

export const customerResetMutation = (
  customerFragment: string,
): string => /* GraphQL */ `
  mutation customerReset($id: ID!, $input: CustomerResetInput!) {
    customerReset(id: $id, input: $input) {
      customerAccessToken {
        accessToken
        expiresAt
      }
      customerUserErrors {
        ...Error
      }
      customer {
        ...Customer
      }
    }
  }
  ${customerFragment}
  ${errorFragment}
`

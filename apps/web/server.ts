// Virtual entry point for the app
import * as remixBuild from '@remix-run/dev/server-build'
import {createStorefrontClient, storefrontRedirect} from '@shopify/hydrogen'
import {
  createRequestHandler,
  getBuyerIp,
  createCookieSessionStorage,
  type CookieSerializeOptions,
  type SessionStorage,
  type Session,
} from '@shopify/remix-oxygen'
import {Customer} from '@cartogram/customer'
import {Strava} from 'strava'

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

      const customer = new Customer(
        storefront,
        {
          get: (val) => {
            return session.get(val)
          },
          set: (key, val) => {
            return session.set(key, val)
          },
          remove: (val) => {
            return session.unset(val)
          },
          commit: () => {
            return session.commit()
          },
        },
        {},
      )

      let strava: Strava | null = null
      if (session.get('strava_refresh_token')) {
        strava = new Strava({
          client_id: env.PUBLIC_STRAVA_CLIENT_ID,
          client_secret: env.STRAVA_CLIENT_SECRET,
          refresh_token: session.get('strava_refresh_token'),
        })
      }

      /**
       * Create a Remix request handler and pass
       * Hydrogen's Storefront client to the loader context.
       */
      const handleRequest = createRequestHandler({
        build: remixBuild,
        mode: process.env.NODE_ENV,
        getLoadContext: () => ({session, customer, strava, storefront, env}),
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
    return this.sessionStorage.commitSession(this.session, options)
  }
}

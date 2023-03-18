/// <reference types="@remix-run/dev" />
/// <reference types="@shopify/remix-oxygen" />
/// <reference types="@shopify/oxygen-workers-types" />

import type {Storefront} from '@shopify/hydrogen'
import type {HydrogenSession} from './server'
import type {Customer} from '@cartogram/customer'
import type {Strava} from 'strava'
declare global {
  /**
   * A global `process` object is only available during build to access NODE_ENV.
   */
  const process: {env: {NODE_ENV: 'production' | 'development'}}

  /**
   * Declare expected Env parameter in fetch handler.
   */
  interface Env {
    SESSION_SECRET: string
    PUBLIC_STOREFRONT_API_TOKEN: string
    PRIVATE_STOREFRONT_API_TOKEN: string
    PUBLIC_STOREFRONT_API_VERSION: string
    PUBLIC_STORE_DOMAIN: string
    PUBLIC_STOREFRONT_ID: string
    PUBLIC_STRAVA_CLIENT_ID: string
    STRAVA_CLIENT_SECRET: string
  }
}

/**
 * Declare local additions to `AppLoadContext` to include the session utilities we injected in `server.ts`.
 */
declare module '@shopify/remix-oxygen' {
  export interface AppLoadContext {
    customer: Customer
    session: HydrogenSession
    storefront: Storefront
    strava: Strava | null
    env: Env
  }
}

import type {MetaFunction} from '@remix-run/cloudflare'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import styles from '~/styles.css'
import ui from '@cartogram/ui/index.css'

export const links = () => [
  {rel: 'stylesheet', href: styles},
  {
    rel: 'stylesheet',
    href: 'https://api.fontshare.com/v2/css?f[]=jet-brains-mono@1,2&f[]=general-sans@600&f[]=stardom@400&f[]=satoshi@1,2&f[]=zodiak@1&display=swap',
  },
  {rel: 'stylesheet', href: ui},
]

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'New Remix App',
  viewport: 'width=device-width,initial-scale=1',
})

// import '@cartogram/ui/index.css'

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

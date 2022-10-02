import type { LinksFunction, MetaFunction } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react'
import styles from '~/styles.css'

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: styles },
  {
    rel: 'stylesheet',
    href:
      // 'https://api.fontshare.com/v2/css?f[]=stardom@400&f[]=jet-brains-mono@1,2&f[]=general-sans@400&display=swap',
      'https://api.fontshare.com/v2/css?f[]=jet-brains-mono@1,2&f[]=general-sans@400&f[]=paquito@1&f[]=stardom@400&display=swap',

    // 'https://api.fontshare.com/v2/css?f[]=stardom@400&f[]=paquito@400&f[]=tabular@2,1&f[]=jet-brains-mono@1,2&display=swap',
    // 'https://api.fontshare.com/v2/css?f[]=stardom@400&f[]=satoshi@1&display=swap',
    // 'https://api.fontshare.com/v2/css?f[]=switzer@1&f[]=erode@2,1&display=swap',
  },
]

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Distance over time',
  viewport: 'width=device-width,initial-scale=1',
})

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="Main">
          <Outlet />
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </div>
      </body>
    </html>
  )
}

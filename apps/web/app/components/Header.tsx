import {Wordmark, Text} from '@cartogram/ui'
import {Link} from '~/components'

interface MastProps {
  nav?: {content: string; href: string}[]
}

export function Header({
  nav = [],
  children,
}: React.PropsWithChildren<MastProps>) {
  return (
    <div className="Header">
      <div className="Header__logo">
        <Link to="/">
          <Text as="span" size="large">
            Distance Over Time
          </Text>
        </Link>
      </div>

      <div className="Header__nav">
        {nav.map((link, index) => (
          <Link key={link.href} to={link.href}>
            <Text as="span" size="large">
              {link.content}
            </Text>
          </Link>
        ))}
      </div>

      <div className="text-align-right">{children}</div>
    </div>
  )
}

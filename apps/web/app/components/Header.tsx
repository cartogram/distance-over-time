import {Link} from '@remix-run/react'
import {Wordmark} from '@cartogram/ui'

interface MastProps {
  links?: {content: string; href: string}[]
}

export function Header({links = []}: MastProps) {
  return (
    <>
      <Wordmark />

      <div className="Nav">
        {links.map((link) => (
          <Link key={link.href} className="Link" to={link.href}>
            {link.content}
          </Link>
        ))}
      </div>
    </>
  )
}

import * as React from 'react'

import './Link.css'

export const Link = ({
  children,
  href,
  ...other
}: {
  children: React.ReactNode
  href: string
}) => {
  return (
    <a className="Link" target="_blank" rel="noreferrer" href={href} {...other}>
      {children}
    </a>
  )
}

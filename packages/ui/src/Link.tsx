import React from 'react'
import {classNames} from './utilities'

import './Link.css'

interface LinkProps {
  children: React.ReactNode
  href: string
  unstyled?: boolean
  as:
    | string
    | React.FunctionComponent<{
        className: string
        rel: string
        to: string
        href: string
      }>
}

export const Link = ({
  children,
  unstyled,
  href,
  as = 'a',
  ...other
}: LinkProps) => {
  const className = classNames('Link', unstyled && 'unstyled')

  return React.createElement(
    as,
    {
      className,
      rel: 'noreferrer',
      to: href,
      href,
      ...other,
    },
    children,
  )
}

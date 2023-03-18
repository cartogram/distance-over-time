import {ReactNode} from 'react'

import {classNames} from './utilities'
import './Text.css'

type Element =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p'
  | 'span'
  | 'legend'
  | 'em'

type Size = 'small' | 'medium' | 'large'

type Alignment = 'start' | 'center' | 'end' | 'justify'

type Color = 'success' | 'critical' | 'warning' | 'subdued' | 'text-inverse'

export interface TextProps {
  /** Adjust horizontal alignment of text */
  alignment?: Alignment
  /** The element type */
  as: Element
  /** Prevent text from overflowing */
  breakWord?: boolean
  /** Text to display */
  children: ReactNode
  /** Adjust color of text */
  color?: Color
  /** HTML id attribute */
  id?: string
  /** Use a numeric font variant with monospace appearance */
  numeric?: boolean
  /** Truncate text overflow with ellipsis */
  truncate?: boolean
  /** Typographic style of text */
  size?: Size
  /** Visually hide the text */
  visuallyHidden?: boolean
  /** Make the text block level */
  block?: boolean
  className?: string
}

export const Text = ({
  alignment,
  as,
  breakWord,
  children,
  color,
  id,
  numeric = false,
  truncate = false,
  size,
  visuallyHidden = false,
  block = false,
  className,
}: TextProps) => {
  const Component = as || (visuallyHidden ? 'span' : 'p')

  const classes = classNames(
    'Text',
    size,
    block && 'block',
    (alignment || truncate) && 'block',
    alignment,
    breakWord,
    color,
    numeric,
    truncate,
    visuallyHidden,
    className,
  )

  return (
    <Component className={classes} {...(id && {id})}>
      {children}
    </Component>
  )
}

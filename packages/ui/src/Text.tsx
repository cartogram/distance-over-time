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

type Variant =
  | 'headingXs'
  | 'headingSm'
  | 'headingMd'
  | 'headingLg'
  | 'headingXl'
  | 'heading2xl'
  | 'heading3xl'
  | 'heading4xl'
  | 'bodySm'
  | 'bodyMd'
  | 'bodyLg'

type Alignment = 'start' | 'center' | 'end' | 'justify'

type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold'

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
  /** Adjust weight of text */
  fontWeight?: FontWeight
  /** HTML id attribute */
  id?: string
  /** Use a numeric font variant with monospace appearance */
  numeric?: boolean
  /** Truncate text overflow with ellipsis */
  truncate?: boolean
  /** Typographic style of text */
  variant?: Variant
  /** Visually hide the text */
  visuallyHidden?: boolean
  /** Make the text block level */
  block?: boolean
}

export const Text = ({
  alignment,
  as,
  breakWord,
  children,
  color,
  fontWeight,
  id,
  numeric = false,
  truncate = false,
  variant,
  visuallyHidden = false,
  block = false,
}: TextProps) => {
  const Component = as || (visuallyHidden ? 'span' : 'p')

  const className = classNames(
    'Text',
    variant,
    fontWeight,
    block && 'block',
    (alignment || truncate) && 'block',
    alignment,
    breakWord,
    color,
    numeric,
    truncate,
    visuallyHidden,
  )

  return (
    <Component className={className} {...(id && {id})}>
      {children}
    </Component>
  )
}

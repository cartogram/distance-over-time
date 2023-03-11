import React, {createElement, forwardRef} from 'react'

import {classNames, ResponsiveProp} from './utilities'

import './Box.css'

type Spacing = ResponsiveProp<SpacingSpaceScale>

type Element = 'div' | 'span' | 'section' | 'legend' | 'ul' | 'li'

type SpacingSpaceScale =
  | '0'
  | '025'
  | '05'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '8'
  | '10'
  | '12'
  | '16'
  | '20'
  | '24'
  | '28'
  | '32'

export interface BoxProps extends React.AriaAttributes {
  children?: React.ReactNode
  /** HTML Element type
   * @default 'div'
   */
  as?: Element
  /** HTML id attribute */
  id?: string
  /** Spacing around children. Accepts a spacing token or an object of spacing tokens for different screen sizes.
   * @example
   * padding='4'
   * padding={{xs: '2', sm: '3', md: '4', lg: '5', xl: '6'}}
   */
  padding?: Spacing
  /** Aria role */
  role?: Extract<
    React.AriaRole,
    'status' | 'presentation' | 'menu' | 'listbox' | 'combobox'
  >
  /** Set tab order */
  tabIndex?: Extract<React.AllHTMLAttributes<HTMLElement>['tabIndex'], number>
  /** Width of container */
  width?: string
  /** Opacity of box */
  opacity?: string
  /** Visually hide the contents during print */
  printHidden?: boolean
  /** Visually hide the contents (still announced by screenreader) */
  visuallyHidden?: boolean
  /** z-index of box */
  zIndex?: string
}

export const Box = forwardRef<HTMLElement, BoxProps>(
  (
    {
      as = 'div',
      children,
      id,
      padding,
      role,
      tabIndex,
      width,
      printHidden,
      visuallyHidden,
      zIndex,
      opacity,
      ...restProps
    },
    ref,
  ) => {
    const className = classNames('Box')

    return createElement(
      as,
      {
        className,
        id,
        ref,
        role,
        tabIndex,
        ...restProps,
      },
      children,
    )
  },
)

Box.displayName = 'Box'

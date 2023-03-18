import React from 'react'
import {Link as RemixLink} from '@remix-run/react'
import {Link as CartogramLink} from '@cartogram/ui'

export const Link = (props: React.ComponentProps<typeof CartogramLink>) => (
  <CartogramLink as={RemixLink} to={props.href} {...props} />
)

import React from 'react'

export function Text({children}: React.PropsWithChildren) {
  return <p style={{textDecoration: 'underline'}}>{children}</p>
}

import React from 'react'

export function Text({children}: React.PropsWithChildren) {
  return <p style={{textDecoration: '', color: 'blue'}}>{children}</p>
}

import React from 'react'

import './Text.css'

export function Text({children}: React.PropsWithChildren) {
  return <p className="Text">{children}</p>
}

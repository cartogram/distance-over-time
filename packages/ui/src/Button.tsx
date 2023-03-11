import React from 'react'
import './Button.css'

export function Button(
  props: React.ComponentProps<'button'> & React.ComponentProps<'a'>,
) {
  if (typeof props.onClick !== 'function') {
    return <button className="Button" {...props} />
  }

  if (props.href) {
    return <a className="Button" {...props} />
  }

  return <span className="Button" {...props} />
}

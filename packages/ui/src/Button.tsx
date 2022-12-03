import  React from 'react'
import './Button.css'

export function Button(props: React.PropsWithChildren<{onClick: () => void}>) {
  if (typeof props.onClick === 'function') {
    return <button className='Button' {...props} />
  }

  return <a className='Button' {...props} />
}

import * as ReactDOM from 'react-dom/client'
import * as React from 'react'

import {CounterButton} from '../CounterButton'

describe('CounterButton', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div')
    const root = ReactDOM.createRoot(div)
    root.render(<CounterButton />)
    root.unmount()
  })
})

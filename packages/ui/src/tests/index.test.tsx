import React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'

import {describe, expect, it} from 'vitest'

import {CounterButton} from '../CounterButton'

describe('CounterButton', () => {
  it('renders without crashing', async () => {
    render(<CounterButton />)
    const button = await screen.findByRole('button')

    expect(button).toHaveTextContent('Count: 0')

    await fireEvent.click(button)

    expect(button).toHaveTextContent('Count: 1')
  })
})

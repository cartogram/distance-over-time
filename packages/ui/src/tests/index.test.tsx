import React from 'react'
import {render, fireEvent, screen} from '@testing-library/react'

import {describe, expect, it, vi} from 'vitest'

import {Button} from '../Button'

describe('Button', () => {
  it('calls the onClick prop when clicked', async () => {
    const mockOnClick = vi.fn()

    render(<Button onClick={mockOnClick}>Button</Button>)

    const button = await screen.findByRole('button')

    await fireEvent.click(button)

    expect(mockOnClick).toHaveBeenCalled()
  })
})

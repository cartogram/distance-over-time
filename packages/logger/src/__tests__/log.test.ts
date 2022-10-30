import {log} from '..'
import {vi, describe, expect, it} from 'vitest'

vi.spyOn(global.console, 'log')

describe('logger', () => {
  it('prints a message', () => {
    log('hello')
    expect(console.log).toBeCalled()
  })
})

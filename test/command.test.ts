import { describe, expect, it } from 'vitest'

import { command } from '../src/command.ts'

describe('core-cli command', () => {
  it('declares expected meta', () => {
    expect(command.meta).toMatchObject({
      name: 'core-cli',
      description: expect.stringContaining('CLI'),
    })
  })

  it('declares --name flag', () => {
    const args = command.args as { name?: { type: string } }
    expect(args?.name).toMatchObject({ type: 'string' })
  })

  it('exposes a callable run function', () => {
    expect(typeof command.run).toBe('function')
  })
})

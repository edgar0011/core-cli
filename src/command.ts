import * as p from '@clack/prompts'
import { defineCommand } from 'citty'
import pc from 'picocolors'

import pkg from '../package.json' with { type: 'json' }

export const command = defineCommand({
  meta: {
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
  },
  args: {
    name: {
      type: 'string',
      description: 'Who to greet',
    },
  },
  async run({ args }) {
    p.intro(pc.bold('core-cli'))

    const who =
      args.name ??
      (await ask(
        p.text({
          message: 'Who should I greet?',
          defaultValue: 'world',
        }),
      ))

    p.outro(`Hello, ${pc.green(who)}!`)
  },
})

const ask = async <T>(promise: Promise<T | symbol>): Promise<T> => {
  const result = await promise
  if (p.isCancel(result)) {
    p.cancel('Cancelled')
    process.exit(0)
  }
  return result as T
}

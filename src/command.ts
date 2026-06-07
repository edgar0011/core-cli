import * as p from '@clack/prompts'
import { defineCommand } from 'citty'
import pc from 'picocolors'

export const command = defineCommand({
  meta: {
    name: 'core-cli',
    version: '0.0.1',
    description: 'A modern Node 24+ ESM CLI',
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

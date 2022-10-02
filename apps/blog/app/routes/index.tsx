import { Form } from '@remix-run/react'
import { Wordmark, Mast, Content } from '~/components'
import { useWindowSize } from '~/hooks'

export function action() {
  console.log('hey')

  return json({ message: `Hello, ${name}` })
}

export default function Index() {
  const size = useWindowSize()

  return (
    <>
      <Content>
        <Mast
          links={[
            { content: 'Instagram', href: '' },
            { content: 'Strava', href: '' },
          ]}
        />
        <Form method="post">
          <input type="text" name="title" />
          <input type="text" name="description" />
          <button type="submit">Submit</button>
        </Form>
      </Content>

      <Wordmark {...size} />
    </>
  )
}

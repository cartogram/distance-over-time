import {redirect, type ActionFunction} from '@shopify/remix-oxygen'

export const action: ActionFunction = async ({context}) => {
  context.session.unset('userId')

  console.log('Logging out')

  return redirect('/', {
    headers: {
      'Set-Cookie': await context.session.commit(),
    },
  })
}

export async function loader() {
  return redirect('/')
}

import {redirect, type ActionFunction} from '@shopify/remix-oxygen'

export const action: ActionFunction = async ({context}) => {
  const {customer} = context

  const result = await customer.logout({redirect: '/'})

  return redirect('/', result)
}

export async function loader() {
  return redirect('/')
}

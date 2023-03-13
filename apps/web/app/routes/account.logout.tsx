import {redirect, type ActionFunction} from '@shopify/remix-oxygen'

export const action: ActionFunction = async ({context}) => {
  const {customer} = context

  return customer.logout()
}

export async function loader() {
  return redirect('/')
}

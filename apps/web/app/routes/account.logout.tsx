import {redirect, type ActionFunction} from '@shopify/remix-oxygen'

export const action: ActionFunction = async ({context}) => {
  const {customer} = context

  const result = await customer.logout()

  console.log(result)

  return redirect('/', {headers: result.headers})
}

export async function loader() {
  return redirect('/')
}

export default function Logout() {
  return null
}

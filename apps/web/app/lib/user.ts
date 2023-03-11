import {useMemo} from 'react'
import {useMatches} from '@remix-run/react'

export type User = {id: string; email: string}

export function useMatchesData(id: string) {
  const matchingRoutes = useMatches()
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id],
  )

  return route?.data
}

export function isUser(user: User) {
  return user && typeof user === 'object'
}

export function useOptionalUser() {
  const data = useMatchesData('root')

  console.log(data.user)
  if (!data || !isUser(data.user)) {
    return undefined
  }
  return data.user
}

export function useUser() {
  const maybeUser = useOptionalUser()

  if (!maybeUser) {
    throw new Error(
      'No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.',
    )
  }

  return maybeUser
}
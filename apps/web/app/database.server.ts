import {createClient} from '@supabase/supabase-js'
import invariant from 'tiny-invariant'
import {createCookieSessionStorage, redirect} from '@shopify/remix-oxygen'
export type User = {id: string; email: string}

// Abstract this away
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

invariant(
  supabaseUrl,
  'SUPABASE_URL must be set in your environment variables.',
)
invariant(
  supabaseAnonKey,
  'SUPABASE_ANON_KEY must be set in your environment variables.',
)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function createUser(email: string, password: string) {
  const {user} = await supabase.auth.signUp({
    email,
    password,
  })

  // get the user profile after created
  const profile = await getProfileByEmail(user?.email)

  return profile
}

export async function getProfileById(id: string) {
  const {data, error} = await supabase
    .from('profiles')
    .select('email, id')
    .eq('id', id)
    .single()

  if (error) return null
  if (data) return {id: data.id, email: data.email}
}

export async function getProfileByEmail(email?: string) {
  const {data, error} = await supabase
    .from('profiles')
    .select('email, id')
    .eq('email', email)
    .single()

  if (error) return null
  if (data) return data
}

export async function verifyLogin(email: string, password: string) {
  const {user, error} = await supabase.auth.signIn({
    email,
    password,
  })

  if (error) return undefined
  const profile = await getProfileByEmail(user?.email)

  return profile
}

export type Note = {
  id: string
  title: string
  body: string
  profile_id: string
}

export async function getNoteListItems({userId}: {userId: User['id']}) {
  const {data} = await supabase
    .from('notes')
    .select('id, title')
    .eq('profile_id', userId)

  return data
}

export async function createNote({
  title,
  body,
  userId,
}: Pick<Note, 'body' | 'title'> & {userId: User['id']}) {
  const {data, error} = await supabase
    .from('notes')
    .insert([{title, body, profile_id: userId}])
    .single()

  if (!error) {
    return data
  }

  return null
}

export async function deleteNote({
  id,
  userId,
}: Pick<Note, 'id'> & {userId: User['id']}) {
  const {error} = await supabase
    .from('notes')
    .delete({returning: 'minimal'})
    .match({id, profile_id: userId})

  if (!error) {
    return {}
  }

  return null
}

export async function getNote({
  id,
  userId,
}: Pick<Note, 'id'> & {userId: User['id']}) {
  const {data, error} = await supabase
    .from('notes')
    .select('*')
    .eq('profile_id', userId)
    .eq('id', id)
    .single()

  if (!error) {
    return {
      userId: data.profile_id,
      id: data.id,
      title: data.title,
      body: data.body,
    }
  }

  return null
}

invariant(
  process.env.SESSION_SECRET,
  'SESSION_SECRET must be set in your environment variables.',
)

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    maxAge: 60,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
  },
})

const USER_SESSION_KEY = 'userId'

export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie')
  return sessionStorage.getSession(cookie)
}

export async function getUserId(request: Request) {
  const session = await getSession(request)
  const userId = session.get(USER_SESSION_KEY)

  return userId
}

export async function getUser(request: Request) {
  const userId = await getUserId(request)
  if (userId === undefined) return null

  const user = await getProfileById(userId)
  if (user) return user

  throw await logout(request)
}

/**
 * Require a user session to get to a page. If none is found
 * redirect them to the login page. After login, take them to
 * the original page they wanted to get to.
 */
export async function requireUserId(
  request: Request,
  redirectTo: string = new URL(request.url).pathname,
) {
  const userId = await getUserId(request)
  if (!userId) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]])
    throw redirect(`/login?${searchParams}`)
  }

  return userId
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request)
  if (userId == undefined) return null

  const profile = await getProfileById(userId)
  if (profile) return profile

  throw await logout(request)
}

export async function createUserSession({
  request,
  userId,
  remember,
  redirectTo,
}: {
  request: Request
  userId: string
  remember: boolean
  redirectTo: string
}) {
  const session = await getSession(request)
  session.set(USER_SESSION_KEY, userId)
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session, {
        maxAge: remember
          ? 60 * 60 * 24 * 7 // 7 days
          : undefined,
      }),
    },
  })
}

export async function logout(request: Request) {
  const session = await getSession(request)
  return redirect('/', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  })
}

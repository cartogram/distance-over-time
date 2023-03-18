export function getOAuthRedirectUrl({
  client_id,
  base_url,
}: {
  base_url: string
  client_id: string
}): string {
  const stravaSearchParams = new URLSearchParams({
    client_id,
    response_type: 'code',
    redirect_uri: `${base_url}/strava/connect`,
    approval_prompt: 'force',
    scope: 'read,activity:read',
  })

  return `https://www.strava.com/oauth/authorize?${stravaSearchParams.toString()}`
}

export async function exchangeCodeForToken<T>({
  code,
  client_id,
  client_secret,
}: {
  code: string
  client_id: string
  client_secret: string
}) {
  const response = await fetch('https://www.strava.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id,
      client_secret,
      grant_type: 'authorization_code',
    }),
  })

  return response.json<T>()
}

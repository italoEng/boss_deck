import { supabase } from './supabaseClient'

export async function apiFetch(url, options = {}) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    }
  })
}
import {cookies} from 'next/headers';
import {currentUser} from '../../app/auth';
export const googleCookie='tc_google_oauth';
export const googleCallbackPath='/api/admin/backups/googledrive/callback';
export const googleCookieOptions={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax' as const,path:googleCallbackPath,maxAge:600};
// Only the Google callback opts into this short-lived, path-scoped cookie.
// Other APIs continue to authenticate solely through tc_session (Strict).
export async function googleSession(){return (await cookies()).get(googleCookie)?.value||''}
export async function googleUser(){return currentUser(await googleSession())}

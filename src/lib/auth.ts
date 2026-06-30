import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.JWT_SECRET || 'super-secret-default-key-please-change-in-prod';
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload;
}

export async function setAuthCookie(userId: number, username: string, firstName?: string, lastName?: string) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
  const token = await encrypt({ userId, username, firstName, lastName, expires });

  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    expires,
    httpOnly: true,
    secure: false, // Must be false for HTTP localhost
    sameSite: 'lax',
    path: '/',
  });
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session')?.value;
  if (!session) return null;
  
  try {
    return await decrypt(session);
  } catch (error) {
    return null;
  }
}

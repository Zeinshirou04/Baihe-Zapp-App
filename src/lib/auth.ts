import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/db/client';

const SALT_ROUNDS = 12;
const SESSION_COOKIE = 'baihe_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export const hashPassword = async (plain: string): Promise<string> => {
  return bcrypt.hash(plain, SALT_ROUNDS);
};

export const verifyPassword = async (plain: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(plain, hash);
};

export const signSession = async (userId: string): Promise<string> => {
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
  return new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret);
};

export const verifySession = async (token: string): Promise<string | null> => {
  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return typeof payload.uid === 'string' ? payload.uid : null;
  } catch {
    return null;
  }
};

export const getSessionUserId = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE);
  if (!cookie?.value) return null;
  return verifySession(cookie.value);
};

export const requireAdmin = async (): Promise<void> => {
  const uid = await getSessionUserId();
  if (!uid) {
    throw new Error('Unauthorized');
  }
  const user = await prisma.user.findUnique({ where: { id: uid } });
  if (!user) {
    throw new Error('Unauthorized');
  }
};

export const setSessionCookie = (token: string) => {
  const response = NextResponse.next();
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    path: '/',
    maxAge: SESSION_MAX_AGE,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return response;
};

export const clearSessionCookie = () => {
  const response = NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_SITE_URL));
  response.cookies.delete(SESSION_COOKIE);
  return response;
};

export const getSession = async () => {
  const uid = await getSessionUserId();
  return uid ? { userId: uid } : null;
};

export const getSessionUser = async () => {
  const uid = await getSessionUserId();
  if (!uid) return null;
  const user = await prisma.user.findUnique({ 
    where: { id: uid },
    select: { id: true, email: true, name: true }
  });
  return user;
};
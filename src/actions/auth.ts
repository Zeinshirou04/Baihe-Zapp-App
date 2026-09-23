"use server";
import { z } from 'zod';
import { hashPassword, verifyPassword, signSession } from '@/lib/auth';
import { prisma } from '@/db/client';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const SESSION_COOKIE = 'baihe_session';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

export async function login(formData: FormData) {
  const result = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!result.success) {
    return { success: false, error: 'Invalid input' };
  }
  const { email, password } = result.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { success: false, error: 'Invalid credentials' };
  }
  const token = await signSession(user.id);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    path: '/',
    maxAge: SESSION_MAX_AGE,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect('/admin/login');
}
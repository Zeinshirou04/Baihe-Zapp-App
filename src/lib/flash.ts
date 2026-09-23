import { cookies } from 'next/headers';

const FLASH_COOKIE = 'baihe_flash';

export type FlashMessage = { type: 'success' | 'error'; message: string };

export async function setFlash(message: FlashMessage) {
  const cookieStore = await cookies();
  cookieStore.set(FLASH_COOKIE, JSON.stringify(message), {
    httpOnly: true,
    path: '/',
    maxAge: 5,
    sameSite: 'lax',
  });
}

export async function getFlash(): Promise<FlashMessage | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(FLASH_COOKIE);
  if (!cookie?.value) return null;
  cookieStore.delete(FLASH_COOKIE);
  try {
    return JSON.parse(cookie.value) as FlashMessage;
  } catch {
    return null;
  }
}
import { signIn } from '@/app/(auth)/auth';
import { isDevelopmentEnvironment } from '@/lib/constants';
import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
    secureCookie: !isDevelopmentEnvironment,
  });

  if (token) {
    return NextResponse.redirect(new URL('/main', request.url));
  }

  try {
    return await signIn('guest', { redirect: true, redirectTo: '/main' });
  } catch (error) {
    console.error('Guest sign-in error:', error);
    // If it's a redirect error (which is expected on success), rethrow it
    // Check if error has digest starting with NEXT_REDIRECT
    if (error instanceof Error && (error as any).digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

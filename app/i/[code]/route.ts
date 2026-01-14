
import { type NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> } // Params is a Promise in Next.js 15
) {
  const { code } = await params;

  if (!code) {
    return new NextResponse('Missing code', { status: 400 });
  }

  // Redirect to main page with ref param
  // We use the deployment URL or localhost
  const baseUrl = process.env.NEXTAUTH_URL || 'https://aporto.tech';
  const targetUrl = new URL('/main', baseUrl);
  targetUrl.searchParams.set('ref', code);

  return NextResponse.redirect(targetUrl);
}

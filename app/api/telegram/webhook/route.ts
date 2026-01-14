import { bot } from '@/lib/telegram';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return new Response('Missing "url" query parameter. Usage: /api/telegram/webhook?url=<YOUR_WEBHOOK_URL>', { status: 400 });
    }

    await bot.api.setWebhook(url);
    return new Response(`Webhook successfully set to: ${url}`);
  } catch (error: any) {
    console.error('Error setting webhook:', error);
    return new Response(`Failed to set webhook: ${error.message}`, { status: 500 });
  }
}

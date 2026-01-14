import { bot } from '@/lib/telegram';
import { webhookCallback } from 'grammy';

export const dynamic = 'force-dynamic';

export const POST = webhookCallback(bot, 'std/http');

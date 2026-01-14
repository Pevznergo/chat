import { Bot } from 'grammy';
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

if (!process.env.TELEGRAM_BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN is not set');
}

export const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

bot.command('start', (ctx) => ctx.reply('Welcome! Send me a message and I will reply with ChatGPT.'));

bot.on('message:text', async (ctx) => {
  // Show typing status
  await ctx.replyWithChatAction('typing');

  try {
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      prompt: ctx.message.text,
    });
    await ctx.reply(text);
  } catch (error) {
    console.error('Error generating AI response:', error);
    await ctx.reply('Sorry, I encountered an error while processing your request.');
  }
});

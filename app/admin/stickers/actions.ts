
'use server';

import { auth } from '@/app/(auth)/auth';
import { db } from '@/lib/db';
import { invites } from '@/lib/db/schema';
import { generateUUID } from '@/lib/utils';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

// Helper to generate a random 6-character code
function generateRandomCode(length = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function generateShortLink() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  // Generate a unique code
  let code = generateRandomCode();
  let unique = false;
  let attempts = 0;

  while (!unique && attempts < 5) {
    const existing = await db
      .select()
      .from(invites)
      .where(eq(invites.code, code))
      .limit(1);
    
    if (existing.length === 0) {
      unique = true;
    } else {
      code = generateRandomCode();
      attempts++;
    }
  }

  if (!unique) {
    throw new Error('Failed to generate unique code. Please try again.');
  }

  // Create the invite record
  const [newInvite] = await db
    .insert(invites)
    .values({
      id: generateUUID(), // Ensure UUID generation works on server
      code: code,
      owner_user_id: session.user.id,
      available_count: 999999, // Practically unlimited for stickers
      used_count: 0,
    } as any) // Type assertion due to potential loose types
    .returning();

  revalidatePath('/admin/stickers');

  // Return the full short URL
  const baseUrl = process.env.NEXTAUTH_URL || 'https://aporto.tech';
  return `${baseUrl}/i/${newInvite.code}`;
}

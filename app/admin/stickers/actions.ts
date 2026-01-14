
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

export async function generateShortLinks(count: number) {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const generatedLinks = [];
  const MAX_BATCH_SIZE = 50; // Generate in chunks to avoid massive queries/inserts if needed, but here we loop
  
  // For simplicity in this specific user request context, we'll generate one by one or in small batches.
  // Ideally, we'd generate N codes, check uniqueness, and insert. 
  // Given the collision probability is low for 6 chars, we can try to generate valid invites in a loop.
  
  const baseUrl = process.env.NEXTAUTH_URL || 'https://aporto.tech';

  for (let i = 0; i < count; i++) {
     // Generate a unique code
    let code = generateRandomCode();
    let unique = false;
    let attempts = 0;

    // A simple retry mechanism
    while (!unique && attempts < 5) {
        // Optimization: In a real high-perf scenario, we would cache existing codes or use a bloom filter.
        // For < 200 items, checking DB is acceptable but slow. 
        // Let's assume low collision rate.
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

    if (unique) {
         await db.insert(invites).values({
            id: generateUUID(),
            code: code,
            owner_user_id: session.user.id,
            available_count: 999999,
            used_count: 0,
         } as any);
         
         generatedLinks.push(`${baseUrl}/i/${code}`);
    }
  }

  revalidatePath('/admin/stickers');
  return generatedLinks;
}

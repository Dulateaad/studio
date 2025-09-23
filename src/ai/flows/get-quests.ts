'use server';

/**
 * @fileOverview A Genkit flow for fetching available quests.
 *
 * - getQuests - A function that returns a list of quests.
 * - Quest - The type definition for a quest.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { quests as staticQuests, Quest } from '@/lib/data';

export type { Quest };

const GetQuestsOutputSchema = z.array(
  z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    tasks: z.array(z.object({
        id: z.string(),
        text: z.string(),
    }))
  })
);

export async function getQuests(): Promise<Quest[]> {
  return getQuestsFlow();
}

const getQuestsFlow = ai.defineFlow(
  {
    name: 'getQuestsFlow',
    inputSchema: z.void(),
    outputSchema: GetQuestsOutputSchema,
  },
  async () => {
    // In a real application, this could fetch quests from a database.
    // For this prototype, we'll return mock data.
    return staticQuests;
  }
);

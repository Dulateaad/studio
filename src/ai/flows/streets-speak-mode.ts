
'use server';

/**
 * @fileOverview A Genkit flow for the Streets Speak Mode feature, which changes the AI guide's voice and persona based on location.
 *
 * - streetsSpeakMode - A function that orchestrates the Streets Speak Mode experience.
 * - StreetsSpeakModeInput - The input type for the streetsSpeakMode function.
 * - StreetsSpeakModeOutput - The return type for the streetsSpeakMode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StreetsSpeakModeInputSchema = z.object({
  location: z.string().describe('The current location of the user.'),
});
export type StreetsSpeakModeInput = z.infer<typeof StreetsSpeakModeInputSchema>;

const StreetsSpeakModeOutputSchema = z.object({
  voice: z.string().describe('The voice of the AI guide for the current location.'),
  persona: z.string().describe('The persona of the AI guide for the current location, including historical facts and quotes.'),
});
export type StreetsSpeakModeOutput = z.infer<typeof StreetsSpeakModeOutputSchema>;

export async function streetsSpeakMode(input: StreetsSpeakModeInput): Promise<StreetsSpeakModeOutput> {
  return streetsSpeakModeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'streetsSpeakModePrompt',
  input: {schema: StreetsSpeakModeInputSchema},
  output: {schema: StreetsSpeakModeOutputSchema},
  prompt: `You are an AI guide providing information about the current location in "Streets Speak" mode.

Current Location: {{{location}}}

Based on the location, adopt the voice and persona of a relevant historical figure or local character.
Include historical facts and quotes related to the location.
Return the voice and persona to be used by the AI guide.

Here's some example output:
{
  "voice": "Tenor",
  "persona": "Greetings, traveler! I am a local merchant from the 1800s, and this used to be the town square, here you could find anything from bread to a horse." 
}
`,
});

const streetsSpeakModeFlow = ai.defineFlow(
  {
    name: 'streetsSpeakModeFlow',
    inputSchema: StreetsSpeakModeInputSchema,
    outputSchema: StreetsSpeakModeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

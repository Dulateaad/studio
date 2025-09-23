'use server';

/**
 * @fileOverview A flow for generating responses from the AI avatar in different languages.
 *
 * - generateAvatarResponse - A function that generates the AI avatar's response.
 * - GenerateAvatarResponseInput - The input type for the generateAvatarResponse function.
 * - GenerateAvatarResponseOutput - The return type for the generateAvatarResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { askAstanaGuideTool } from '../services/ask-astana-guide';
import { generateTts } from './generate-tts';

const GenerateAvatarResponseInputSchema = z.object({
  query: z.string().describe('The user query to respond to.'),
  preferredLanguage: z.enum(['English', 'Russian', 'Kazakh']).describe('The user\'s preferred language.'),
});
export type GenerateAvatarResponseInput = z.infer<typeof GenerateAvatarResponseInputSchema>;

const GenerateAvatarResponseOutputSchema = z.object({
  response: z.string().describe('The AI avatar\'s response in the user\'s preferred language.'),
  citations: z.array(z.any()).optional().describe('Citations for the response.'),
  audio: z.string().optional().describe('The base64 encoded audio of the response.'),
});
export type GenerateAvatarResponseOutput = z.infer<typeof GenerateAvatarResponseOutputSchema>;

export async function generateAvatarResponse(input: GenerateAvatarResponseInput): Promise<GenerateAvatarResponseOutput> {
  return generateAvatarResponseFlow(input);
}

const languageMap = {
  English: "en",
  Russian: "ru",
  Kazakh: "kk",
}

const prompt = ai.definePrompt({
  name: 'generateAvatarResponsePrompt',
  tools: [askAstanaGuideTool],
  input: {schema: GenerateAvatarResponseInputSchema},
  output: {schema: z.object({
    response: z.string().describe('The AI avatar\'s response in the user\'s preferred language.'),
    citations: z.array(z.any()).optional().describe('Citations for the response.'),
  })},
  prompt: `You are an AI avatar acting as a tour guide for Astana. Your primary goal is to answer user questions about Astana.

Use the 'askAstanaGuideTool' to answer questions about Astana. Your final response should be based *only* on the information returned by the tool.

The user's preferred language is {{preferredLanguage}}. You MUST respond in this language. The 'lang' parameter for the tool must be the corresponding two-letter code for this language.

User Query: {{{query}}}
`,
});

const generateAvatarResponseFlow = ai.defineFlow(
  {
    name: 'generateAvatarResponseFlow',
    inputSchema: GenerateAvatarResponseInputSchema,
    outputSchema: GenerateAvatarResponseOutputSchema,
  },
  async input => {
    const llmResponse = await prompt({
      ...input,
      // @ts-ignore
      preferredLanguage: languageMap[input.preferredLanguage]
    });
    
    let textResponse = "";
    let citations: any[] | undefined = [];

    const toolRequest = llmResponse.toolRequests[0];

    if (toolRequest && toolRequest.tool === 'askAstanaGuideTool') {
        const toolResponse = await toolRequest.run();
        if (toolResponse) {
            textResponse = toolResponse.answer;
            citations = toolResponse.citations;
        }
    }
    
    if (!textResponse) {
        // Fallback if tool is not called or fails
        const output = llmResponse.output;
        if (output) {
          textResponse = output.response;
        }
    }

    if (!textResponse) {
        return {
          response: "I'm sorry, I couldn't find an answer to your question. Please try rephrasing it.",
          citations: []
        };
    }

    // Generate TTS in parallel
    const ttsResult = await generateTts(textResponse);
    
    return {
        response: textResponse,
        citations: citations,
        audio: ttsResult.media
    };
  }
);

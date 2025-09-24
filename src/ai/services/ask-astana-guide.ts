"use server";

import { ai } from "@/ai/genkit";
import { z } from "genkit";

const AstanaGuideInputSchema = z.object({
  text: z.string().describe("The question to ask the Astana guide."),
  lang: z.enum(["ru", "kk", "en"]).describe("The language of the question."),
  persona: z.enum(["formal", "humorous"]).describe("The persona for the response."),
});

const AstanaGuideOutputSchema = z.object({
  lang: z.string(),
  answer: z.string(),
  citations: z.array(z.any()).optional(),
});

export const askAstanaGuideTool = ai.defineTool(
  {
    name: "askAstanaGuideTool",
    description: "Use this tool to ask questions about Astana's attractions, tours, and culture.",
    inputSchema: AstanaGuideInputSchema,
    outputSchema: AstanaGuideOutputSchema,
  },
  async (input) => {
    const apiKey = process.env.ASTANA_GUIDE_API_KEY;
    const apiUrl = process.env.ASTANA_GUIDE_API_URL;

    if (!apiKey || !apiUrl) {
      throw new Error("API key or URL for Astana Guide is not configured.");
    }

    try {
      const resp = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({ text: input.text, lang: input.lang, persona: input.persona }),
      });

      if (!resp.ok) {
        console.error(`API error: ${resp.status} ${resp.statusText}`);
        return {
            lang: input.lang,
            answer: "Произошла ошибка, попробуйте позже.",
            citations: []
        };
      }

      const data = await resp.json();
      return data;
    } catch (error) {
      console.error("Failed to fetch from Astana Guide API:", error);
      return {
          lang: input.lang,
          answer: "Произошла ошибка, попробуйте позже.",
          citations: []
      };
    }
  }
);

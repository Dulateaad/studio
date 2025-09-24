import { config } from 'dotenv';
config();

import '@/ai/flows/provide-personalized-recommendation.ts';
import '@/ai/flows/change-avatar-persona.ts';
import '@/ai/flows/streets-speak-mode.ts';
import '@/ai/flows/generate-avatar-response.ts';
import '@/ai/services/ask-astana-guide.ts';
import '@/ai/flows/generate-tts.ts';
import '@/ai/flows/get-quests.ts';
import '@/ai/flows/get-route-coordinates.ts';
import '@/ai/flows/find-nearby-places.ts';

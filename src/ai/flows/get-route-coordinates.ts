'use server';

/**
 * @fileOverview A Genkit flow for extracting coordinates from a route description.
 *
 * - getRouteCoordinates - A function that returns a list of locations with coordinates.
 * - GetRouteCoordinatesInput - The input type for the getRouteCoordinates function.
 * - GetRouteCoordinatesOutput - The return type for the getRouteCoordinates function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetRouteCoordinatesInputSchema = z.object({
  route: z.string().describe("The text description of the route."),
});
export type GetRouteCoordinatesInput = z.infer<typeof GetRouteCoordinatesInputSchema>;

const LocationWithCoordinatesSchema = z.object({
    name: z.string().describe("The name of the location."),
    coordinates: z.object({
        lat: z.number().describe("The latitude of the location."),
        lng: z.number().describe("The longitude of the location."),
    })
});

const GetRouteCoordinatesOutputSchema = z.object({
  locations: z.array(LocationWithCoordinatesSchema).describe("A list of locations with their names and geographic coordinates."),
});

export type GetRouteCoordinatesOutput = z.infer<typeof GetRouteCoordinatesOutputSchema>;

export async function getRouteCoordinates(input: GetRouteCoordinatesInput): Promise<GetRouteCoordinatesOutput> {
  return getRouteCoordinatesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getRouteCoordinatesPrompt',
  input: {schema: GetRouteCoordinatesInputSchema},
  output: {schema: GetRouteCoordinatesOutputSchema},
  prompt: `You are a geocoding expert. Your task is to extract points of interest from a given route description for Astana, Kazakhstan, and find their geographic coordinates (latitude and longitude).

  You must only return locations within Astana, Kazakhstan.

  If a location cannot be found or is ambiguous, do not include it in the result.
  
  Route Description:
  {{{route}}}
  
  Return a valid JSON object containing a list of locations with their names and coordinates.`,
});


const getRouteCoordinatesFlow = ai.defineFlow(
  {
    name: 'getRouteCoordinatesFlow',
    inputSchema: GetRouteCoordinatesInputSchema,
    outputSchema: GetRouteCoordinatesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

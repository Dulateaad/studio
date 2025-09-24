'use server';

/**
 * @fileOverview A flow for finding nearby places using the Google Places API.
 *
 * - findNearbyPlaces - A function that returns a list of places based on location and type.
 * - FindNearbyPlacesInput - The input type for the findNearbyPlaces function.
 * - Place - The type definition for a found place.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindNearbyPlacesInputSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  placeType: z.string().describe('The type of place to search for (e.g., cafe, museum, park).'),
  radius: z.number().default(5000).describe('The search radius in meters.'),
});

export type FindNearbyPlacesInput = z.infer<typeof FindNearbyPlacesInputSchema>;

const PlaceSchema = z.object({
  name: z.string(),
  vicinity: z.string().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
});

export type Place = z.infer<typeof PlaceSchema>;

const FindNearbyPlacesOutputSchema = z.array(PlaceSchema);


export async function findNearbyPlaces(input: FindNearbyPlacesInput): Promise<Place[]> {
  return findNearbyPlacesFlow(input);
}

const findNearbyPlacesFlow = ai.defineFlow(
  {
    name: 'findNearbyPlacesFlow',
    inputSchema: FindNearbyPlacesInputSchema,
    outputSchema: FindNearbyPlacesOutputSchema,
  },
  async (input) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error("Google Maps API key is not configured.");
    }
    
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${input.latitude},${input.longitude}&radius=${input.radius}&type=${input.placeType}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK') {
        console.error('Google Places API Error:', data.error_message || data.status);
        return [];
      }
      
      const places = data.results.map((result: any) => ({
        name: result.name,
        vicinity: result.vicinity,
        location: {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
        },
      }));
      
      return places;

    } catch (error) {
      console.error("Failed to fetch from Google Places API:", error);
      return [];
    }
  }
);

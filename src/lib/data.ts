import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

// Helper to get image by ID
const getImage = (id: string): ImagePlaceholder => {
  const image = PlaceHolderImages.find(img => img.id === id);
  if (!image) {
    // Return a default placeholder if not found
    const defaultImage = PlaceHolderImages.find(img => img.id === 'ai-avatar');
    if (defaultImage) return defaultImage;
    
    return {
      id: 'default',
      description: 'Placeholder',
      imageUrl: 'https://picsum.photos/seed/default/600/400',
      imageHint: 'placeholder'
    };
  }
  return image;
};

export interface Attraction {
  id: string;
  title: string;
  description: string;
  image: ImagePlaceholder;
}

export const attractions: Attraction[] = [
  {
    id: '1',
    title: 'Baiterek Tower',
    description: 'A monument and observation tower in Astana, the capital city of Kazakhstan.',
    image: getImage('baiterek-tower'),
  },
  {
    id: '2',
    title: 'Khan Shatyr',
    description: 'A giant transparent tent, serving as a shopping and entertainment center with a park and boating river.',
    image: getImage('khan-shatyr'),
  },
  {
    id: '3',
    title: 'Palace of Peace and Reconciliation',
    description: 'A pyramid-shaped building that hosts the Congress of Leaders of World and Traditional Religions.',
    image: getImage('palace-of-peace'),
  },
  {
    id: '4',
    title: 'Nur-Astana Mosque',
    description: 'One of the largest mosques in Central Asia, a stunning example of modern Islamic architecture.',
    image: getImage('nur-astana-mosque'),
  },
   {
    id: '5',
    title: 'National Museum of Kazakhstan',
    description: 'The largest museum in Central Asia, showcasing the history and culture of Kazakhstan from ancient to modern times.',
    image: getImage('national-museum'),
  },
];

export interface QuestTask {
  id: string;
  text: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  tasks: QuestTask[];
}

export const quests: Quest[] = [
  {
    id: 'q1',
    title: 'The Capital\'s Heart',
    description: 'Explore the area around Baiterek Tower and discover the symbols of modern Astana.',
    tasks: [
      { id: 't1', text: 'Take an elevator to the top of Baiterek Tower.' },
      { id: 't2', text: 'Find the "Akorda" Presidential Palace and take a picture.' },
      { id: 't3', text: 'Walk across the Water-Green Boulevard.' },
    ],
  },
  {
    id: 'q2',
    title: 'Future Forward',
    description: 'Visit the futuristic Khan Shatyr and experience entertainment under the giant tent.',
    tasks: [
      { id: 't1', text: 'Buy a souvenir from one of the shops.' },
      { id: 't2', text: 'Go for a ride on the monorail inside.' },
      { id: 't3', text: 'Visit the indoor beach club on the top floor.' },
    ],
  },
  {
    id: 'q3',
    title: 'Pyramid of Peace',
    description: 'Discover the unique architecture and purpose of the Palace of Peace and Reconciliation.',
    tasks: [
      { id: 't1', text: 'Take a guided tour of the pyramid.' },
      { id: 't2', text: 'Admire the view of the city from the upper levels.' },
      { id: 't3', text: 'Attend a concert in the opera hall if available.' },
    ],
  },
];

export const aiAvatarImage = getImage('ai-avatar');
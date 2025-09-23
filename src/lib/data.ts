import type { ImagePlaceholder } from './placeholder-images';
import { PlaceHolderImages } from './placeholder-images';

// Helper to get image by ID
const getImage = (id: string): ImagePlaceholder => {
  const image = PlaceHolderImages.find(img => img.id === id);
  if (!image) {
    // Return a default placeholder if not found
    const defaultImage = PlaceHolderImages.find(img => img.id === 'shymbulak');
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
    title: 'Kok-Tobe Hill',
    description: 'A mountain which is the highest point of Almaty. It is popular for its panoramic views, cable car, and various amusements.',
    image: getImage('kok-tobe'),
  },
  {
    id: '2',
    title: 'Ascension Cathedral',
    description: 'A Russian Orthodox cathedral located in Panfilov Park. Completed in 1907, it is made of wood but constructed without nails.',
    image: getImage('ascension-cathedral'),
  },
  {
    id: '3',
    title: 'Shymbulak Ski Resort',
    description: 'Located in the upper part of the Medeu Valley, it is Central Asia\'s largest ski resort with slopes for all levels.',
    image: getImage('shymbulak'),
  },
  {
    id: '4',
    title: 'Big Almaty Lake',
    description: 'A natural alpine reservoir located in the Trans-Ili Alatau mountains, known for its stunning, color-changing water.',
    image: getImage('big-almaty-lake'),
  },
   {
    id: '5',
    title: 'First President Park',
    description: 'A large urban park dedicated to the first president of Kazakhstan. It features beautiful fountains, flower beds, and monuments.',
    image: getImage('first-president-park'),
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
    title: 'The Park Explorer',
    description: 'Visit Panfilov Park and uncover its secrets. This quest will guide you through its most important landmarks.',
    tasks: [
      { id: 't1', text: 'Find the Ascension Cathedral and take a picture.' },
      { id: 't2', text: 'Locate the memorial to the 28 Panfilov Guardsmen.' },
      { id: 't3', text: 'Listen to a street musician near the eternal flame.' },
    ],
  },
  {
    id: 'q2',
    title: 'Arbat Art Walk',
    description: 'Stroll down Zhibek Zholy Pedestrian Street, known as "Arbat," and immerse yourself in the local art scene.',
    tasks: [
      { id: 't1', text: 'Buy a souvenir from a local artist.' },
      { id: 't2', text: 'Try a cup of local "kymyz" or "shubat".' },
      { id: 't3', text: 'Find the "Stalker" monument and guess its meaning.' },
    ],
  },
  {
    id: 'q3',
    title: 'Mountain High',
    description: 'Ascend to the heavens by taking the cable car up to Kok-Tobe hill for breathtaking views.',
    tasks: [
      { id: 't1', text: 'Ride the cable car from Dostyk Avenue.' },
      { id: 't2', text: 'Take a selfie with the iconic Beatles statue.' },
      { id: 't3', text: 'Try the fast-coaster ride down the slope.' },
    ],
  },
];

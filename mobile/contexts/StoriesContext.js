import React, { createContext, useContext, useState, useEffect } from 'react';
// TODO: Import story service when backend is ready
// import * as storyService from '../services/storyService';

const StoriesContext = createContext();

// TODO: BACKEND INTEGRATION - Remove hardcoded data
// This data should come from: GET /api/stories
// Response format should match this structure:
// {
//   id: number,
//   title: string,
//   emoji: string (or imageUrl for actual images),
//   color: string (hex color),
//   duration: string,
//   completed: boolean (based on user progress),
//   progress: number (0-100)
// }
const HARDCODED_STORIES = [
  {
    id: 1,
    title: 'Space Explorer Journey',
    emoji: '🚀',
    imageUrl: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800',
    description: 'Blast off into space and discover new planets with Captain Stella!',
    category: 'Science Fiction',
    difficulty: 'moyen',
    points: 100,
    duration: '5 min',
    completed: true,
    progress: 100,
  },
  {
    id: 2,
    title: 'Jungle Expedition',
    emoji: '🦁',
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800',
    description: 'Explore the wild jungle and learn about amazing animals with Dr. Leo!',
    category: 'Nature',
    difficulty: 'difficile',
    points: 150,
    duration: '7 min',
    completed: true,
    progress: 100,
  },
  {
    id: 3,
    title: 'Dinosaur Time Travel',
    emoji: '🦕',
    imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    description: 'Travel back in time to meet the mighty dinosaurs of the prehistoric era!',
    category: 'History',
    difficulty: 'difficile',
    points: 150,
    duration: '10 min',
    completed: false,
    progress: 0,
  },
  {
    id: 4,
    title: 'Ocean Adventure',
    emoji: '🐠',
    imageUrl: 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=800',
    description: 'Dive deep into the ocean and discover colorful sea creatures!',
    category: 'Nature',
    difficulty: 'moyen',
    points: 120,
    duration: '6 min',
    completed: false,
    progress: 0,
  },
  {
    id: 5,
    title: 'Magic Forest',
    emoji: '🌳',
    imageUrl: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800',
    description: 'Enter the enchanted forest and meet magical creatures!',
    category: 'Fantasy',
    difficulty: 'moyen',
    points: 110,
    duration: '8 min',
    completed: false,
    progress: 45,
  },
  {
    id: 6,
    title: 'Castle Mystery',
    emoji: '🏰',
    imageUrl: 'https://images.unsplash.com/photo-1583241800698-ede5b5e8dd7f?w=800',
    description: 'Solve puzzles and mysteries in the ancient castle!',
    category: 'Adventure',
    difficulty: 'difficile',
    points: 180,
    duration: '12 min',
    completed: false,
    progress: 0,
  },
];

export const StoriesProvider = ({ children }) => {
  const [stories, setStories] = useState(HARDCODED_STORIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // TODO: BACKEND INTEGRATION - Fetch stories from API
  // useEffect(() => {
  //   fetchStories();
  // }, []);

  // TODO: BACKEND INTEGRATION - Replace with actual API call
  // const fetchStories = async () => {
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const token = await AsyncStorage.getItem('authToken');
  //     const data = await storyService.getStories(token);
  //     setStories(data);
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const completedStories = stories.filter(story => story.completed);
  const suggestedStories = stories.filter(story => !story.completed);

  return (
    <StoriesContext.Provider
      value={{
        stories,
        completedStories,
        suggestedStories,
        loading,
        error,
        // TODO: Add refresh function for backend integration
        // refreshStories: fetchStories,
      }}
    >
      {children}
    </StoriesContext.Provider>
  );
};

export const useStories = () => {
  const context = useContext(StoriesContext);
  if (!context) {
    throw new Error('useStories must be used within a StoriesProvider');
  }
  return context;
};

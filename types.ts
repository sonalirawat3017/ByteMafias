
export interface User {
  id: string;
  name: string;
  phone?: string; // Optional phone number
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
}

export interface Profile {
  interests: string[];
  foodPreferences: string[];
  budget: string;
  locationRadius: number;
  notificationsEnabled: boolean;
}

export interface Group {
  id: string;
  name:string;
  members: User[];
}

export interface Vote {
  userId: string;
  emoji: string;
}

export interface Suggestion {
  name: string;
  description: string;
  location: string;
  lat: number;
  lng: number;
  category: string;
  budgetINR: number;
  votes: Vote[];
  rating: number;
}

export type RsvpStatus = 'going' | 'maybe' | 'not-going' | 'pending';

export interface Rsvp {
  userId: string;
  status: RsvpStatus;
}

export interface ActivePlan {
  group: Group;
  date: string;
  time: string;
  mood: string;
  theme: string;
  suggestions: Suggestion[];
  rsvps: Rsvp[];
}

export interface GeminiSuggestionResponse {
  theme: string;
  suggestions: Omit<Suggestion, 'votes'>[];
}

export interface ItineraryActivity {
  time: string;
  activity: string;
  description: string;
}

export interface FinalizedItinerary {
  destination: Suggestion;
  timeline: ItineraryActivity[];
  date: string;
  group: Group;
}

export interface GeminiItineraryResponse {
    timeline: ItineraryActivity[];
}

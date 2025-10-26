import { GoogleGenAI, Type } from '@google/genai';
import type { Profile, Group, GeminiSuggestionResponse, User, ActivePlan, Suggestion, GeminiItineraryResponse } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a mock response.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const suggestionResponseSchema = {
  type: Type.OBJECT,
  properties: {
    theme: {
      type: Type.STRING,
      description: "A creative and fun theme for the outing, like 'Retro Arcade Night' or 'Culinary Adventure'."
    },
    suggestions: {
      type: Type.ARRAY,
      description: "A list of 3 to 4 outing suggestions.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the place or activity." },
          description: { type: Type.STRING, description: "A catchy, one-sentence description of why this is a good idea for the group." },
          location: { type: Type.STRING, description: "A general location or address within an Indian city." },
          lat: { type: Type.NUMBER, description: "The latitude of the location." },
          lng: { type: Type.NUMBER, description: "The longitude of the location." },
          category: { type: Type.STRING, description: "A category like 'Food', 'Entertainment', 'Outdoors', 'Nightlife', or 'Creative'." },
          budgetINR: { type: Type.NUMBER, description: "A tentative budget for one person in Indian Rupees (INR)." },
          rating: { type: Type.NUMBER, description: "A rating out of 5 (can be a decimal like 4.5), representing how suitable the suggestion is for the group, based on their preferences and mood." }
        },
        required: ['name', 'description', 'location', 'lat', 'lng', 'category', 'budgetINR', 'rating']
      }
    }
  },
  required: ['theme', 'suggestions']
};

const itineraryResponseSchema = {
  type: Type.OBJECT,
  properties: {
    timeline: {
      type: Type.ARRAY,
      description: "A timeline of activities for the outing, from start to finish.",
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING, description: "Specific time for the activity, e.g., '7:00 PM'." },
          activity: { type: Type.STRING, description: "Name of the activity." },
          description: { type: Type.STRING, description: "A brief, engaging description of what to do during this time." }
        },
        required: ['time', 'activity', 'description']
      }
    }
  },
  required: ['timeline']
};

export const getWeatherForecast = async (
  date: string,
  location: { lat: number; lng: number }
): Promise<'Sunny' | 'Rainy' | 'Cloudy'> => {
  // In a real app, this would call a weather API.
  // For this demo, we'll simulate a response.
  console.log(`Fetching weather for ${date} at`, location);
  return new Promise(resolve => {
    setTimeout(() => {
      const weatherOptions = ['Sunny', 'Rainy', 'Cloudy'];
      const randomIndex = Math.floor(Math.random() * weatherOptions.length);
      resolve(weatherOptions[randomIndex] as 'Sunny' | 'Rainy' | 'Cloudy');
    }, 500); // Simulate network delay
  });
};

const getMockSuggestionResponse = (): GeminiSuggestionResponse => {
    return {
        theme: "Epic Gamer Night",
        suggestions: [
            { name: "Pixel Paradise Arcade", description: "Relive the 80s with classic arcade games and neon lights.", location: "Koregaon Park, Pune", lat: 18.53, lng: 73.89, category: "Entertainment", budgetINR: 1500, rating: 4.8 },
            { name: "The Gilded Goblin Board Game Cafe", description: "A cozy spot with hundreds of board games and great snacks.", location: "Indiranagar, Bangalore", lat: 12.97, lng: 77.64, category: "Food", budgetINR: 800, rating: 4.5 },
            { name: "VR Quest Arena", description: "Immerse yourselves in a virtual world and battle zombies together.", location: "Cyber Hub, Gurgaon", lat: 28.49, lng: 77.08, category: "Entertainment", budgetINR: 2000, rating: 4.2 },
            { name: "Late Night Pizza & Console Bash", description: "Grab some pizzas and have a classic console tournament at home.", location: "Home", lat: 19.06, lng: 72.84, category: "Food", budgetINR: 600, rating: 3.8 },
        ]
    };
};

const getMockItineraryResponse = (): GeminiItineraryResponse => {
    return {
        timeline: [
            { time: "7:00 PM", activity: "Arrival at Pixel Paradise", description: "Everyone meets up at the entrance. Time to get your game face on!" },
            { time: "7:15 PM", activity: "Classic Arcade Challenge", description: "Hit the classics! Compete for the high score on Pac-Man and Donkey Kong." },
            { time: "8:30 PM", activity: "Snack Bar Fuel-Up", description: "Recharge with some loaded fries and milkshakes from the snack bar." },
            { time: "9:00 PM", activity: "Team Air Hockey Tournament", description: "Pair up for a fast-paced, 2v2 air hockey showdown to end the night." },
        ]
    };
};

export const getOutingSuggestions = async (
  profile: Profile,
  group: Group,
  mood: string,
  date: string,
  time: string,
  currentUser: User,
  weather: string,
  movieGenre?: string
): Promise<GeminiSuggestionResponse | null> => {

  if (!ai) {
    return new Promise(resolve => setTimeout(() => resolve(getMockSuggestionResponse()), 1500));
  }
  
  let prompt = `
    You are an expert event planner AI called PlanBuddy. Your goal is to suggest fun and exciting outings for a group of friends. All location suggestions MUST be in Indian cities.

    Here are the details for the planned outing:

    Group Name: ${group.name}
    Group Members: ${group.members.map(m => m.name).join(', ')}
    
    The user planning this is located near latitude ${currentUser.location.lat}, longitude ${currentUser.location.lng}. 
    Please prioritize suggestions that are reasonably close to this area.

    User Preferences:
    - Interests: ${profile.interests.join(', ')}
    - Food: ${profile.foodPreferences.join(', ')}
    - Budget: ${profile.budget}

    Outing Details:
    - Desired Mood: ${mood}
    - Date: ${date}
    - Time: ${time}
    - Weather Forecast: ${weather}

    **CRITICAL INSTRUCTION:** You MUST adapt your suggestions to the weather. 
    - If the weather is 'Rainy', suggest INDOOR activities (e.g., museums, indoor climbing, cozy cafes, arcades, cinemas).
    - If the weather is 'Sunny', strongly recommend OUTDOOR activities (e.g., parks, hiking, outdoor markets, rooftop bars).
    - If the weather is 'Cloudy', you can suggest a mix of indoor and outdoor options.
    `;

  if (mood === 'Movie') {
    prompt += `
      \n
IMPORTANT INSTRUCTION: The user has selected the 'Movie' mood. Therefore, you MUST ONLY suggest movie theaters, cinemas, drive-ins, or unique movie-watching venues in Indian cities. Do not suggest restaurants, bars, parks, or any other type of location. For these suggestions, the 'category' must be 'Entertainment'. The weather is still ${weather}, so consider if an indoor cinema or an outdoor/drive-in theater is more appropriate.
    `;
    if (movieGenre && movieGenre !== 'Any') {
      prompt += `
The user is specifically interested in the '${movieGenre}' genre. Please tailor your suggestions to movie theaters that are likely playing popular Hindi or English movies in this genre. You can even mention a currently popular movie in that genre as part of the description for extra flair.
      `;
    }
  }
  
  prompt += `
    \n
Based on all this information, generate a creative theme for the outing and a list of 3 to 4 specific, actionable suggestions (places to go, things to do). For each suggestion, provide its name, a short description, its general location (which MUST be a real place in an Indian city), its category, its approximate latitude and longitude coordinates, a tentative budget per person in Indian Rupees (INR), and a rating out of 5 (e.g., 4.5), representing how suitable you think the suggestion is for the group and the specified mood. Make the suggestions diverse and tailored to the group's preferences and the desired mood. Ensure the response is in the required JSON format and the categories are one of: 'Food', 'Entertainment', 'Outdoors', 'Nightlife', 'Creative'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: suggestionResponseSchema,
      },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as GeminiSuggestionResponse;
  } catch (error) {
    console.error("Error fetching suggestions from Gemini API:", error);
    // Fallback to mock for demo purposes if API fails
    return getMockSuggestionResponse();
  }
};


export const getDetailedItinerary = async (
  plan: ActivePlan,
  winningSuggestion: Suggestion
): Promise<GeminiItineraryResponse | null> => {

  if (!ai) {
    return new Promise(resolve => setTimeout(() => resolve(getMockItineraryResponse()), 1500));
  }

  const prompt = `
    You are an expert event planner AI. A group of friends has decided on an outing. Your task is to create a detailed, timed itinerary for them.

    Chosen Outing:
    - Name: ${winningSuggestion.name}
    - Description: ${winningSuggestion.description}
    - Location: ${winningSuggestion.location}

    Group & Timing Details:
    - Group: ${plan.group.name} (${plan.group.members.map(m => m.name).join(', ')})
    - Date: ${plan.date}
    - Start Time: ${plan.time}
    - Mood: ${plan.mood}

    Based on the chosen outing, create a step-by-step, hourly-based itinerary for the group. The timeline should be logical and fun, starting from the specified time. For each step, provide a specific time (e.g., '7:00 PM'), a name for the activity or place, and a brief description of what happens at that time, including when you will reach each place. The entire outing should last about 3-4 hours. Return the response in the required JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: itineraryResponseSchema,
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as GeminiItineraryResponse;
  } catch (error)
  {
    console.error("Error fetching detailed itinerary from Gemini API:", error);
    return getMockItineraryResponse();
  }
};
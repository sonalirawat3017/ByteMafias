import React, { useState, useEffect, useCallback } from 'react';
import type { Profile, Group, ActivePlan, User, FinalizedItinerary, RsvpStatus } from './types';
import Header from './components/Header';
import PlanOuting from './components/PlanOuting';
import ManageGroups from './components/ManageGroups';
import PastMemories from './components/PastMemories';
import ProfileSetup from './components/ProfileSetup';
import { UserIcon, DiamondIcon, ChatbotIcon } from './components/IconComponents';
import LoginPage from './components/LoginPage';
import PricingModal from './components/PricingModal';
import { getDetailedItinerary } from './services/geminiService';
import GamesAndRewards from './components/GamesAndRewards';
import Chatbot from './components/Chatbot';
import UpcomingEvents from './components/UpcomingEvents';
import Itinerary from './components/Itinerary';
import FinalizedItineraryView from './components/FinalizedItineraryView';

// MOCK DATA SETUP
const alice: User = { id: 'u1', name: 'Alice', location: { lat: 19.0760, lng: 72.8777 } }; // Mumbai
const bob: User = { id: 'u2', name: 'Bob', location: { lat: 19.0790, lng: 72.8737 } };
const charlie: User = { id: 'u3', name: 'Charlie', location: { lat: 19.0728, lng: 72.8826 } };
const david: User = { id: 'u4', name: 'David', location: { lat: 28.7041, lng: 77.1025 } }; // Delhi
const eve: User = { id: 'u5', name: 'Eve', location: { lat: 28.6941, lng: 77.1125 } };

const mockGroup1: Group = { id: 'g1', name: 'Weekend Warriors', members: [alice, bob, charlie] };
const mockGroup2: Group = { id: 'g2', name: 'Foodie Crew', members: [david, eve] };

// Function to get a date string for X days from now
const getDateFromNow = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const initialItineraries: FinalizedItinerary[] = [
  { // A past event
    date: getDateFromNow(-14),
    group: mockGroup1,
    destination: { name: "Pixel Paradise Arcade", description: "Relive the 80s with classic arcade games and neon lights.", location: "Bandra, Mumbai", lat: 19.05, lng: 72.83, category: "Entertainment", budgetINR: 1500, votes: [], rating: 4.8 },
    timeline: [
        { time: "7:00 PM", activity: "Arrival at Pixel Paradise", description: "Everyone meets up at the entrance." },
        { time: "9:00 PM", activity: "Team Air Hockey Tournament", description: "Pair up for a fast-paced showdown." },
    ]
  },
  { // An upcoming event
    date: getDateFromNow(7),
    group: mockGroup2,
    destination: { name: "The Starry Night Bistro", description: "Elegant dining under a simulated night sky.", location: "Connaught Place, Delhi", lat: 28.63, lng: 77.21, category: "Food", budgetINR: 4000, votes: [], rating: 4.9 },
    timeline: [
      { time: "8:00 PM", activity: "Cocktails & Appetizers", description: "Meet for pre-dinner drinks." },
      { time: "8:30 PM", activity: "Main Course", description: "Enjoy the main culinary event." },
    ]
  },
  { // Another upcoming event
    date: getDateFromNow(21),
    group: mockGroup1,
    destination: { name: "Sanjay Gandhi National Park Hike", description: "Enjoy stunning views of the city from the trails.", location: "Borivali, Mumbai", lat: 19.21, lng: 72.85, category: "Outdoors", budgetINR: 200, votes: [], rating: 4.7 },
    timeline: [
      { time: "9:00 AM", activity: "Meet at the Trailhead", description: "Gather and get ready for the hike." },
      { time: "11:00 AM", activity: "Kanheri Caves Exploration", description: "Explore the ancient Buddhist caves." },
    ]
  }
];
// END MOCK DATA


const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notificationPermission, setNotificationPermission] = useState('default');

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = useCallback(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
      });
    }
  }, []);


  const [profile, setProfile] = useState<Profile>({
    interests: ['Movies', 'Hiking', 'Live Music'],
    foodPreferences: ['Italian', 'Spicy', 'Vegan'],
    budget: '₹500 - ₹1500 (Mid-Range)',
    locationRadius: 10,
    notificationsEnabled: true,
  });

  const [groups, setGroups] = useState<Group[]>([mockGroup1, mockGroup2]);

  const [activePlan, setActivePlan] = useState<ActivePlan | null>(null);
  const [allItineraries, setAllItineraries] = useState<FinalizedItinerary[]>(initialItineraries);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [justFinalizedPlan, setJustFinalizedPlan] = useState<FinalizedItinerary | null>(null);
  
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const handleLogin = (user: User) => {
    const existingUserInGroups = groups
      .flatMap(g => g.members)
      .find(member => member.name.toLowerCase() === user.name.toLowerCase());
  
    if (existingUserInGroups) {
        setCurrentUser({ ...existingUserInGroups, location: user.location, phone: user.phone });
    } else {
        setCurrentUser(user);
        setGroups(prevGroups => {
          return prevGroups.map(g => {
            if (g.id === 'g1') {
              if (g.members.some(m => m.id === user.id || m.name.toLowerCase() === user.name.toLowerCase())) {
                  return g;
              }
              return { ...g, members: [...g.members, user] };
            }
            return g;
          });
        });
    }
    setIsAuthenticated(true);
  };

  const handleVote = (suggestionName: string, emoji: string) => {
    if (!activePlan || !currentUser) return;

    const updatedSuggestions = activePlan.suggestions.map(s => {
      if (s.name === suggestionName) {
        const existingVoteIndex = s.votes.findIndex(v => v.userId === currentUser.id);
        
        if (existingVoteIndex !== -1) {
          if (s.votes[existingVoteIndex].emoji === emoji) {
            const newVotes = s.votes.filter(v => v.userId !== currentUser.id);
            return { ...s, votes: newVotes };
          } else {
            const newVotes = [...s.votes];
            newVotes[existingVoteIndex] = { userId: currentUser.id, emoji };
            return { ...s, votes: newVotes };
          }
        } else {
          const newVote = { userId: currentUser.id, emoji };
          return { ...s, votes: [...s.votes, newVote] };
        }
      }
      return s;
    });

    setActivePlan({ ...activePlan, suggestions: updatedSuggestions });
  };


  const handleRsvp = (status: RsvpStatus) => {
    if (!activePlan || !currentUser) return;

    const updatedRsvps = activePlan.rsvps.map(rsvp => {
      if (rsvp.userId === currentUser.id) {
        return { ...rsvp, status };
      }
      return rsvp;
    });

    if (!updatedRsvps.some(rsvp => rsvp.userId === currentUser.id)) {
        updatedRsvps.push({ userId: currentUser.id, status });
    }

    setActivePlan({ ...activePlan, rsvps: updatedRsvps });
  };


  const finalizePlan = async () => {
    if (!activePlan) return;

    setIsFinalizing(true);
    try {
      const winningSuggestion = [...activePlan.suggestions].sort((a, b) => (b.votes.length || 0) - (a.votes.length || 0))[0];
      
      const detailedItineraryResult = await getDetailedItinerary(activePlan, winningSuggestion);

      if (detailedItineraryResult) {
         const newItinerary: FinalizedItinerary = {
          destination: winningSuggestion,
          timeline: detailedItineraryResult.timeline,
          date: activePlan.date,
          group: activePlan.group,
        };
        setAllItineraries(prev => [...prev, newItinerary]);
        setJustFinalizedPlan(newItinerary);
      }

      if (profile.notificationsEnabled && notificationPermission === 'granted') {
         setTimeout(() => {
           new Notification('Upcoming Outing Reminder!', {
             body: `Don't forget: "${winningSuggestion.name}" with ${activePlan.group.name} is happening soon!`,
             icon: '/vite.svg' 
           });
         }, 5000); 
      }

      setActivePlan(null);
    } catch (error) {
      console.error("Failed to finalize plan:", error);
    } finally {
      setIsFinalizing(false);
    }
  };
  
  const handleSetActivePlan = (plan: ActivePlan | null) => {
    if (plan) {
      setJustFinalizedPlan(null);
    }
    setActivePlan(plan);
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parseDateAsLocal = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const upcomingEvents = allItineraries
    .filter(it => parseDateAsLocal(it.date) >= today)
    .sort((a, b) => parseDateAsLocal(a.date).getTime() - parseDateAsLocal(b.date).getTime());

  const pastEvents = allItineraries
    .filter(it => parseDateAsLocal(it.date) < today)
    .sort((a, b) => parseDateAsLocal(b.date).getTime() - parseDateAsLocal(a.date).getTime());

  if (!isAuthenticated || !currentUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 lg:p-8">
      <div 
        className="absolute inset-0 z-0 opacity-10" 
        style={{backgroundImage: `url('https://www.transparenttextures.com/patterns/cubes.png')`}}>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto">
        <Header 
          username={currentUser.name} 
          notificationPermission={notificationPermission}
          onRequestNotificationPermission={requestNotificationPermission}
        />
        <div className="flex justify-end mb-6 gap-4">
            <button 
             onClick={() => setIsPricingModalOpen(true)}
             className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30"
           >
             <DiamondIcon />
             Upgrade Plan
           </button>
           <button 
             onClick={() => setIsProfileModalOpen(true)}
             className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 transform hover:scale-105 shadow-lg shadow-purple-500/30"
           >
             <UserIcon />
             My Profile
           </button>
        </div>

        <UpcomingEvents events={upcomingEvents} />
        
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <PlanOuting 
            groups={groups} 
            profile={profile} 
            currentUser={currentUser}
            setPlan={handleSetActivePlan}
            activePlan={activePlan}
            onVote={handleVote}
            onRsvp={handleRsvp}
            onFinalizePlan={finalizePlan}
            isFinalizing={isFinalizing}
          />
          {activePlan ? (
             <Itinerary activePlan={activePlan} />
          ) : justFinalizedPlan ? (
            <FinalizedItineraryView 
              itinerary={justFinalizedPlan} 
              onDone={() => setJustFinalizedPlan(null)} 
            />
          ) : (
            <PastMemories pastEvents={pastEvents} />
          )}
          <ManageGroups groups={groups} setGroups={setGroups} currentUser={currentUser} />
          <GamesAndRewards />
        </main>
        
        <footer className="text-center mt-12 py-4">
          <p className="text-sm text-slate-500 font-light">Made by ByteMafias</p>
        </footer>
      </div>

      {isProfileModalOpen && (
        <ProfileSetup 
          profile={profile}
          setProfile={setProfile}
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}

      {isPricingModalOpen && (
        <PricingModal onClose={() => setIsPricingModalOpen(false)} />
      )}

      <button
        onClick={() => setIsChatbotOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-lg transform hover:scale-110 transition-transform duration-300 z-40"
        aria-label="Open Chatbot"
      >
        <ChatbotIcon />
      </button>

      {isChatbotOpen && (
        <Chatbot 
            onClose={() => setIsChatbotOpen(false)}
            currentUser={currentUser}
            groups={groups}
            activePlan={activePlan}
        />
      )}
    </div>
  );
};

export default App;
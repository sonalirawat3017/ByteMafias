import React, { useState, useCallback } from 'react';
import type { Group, Profile, ActivePlan, User, Rsvp, RsvpStatus } from '../types';
import { getOutingSuggestions, getWeatherForecast } from '../services/geminiService';
import SuggestionCard from './SuggestionCard';
import { CalendarIcon, ClockIcon, GroupIcon, MoodIcon, SparklesIcon, CheckCircleIcon, RsvpGoingIcon, RsvpMaybeIcon, RsvpNotGoingIcon, SunnyIcon, RainyIcon, CloudyIcon } from './IconComponents';

interface PlanOutingProps {
  groups: Group[];
  profile: Profile;
  currentUser: User;
  setPlan: (plan: ActivePlan | null) => void;
  activePlan: ActivePlan | null;
  onVote: (suggestionName: string, emoji: string) => void;
  onRsvp: (status: RsvpStatus) => void;
  onFinalizePlan: () => void;
  isFinalizing: boolean;
}

const moods = [
    'Chill',
    'Cozy',
    'Party',
    'Adventurous',
    'Fancy',
    'Creative',
    'Foodie',
    'Sporty',
    'Romantic',
    'Budget Friendly',
    'Travel Mode',
    'Fun & Games',
    'Movie',
    'Relax & Reset',
    'Luxury',
    'Late Night',
    'Cultural',
    'Mystery Mood'
];

const movieGenres = ['Any', 'Action', 'Bollywood Masala', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller'];

const PlanOuting: React.FC<PlanOutingProps> = ({ groups, profile, currentUser, setPlan, activePlan, onVote, onRsvp, onFinalizePlan, isFinalizing }) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id || '');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('19:00');
  const [mood, setMood] = useState<string>('Chill');
  const [movieGenre, setMovieGenre] = useState<string>('Any');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId) {
      setError('Please select a group.');
      return;
    }
    const selectedGroup = groups.find(g => g.id === selectedGroupId);
    if (!selectedGroup) {
      setError('Selected group not found.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPlan(null);
    setWeather(null);

    try {
      const weatherForecast = await getWeatherForecast(date, currentUser.location);
      setWeather(weatherForecast);
      
      const result = await getOutingSuggestions(profile, selectedGroup, mood, date, time, currentUser, weatherForecast, movieGenre);

      if (result) {
        const initialRsvps: Rsvp[] = selectedGroup.members.map(member => ({
          userId: member.id,
          status: 'pending',
        }));

        setPlan({
          group: selectedGroup,
          date,
          time,
          mood,
          theme: result.theme,
          suggestions: result.suggestions.map(s => ({ ...s, votes: [] })),
          rsvps: initialRsvps,
        });
      } else {
        setError('Failed to get suggestions. The AI might be stumped!');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedGroupId, groups, profile, mood, date, time, setPlan, currentUser, movieGenre]);

  const sortedSuggestions = activePlan?.suggestions.slice().sort((a, b) => (b.votes.length || 0) - (a.votes.length || 0));

  const WeatherDisplay = () => {
    if (!weather || !activePlan) return null;
    let Icon;
    let colorClass = '';
    switch(weather) {
      case 'Sunny':
        Icon = SunnyIcon;
        colorClass = 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
        break;
      case 'Rainy':
        Icon = RainyIcon;
        colorClass = 'text-blue-400 border-blue-500/30 bg-blue-500/10';
        break;
      case 'Cloudy':
        Icon = CloudyIcon;
        colorClass = 'text-slate-400 border-slate-600 bg-slate-700/50';
        break;
      default:
        return null;
    }
    const eventDate = new Date(activePlan.date + 'T00:00:00');

    return (
      <div className={`flex items-center gap-2 text-sm p-2 rounded-md border mb-4 ${colorClass}`}>
        <Icon className="w-5 h-5" />
        <span>Forecast for {eventDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}: <strong>{weather}</strong></span>
      </div>
    );
  };

  const RsvpSection = () => {
    if (!activePlan) return null;

    const goingCount = activePlan.rsvps.filter(r => r.status === 'going').length;
    const maybeCount = activePlan.rsvps.filter(r => r.status === 'maybe').length;
    const currentUserRsvp = activePlan.rsvps.find(r => r.userId === currentUser.id)?.status;

    // Fix: Changed JSX.Element to React.ReactElement to resolve "Cannot find namespace 'JSX'" error.
    const RsvpIcons: { [key in RsvpStatus | 'pending']: React.ReactElement } = {
        going: <RsvpGoingIcon className="text-green-400 h-5 w-5" title="Going" />,
        maybe: <RsvpMaybeIcon className="text-yellow-400 h-5 w-5" title="Maybe" />,
        'not-going': <RsvpNotGoingIcon className="text-red-500 h-5 w-5" title="Not Going" />,
        pending: <span className="text-xs text-slate-500 w-5 h-5 flex items-center justify-center">-</span>,
    };

    return (
      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 mb-6">
        <h4 className="text-lg font-semibold text-white mb-3">Who's Going?</h4>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4 sm:gap-2">
            <p className="text-slate-300">
                <span className="font-bold text-green-400">{goingCount} Going</span>, <span className="font-bold text-yellow-400">{maybeCount} Maybe</span>
            </p>
            <div className="flex gap-2">
                <button onClick={() => onRsvp('going')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${currentUserRsvp === 'going' ? 'bg-green-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>Going</button>
                <button onClick={() => onRsvp('maybe')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${currentUserRsvp === 'maybe' ? 'bg-yellow-500 text-slate-900' : 'bg-slate-700 hover:bg-slate-600'}`}>Maybe</button>
                <button onClick={() => onRsvp('not-going')} className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors ${currentUserRsvp === 'not-going' ? 'bg-red-500 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>Not Going</button>
            </div>
        </div>

        <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {activePlan.group.members.map(member => {
                const rsvp = activePlan.rsvps.find(r => r.userId === member.id);
                const status = rsvp?.status || 'pending';
                
                return (
                    <li key={member.id} className="flex justify-between items-center bg-slate-800 p-2 rounded-md">
                        <span className="font-medium text-slate-200">{member.name} {member.id === currentUser.id && <span className="text-xs text-cyan-400 font-normal">(You)</span>}</span>
                        <div className="flex items-center gap-2">
                            {RsvpIcons[status]}
                        </div>
                    </li>
                )
            })}
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700 backdrop-blur-sm">
      <h2 className="text-3xl font-bold mb-6 text-cyan-400">Plan an Outing</h2>
      
      {!activePlan ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label htmlFor="group" className="block text-sm font-medium text-slate-300 mb-2">Group</label>
            <GroupIcon className="absolute left-3 top-10 text-slate-400" />
            <select id="group" value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-cyan-500 focus:outline-none">
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-2">Date</label>
              <CalendarIcon className="absolute left-3 top-10 text-slate-400" />
              <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-cyan-500 focus:outline-none appearance-none" />
            </div>
            <div className="relative">
              <label htmlFor="time" className="block text-sm font-medium text-slate-300 mb-2">Time</label>
              <ClockIcon className="absolute left-3 top-10 text-slate-400" />
              <input type="time" id="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-cyan-500 focus:outline-none appearance-none" />
            </div>
          </div>
          <div className="relative">
            <label htmlFor="mood" className="block text-sm font-medium text-slate-300 mb-2">Mood</label>
            <MoodIcon className="absolute left-3 top-10 text-slate-400" />
            <select id="mood" value={mood} onChange={e => setMood(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-cyan-500 focus:outline-none">
              {moods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          
          {mood === 'Movie' && (
            <div className="relative animate-fade-in-genre">
              <label htmlFor="genre" className="block text-sm font-medium text-slate-300 mb-2">Movie Genre</label>
              <SparklesIcon className="absolute left-3 top-10 text-slate-400 h-5 w-5" />
              <select id="genre" value={movieGenre} onChange={e => setMovieGenre(e.target.value)} className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-cyan-500 focus:outline-none">
                {movieGenres.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
          )}

          <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/30">
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating Ideas...
              </>
            ) : (
              <>
                <SparklesIcon />
                Generate Ideas with AI
              </>
            )}
          </button>
          {error && <p className="text-red-400 text-center">{error}</p>}
        </form>
      ) : (
        <div>
          <h3 className="text-2xl font-bold text-lime-400">{activePlan.theme}</h3>
          <p className="text-slate-300 mb-2">{activePlan.group.name} on {activePlan.date}</p>
          
          <WeatherDisplay />
          
          <RsvpSection />

          <div className="space-y-4">
            {sortedSuggestions && sortedSuggestions.map((suggestion, index) => (
              <SuggestionCard 
                key={suggestion.name} 
                suggestion={suggestion} 
                onVote={onVote}
                currentUser={currentUser}
                allMembers={activePlan.group.members}
                isTopPick={index === 0 && suggestion.votes.length > 0}
              />
            ))}
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
             <button onClick={() => { setPlan(null); setWeather(null); }} className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              Start Over
            </button>
            <button onClick={onFinalizePlan} disabled={isFinalizing} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait">
              {isFinalizing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Finalizing...
                </>
              ) : (
                <>
                  <CheckCircleIcon />
                  Finalize & Set Reminder
                </>
              )}
            </button>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fade-in-genre {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-genre { animation: fade-in-genre 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default PlanOuting;
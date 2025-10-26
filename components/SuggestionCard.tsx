
import React, { useState, useMemo } from 'react';
import type { Suggestion, User } from '../types';
import { calculateDistance } from '../utils/location';
import { MapPinIcon, RupeeIcon, StarIcon, StarIconOutline } from './IconComponents';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onVote: (name: string, emoji: string) => void;
  currentUser: User;
  allMembers: User[];
  isTopPick?: boolean;
}

const categoryColors: { [key: string]: string } = {
  'Food': 'bg-red-500/20 text-red-300 border-red-500/30',
  'Entertainment': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Outdoors': 'bg-green-500/20 text-green-300 border-green-500/30',
  'Nightlife': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Creative': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'Default': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onVote, currentUser, allMembers, isTopPick = false }) => {
  const [showDistances, setShowDistances] = useState(false);
  const colorClass = categoryColors[suggestion.category] || categoryColors.Default;

  const userDistance = useMemo(() => {
    if (currentUser.location && suggestion.lat && suggestion.lng) {
      return calculateDistance(
        currentUser.location.lat,
        currentUser.location.lng,
        suggestion.lat,
        suggestion.lng
      );
    }
    return null;
  }, [currentUser.location, suggestion.lat, suggestion.lng]);

  const memberDistances = useMemo(() => {
    return allMembers.map(member => ({
      name: member.name,
      distance: calculateDistance(member.location.lat, member.location.lng, suggestion.lat, suggestion.lng)
    })).sort((a,b) => a.distance - b.distance);
  }, [allMembers, suggestion.lat, suggestion.lng]);

  const renderStars = (rating: number) => {
    const stars = [];
    const roundedRating = Math.round(rating);

    for (let i = 0; i < 5; i++) {
        if (i < roundedRating) {
            stars.push(<StarIcon key={`full-${i}`} className="text-yellow-400" />);
        } else {
            stars.push(<StarIconOutline key={`empty-${i}`} className="text-yellow-400" />);
        }
    }

    return (
        <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">{stars}</div>
            <span className="font-bold text-slate-300">({rating.toFixed(1)})</span>
        </div>
    );
  };
  
  const primaryVoteEmoji = '👍';
  const reactionEmojis = ['🎉', '❤️', '🤔', '👎'];

  const voteCounts = useMemo(() => {
    return suggestion.votes.reduce((acc, vote) => {
      acc[vote.emoji] = (acc[vote.emoji] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [suggestion.votes]);

  const currentUserVote = useMemo(() => {
      return suggestion.votes.find(v => v.userId === currentUser.id);
  }, [suggestion.votes, currentUser.id]);

  const getVotersForEmoji = (emoji: string): string => {
    const voterNames = suggestion.votes
      .filter(vote => vote.emoji === emoji)
      .map(vote => {
        const voter = allMembers.find(member => member.id === vote.userId);
        return voter ? (voter.id === currentUser.id ? 'You' : voter.name) : 'Unknown';
      });
    
    if (voterNames.length === 0) {
      if (emoji === primaryVoteEmoji) return `Upvote this suggestion`;
      return `React with ${emoji}`;
    }
    return `Voted by: ${voterNames.join(', ')}`;
  };


  return (
    <div className={`relative bg-slate-700/50 p-4 rounded-lg border shadow-md transition-all duration-300 ${isTopPick ? 'border-lime-400 shadow-lime-500/20' : 'border-slate-600 hover:border-cyan-500 hover:shadow-cyan-500/20'}`}>
      {isTopPick && (
        <div className="absolute -top-3 right-4 bg-gradient-to-r from-lime-400 to-green-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg transform -rotate-3 z-10">
          🏆 Top Pick
        </div>
      )}
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-lg text-white">{suggestion.name}</h4>
          <p className="text-sm text-slate-300">{suggestion.description}</p>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-x-4 gap-y-1 flex-wrap">
            <span className="flex items-center gap-1">
                {renderStars(suggestion.rating)}
            </span>
            <span className="flex items-center gap-1">
                <MapPinIcon className="w-3 h-3 text-slate-500"/>
                {suggestion.location}
            </span>
            {userDistance !== null && (
              <span className="flex items-center gap-1 text-cyan-400 font-semibold">
                <MapPinIcon className="w-3 h-3"/>
                {userDistance.toFixed(1)} mi away
              </span>
            )}
            <span className="flex items-center gap-1 text-yellow-400 font-semibold">
                <RupeeIcon className="w-3 h-3" />
                {suggestion.budgetINR.toLocaleString('en-IN')} / person
            </span>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${colorClass} self-center whitespace-nowrap`}>
          {suggestion.category}
        </span>
      </div>
      
      {showDistances && (
        <div className="mt-4 pt-3 border-t border-slate-600">
          <h5 className="text-sm font-semibold text-slate-300 mb-2">Distances for the group:</h5>
          <ul className="space-y-1 text-xs text-slate-400">
            {memberDistances.map(member => (
              <li key={member.name} className="flex justify-between">
                <span>{member.name}</span>
                <span className="font-medium">{member.distance.toFixed(1)} mi</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-600/50">
        <button
          onClick={() => setShowDistances(!showDistances)}
          className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <MapPinIcon />
          {showDistances ? 'Hide Distances' : 'Show Distances'}
        </button>
        <div className="flex items-center gap-2">
            <div className="relative group">
                <button
                    onClick={() => onVote(suggestion.name, primaryVoteEmoji)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 border text-white font-semibold transform hover:scale-105 ${
                        currentUserVote?.emoji === primaryVoteEmoji
                        ? 'bg-cyan-600 border-cyan-500 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-600 border-slate-500 hover:bg-slate-500 hover:border-slate-400'
                    }`}
                    aria-label={getVotersForEmoji(primaryVoteEmoji)}
                >
                    <span className="text-lg leading-none -mt-1">{primaryVoteEmoji}</span>
                    <span>Vote</span>
                </button>
                {(voteCounts[primaryVoteEmoji] > 0) && (
                    <div className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-slate-700">
                        {voteCounts[primaryVoteEmoji]}
                    </div>
                )}
                 <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-slate-900 text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 whitespace-nowrap shadow-lg">
                    {getVotersForEmoji(primaryVoteEmoji)}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900"></div>
                </div>
            </div>

            <div className="h-6 w-px bg-slate-600"></div>

            {reactionEmojis.map(emoji => (
                <div key={emoji} className="relative group">
                    <button
                        onClick={() => onVote(suggestion.name, emoji)}
                        className={`flex items-center justify-center h-10 w-10 rounded-md transition-all duration-200 border text-white transform hover:scale-110 ${
                            currentUserVote?.emoji === emoji
                            ? 'bg-cyan-600 border-cyan-500 shadow-md shadow-cyan-500/20'
                            : 'bg-slate-600 border-slate-500 hover:bg-slate-500 hover:border-slate-400'
                        }`}
                        aria-label={getVotersForEmoji(emoji)}
                    >
                        <span className="text-lg leading-none">{emoji}</span>
                    </button>
                    {voteCounts[emoji] > 0 && (
                        <div className="absolute -top-2 -right-2 bg-pink-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-slate-700">
                            {voteCounts[emoji]}
                        </div>
                    )}
                     <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max bg-slate-900 text-white text-xs rounded-md py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 whitespace-nowrap shadow-lg">
                        {getVotersForEmoji(emoji)}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900"></div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default SuggestionCard;

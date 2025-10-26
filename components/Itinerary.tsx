import React from 'react';
import type { ActivePlan } from '../types';
import { ClipboardListIcon, MapPinIcon, RupeeIcon } from './IconComponents';

const Itinerary: React.FC<{ activePlan: ActivePlan | null }> = ({ activePlan }) => {
  if (!activePlan) return null;

  const parseDateAsLocal = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const eventDate = parseDateAsLocal(activePlan.date);

  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700 backdrop-blur-sm">
      <h2 className="text-3xl font-bold mb-6 text-purple-500 flex items-center gap-2">
        <ClipboardListIcon /> Itinerary
      </h2>
      <div className="space-y-6">
        <div>
           <p className="text-sm text-purple-300">Plan in Progress</p>
          <h3 className="text-2xl font-bold text-white">{activePlan.theme}</h3>
        </div>
        
        <div className="text-sm text-slate-300 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
          <p><strong>Group:</strong> {activePlan.group.name}</p>
          <p><strong>Date:</strong> {eventDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <p><strong>Time:</strong> {activePlan.time}</p>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-3 text-slate-200">Suggestions:</h4>
          <ul className="space-y-3">
            {activePlan.suggestions.map((suggestion) => (
              <li key={suggestion.name} className="bg-slate-700/70 p-3 rounded-lg">
                <p className="font-bold text-white">{suggestion.name}</p>
                <div className="flex items-center justify-between text-xs mt-1 text-slate-400">
                   <span className="flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3"/> {suggestion.location}
                   </span>
                   <span className="flex items-center gap-1 font-semibold text-yellow-400">
                      <RupeeIcon className="w-3 h-3"/> {suggestion.budgetINR.toLocaleString('en-IN')}
                   </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Itinerary;
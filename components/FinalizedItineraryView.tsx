import React from 'react';
import type { FinalizedItinerary } from '../types';
import { ClipboardListIcon, MapPinIcon, RupeeIcon, CalendarIcon, GroupIcon, CheckCircleIcon } from './IconComponents';

interface FinalizedItineraryViewProps {
  itinerary: FinalizedItinerary;
  onDone: () => void;
}

const FinalizedItineraryView: React.FC<FinalizedItineraryViewProps> = ({ itinerary, onDone }) => {
  const parseDateAsLocal = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  const eventDate = parseDateAsLocal(itinerary.date);

  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-green-500 backdrop-blur-sm animate-fade-in h-full flex flex-col">
      <h2 className="text-3xl font-bold mb-4 text-green-400 flex items-center gap-2">
        <CheckCircleIcon /> Plan Finalized!
      </h2>
      <p className="text-slate-300 mb-6">Here's your finalized itinerary. Reminders have been set for the group!</p>
      
      <div className="space-y-6 overflow-y-auto pr-2 flex-grow">
        <div>
          <p className="text-sm text-green-300 font-semibold">Destination</p>
          <h3 className="text-2xl font-bold text-white">{itinerary.destination.name}</h3>
          <p className="text-slate-400 mt-1">{itinerary.destination.description}</p>
          <div className="text-sm text-slate-400 mt-2 flex items-center gap-x-4 gap-y-1 flex-wrap">
             <span className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4"/> {itinerary.destination.location}
             </span>
             <span className="flex items-center gap-1 font-semibold text-yellow-400">
                <RupeeIcon className="w-4 h-4"/> {itinerary.destination.budgetINR.toLocaleString('en-IN')} / person
             </span>
          </div>
        </div>
        
        <div className="text-sm text-slate-300 p-3 bg-slate-900/50 rounded-lg border border-slate-700 space-y-2">
            <div className="flex items-center gap-2">
                <GroupIcon className="w-4 h-4 text-slate-400" />
                <span><strong>Group:</strong> {itinerary.group.name}</span>
            </div>
            <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-slate-400" />
                <span><strong>Date:</strong> {eventDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold mb-3 text-slate-200">Timeline:</h4>
          <ul className="space-y-4 border-l-2 border-slate-600 ml-2">
            {itinerary.timeline.map((activity, index) => (
              <li key={index} className="relative pl-6">
                 <div className="absolute -left-[9px] top-1 w-4 h-4 bg-slate-500 rounded-full border-4 border-slate-800"></div>
                 <p className="font-bold text-purple-400">{activity.time} - {activity.activity}</p>
                 <p className="text-slate-400 text-sm">{activity.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
        
      <button
        onClick={onDone}
        className="w-full mt-6 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-4 rounded-lg transition-colors shrink-0"
      >
        Awesome! View All Plans
      </button>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        .overflow-y-auto::-webkit-scrollbar { width: 6px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background-color: #475569; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default FinalizedItineraryView;

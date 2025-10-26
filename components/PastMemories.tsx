
import React from 'react';
import type { FinalizedItinerary } from '../types';
import { CameraIcon, MapPinIcon } from './IconComponents';

interface PastMemoriesProps {
  pastEvents: FinalizedItinerary[];
}

const MemoryCard: React.FC<{ event: FinalizedItinerary }> = ({ event }) => {
    const parseDateAsLocal = (dateString: string) => {
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const eventDate = parseDateAsLocal(event.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysAgo = Math.round((today.getTime() - eventDate.getTime()) / (1000 * 3600 * 24));
    
    let timeAgo = '';
    if (daysAgo <= 0) {
        timeAgo = 'Recently';
    } else if (daysAgo === 1) {
        timeAgo = 'Yesterday';
    } else if (daysAgo < 30) {
        timeAgo = `${daysAgo} days ago`;
    } else {
        timeAgo = eventDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    }

    return (
        <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4 w-60 flex-shrink-0 flex flex-col gap-3 transition-all duration-300 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
            <div className="overflow-hidden">
                <p className="text-xs text-purple-300">{timeAgo}</p>
                <h3 className="font-bold text-white truncate" title={event.destination.name}>{event.destination.name}</h3>
                <p className="text-sm text-slate-400 truncate flex items-center gap-1 mt-1" title={event.destination.location}>
                    <MapPinIcon className="w-3 h-3"/> {event.destination.location}
                </p>
            </div>
            <div className="text-sm text-slate-300 bg-slate-800/60 p-2 rounded-md mt-auto">
                <p>With <strong>{event.group.name}</strong></p>
            </div>
        </div>
    );
};


const PastMemories: React.FC<PastMemoriesProps> = ({ pastEvents }) => {

  const renderPlaceholder = () => (
     <div className="text-center text-slate-400 py-10 flex flex-col items-center justify-center h-full">
        <CameraIcon />
        <p className="mt-4 font-semibold">No Past Memories Yet</p>
        <p className="text-sm">Finalized plans will appear here once they've happened.</p>
      </div>
  );

  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700 backdrop-blur-sm">
      <h2 className="text-3xl font-bold mb-6 text-purple-500 flex items-center gap-2">
        <CameraIcon /> Past Memories
      </h2>
      
      {pastEvents.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-4 -ml-2 pl-2 scrollbar-thin">
            {pastEvents.map((event, index) => (
                <MemoryCard key={`${event.destination.name}-${index}`} event={event} />
            ))}
        </div>
      ) : (
        renderPlaceholder()
      )}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar { height: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background-color: #475569; border-radius: 10px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background-color: #64748b; }
      `}</style>
    </div>
  );
};

export default PastMemories;

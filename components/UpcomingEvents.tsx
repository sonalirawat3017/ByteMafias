
import React from 'react';
import type { FinalizedItinerary } from '../types';
import { 
  CalendarIcon, 
  GroupIcon,
  SparklesIcon,
  FoodIcon,
  EntertainmentIcon,
  OutdoorsIcon,
  NightlifeIcon,
  CreativeIcon,
} from './IconComponents';

const CategoryIcon: React.FC<{ category: string }> = ({ category }) => {
  const iconProps = { className: "w-full h-full text-slate-300" };
  switch (category) {
    case 'Food':
      return <FoodIcon {...iconProps} />;
    case 'Entertainment':
      return <EntertainmentIcon {...iconProps} />;
    case 'Outdoors':
      return <OutdoorsIcon {...iconProps} />;
    case 'Nightlife':
      return <NightlifeIcon {...iconProps} />;
    case 'Creative':
      return <CreativeIcon {...iconProps} />;
    default:
      return <SparklesIcon />;
  }
};

const EventCard: React.FC<{ event: FinalizedItinerary }> = ({ event }) => {
  const eventDate = new Date(event.date);
  // Add time to date to get correct day by avoiding timezone issues
  eventDate.setUTCHours(0, 0, 0, 0);

  const formattedDate = eventDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 w-64 flex-shrink-0 flex flex-col gap-3 transition-all duration-300 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1">
      <div className="flex items-center gap-4">
        <div className="bg-slate-700 p-2 rounded-lg w-12 h-12 shrink-0">
          <CategoryIcon category={event.destination.category} />
        </div>
        <div className="overflow-hidden">
          <h3 className="font-bold text-white truncate" title={event.destination.name}>{event.destination.name}</h3>
          <p className="text-sm text-slate-400 truncate" title={event.destination.location}>{event.destination.location}</p>
        </div>
      </div>
      <div className="text-sm text-slate-300 bg-slate-700/50 p-3 rounded-md flex flex-col gap-2 mt-auto">
        <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
            <GroupIcon className="w-4 h-4 text-slate-400" />
            <span>For {event.group.name}</span>
        </div>
      </div>
    </div>
  );
};

interface UpcomingEventsProps {
  events: FinalizedItinerary[];
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events }) => {
  if (events.length === 0) {
    return (
        <div className="mb-8 p-6 text-center bg-slate-800/50 rounded-2xl border border-slate-700 backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-2 text-purple-400">Upcoming Adventures</h2>
            <p className="text-slate-400">You have no upcoming plans. Create one below to get started!</p>
        </div>
    );
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-purple-400">Upcoming Adventures</h2>
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 scrollbar-thin">
        {events.map((event, index) => (
          <EventCard key={`${event.destination.name}-${index}`} event={event} />
        ))}
      </div>
       <style>{`
        /* Simple scrollbar styling for webkit browsers */
        .scrollbar-thin::-webkit-scrollbar {
            height: 8px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
            background: #1e293b; /* slate-800 */
            border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
            background-color: #475569; /* slate-600 */
            border-radius: 10px;
            border: 2px solid #1e293b; /* slate-800 */
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background-color: #64748b; /* slate-500 */
        }
       `}</style>
    </div>
  );
};

export default UpcomingEvents;

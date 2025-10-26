
import React from 'react';

interface NotificationBellProps {
  permission: string;
  onRequest: () => void;
}

const BellIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);


const NotificationBell: React.FC<NotificationBellProps> = ({ permission, onRequest }) => {
  const getBellStatus = () => {
    switch (permission) {
      case 'granted':
        return { 
          color: 'text-green-400', 
          title: 'Notifications enabled',
          action: () => {}
        };
      case 'denied':
        return { 
          color: 'text-red-500', 
          title: 'Notifications blocked. Check browser settings.',
          action: () => {}
        };
      default: // 'default'
        return { 
          color: 'text-yellow-400 animate-pulse', 
          title: 'Click to enable notifications',
          action: onRequest
        };
    }
  };

  const { color, title, action } = getBellStatus();

  return (
    <button 
      onClick={action}
      title={title}
      className={`relative rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-800 ${permission === 'default' ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <span className="sr-only">View notifications</span>
      <BellIcon className={color} />
      {permission === 'denied' && (
        <span className="absolute top-0 right-0 block h-2 w-2 text-xs text-white transform -translate-y-1/2 translate-x-1/2">
            !
        </span>
      )}
    </button>
  );
};

export default NotificationBell;

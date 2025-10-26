
import React from 'react';
import { SparklesIcon } from './IconComponents';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  username: string;
  notificationPermission: string;
  onRequestNotificationPermission: () => void;
}

const Header: React.FC<HeaderProps> = ({ username, notificationPermission, onRequestNotificationPermission }) => {
  return (
    <header className="text-center mb-10">
      <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400">
        PlanBuddy
      </h1>
      <p className="mt-4 text-lg text-slate-300 flex items-center justify-center gap-2">
        <SparklesIcon /> Your AI-powered planner for unforgettable outings
      </p>
      <div className="mt-2 text-md text-cyan-400 flex items-center justify-center gap-4">
        <span>Welcome, {username}!</span>
        <NotificationBell 
          permission={notificationPermission}
          onRequest={onRequestNotificationPermission}
        />
      </div>
    </header>
  );
};

export default Header;
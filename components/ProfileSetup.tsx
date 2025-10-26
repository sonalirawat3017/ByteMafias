
import React, { useState } from 'react';
import type { Profile } from '../types';
import { CloseIcon, UserIcon } from './IconComponents';

interface ProfileSetupProps {
  profile: Profile;
  setProfile: (profile: Profile) => void;
  onClose: () => void;
}

const budgetOptions = [
  { display: 'Under ₹500', value: 'Under ₹500 (Budget-Friendly)' },
  { display: '₹500 - ₹1500', value: '₹500 - ₹1500 (Mid-Range)' },
  { display: '₹1500 - ₹3000', value: '₹1500 - ₹3000 (Premium)' },
  { display: 'Above ₹3000', value: 'Above ₹3000 (Luxury)' },
];

const ProfileSetup: React.FC<ProfileSetupProps> = ({ profile, setProfile, onClose }) => {
  const [interests, setInterests] = useState(profile.interests.join(', '));
  const [foodPreferences, setFoodPreferences] = useState(profile.foodPreferences.join(', '));
  const [budget, setBudget] = useState(profile.budget);
  const [notificationsEnabled, setNotificationsEnabled] = useState(profile.notificationsEnabled);

  const handleSave = () => {
    setProfile({
      ...profile,
      interests: interests.split(',').map(i => i.trim()).filter(Boolean),
      foodPreferences: foodPreferences.split(',').map(f => f.trim()).filter(Boolean),
      budget,
      notificationsEnabled,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-lg relative shadow-2xl shadow-purple-500/20">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <CloseIcon />
        </button>
        <h2 className="text-3xl font-bold mb-6 text-purple-400 flex items-center gap-3"><UserIcon /> Profile & Preferences</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">My Interests (comma-separated)</label>
            <input 
              type="text" 
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g., Hiking, Board Games, Art"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Food Preferences (comma-separated)</label>
            <input 
              type="text" 
              value={foodPreferences}
              onChange={(e) => setFoodPreferences(e.target.value)}
              placeholder="e.g., Sushi, Tacos, Vegetarian"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Typical Budget (per person)</label>
            <div className="flex flex-wrap gap-2">
              {budgetOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setBudget(option.value)}
                  className={`px-4 py-2 rounded-lg transition-all text-sm font-semibold ${budget === option.value ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}
                >
                  {option.display}
                </button>
              ))}
            </div>
          </div>
           <div className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg">
              <label htmlFor="notifications-enabled" className="text-sm font-medium text-slate-300">Enable Outing Reminders</label>
              <button
                role="switch"
                aria-checked={notificationsEnabled}
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`${
                  notificationsEnabled ? 'bg-purple-600' : 'bg-slate-600'
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                <span
                  className={`${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </button>
            </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-2 px-6 rounded-lg transition-all transform hover:scale-105"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;

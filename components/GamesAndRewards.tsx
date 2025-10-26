import React, { useState } from 'react';
import { PuzzlePieceIcon } from './IconComponents';

const rewards = [
  "10% Off Next Meal",
  "Free Dessert",
  "VIP Entry",
  "Buy 1 Get 1 Free",
  "Free Movie Ticket",
  "Upgrade Your Seat",
  "A Funky Hat",
  "Try Again!",
];

const GamesAndRewards: React.FC = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);

  const spinWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    const randomDegrees = Math.floor(Math.random() * 360) + 360 * 5; // Spin at least 5 times
    const newRotation = rotation + randomDegrees;
    setRotation(newRotation);

    setTimeout(() => {
      const finalRotation = newRotation % 360;
      const segmentAngle = 360 / rewards.length;
      // Adjust for the pointer being at the top (0 degrees)
      const winningIndex = Math.floor((360 - finalRotation + (segmentAngle/2)) % 360 / segmentAngle);
      setResult(rewards[winningIndex]);
      setIsSpinning(false);
    }, 4000); // Corresponds to animation duration
  };

  const gameIdeas = [
    { name: "Two Truths and a Lie", description: "Each person tells three 'facts' about themselves—two true, one false. The group guesses the lie." },
    { name: "20 Questions", description: "One person thinks of an item, and everyone else gets to ask 20 yes/no questions to figure it out." },
    { name: "Pictionary", description: "One person draws a word, and their team tries to guess what it is. Perfect for online play with a shared whiteboard!" },
  ];

  return (
    <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700 backdrop-blur-sm">
      <h2 className="text-3xl font-bold mb-6 text-yellow-400 flex items-center gap-2">
        <PuzzlePieceIcon /> Games & Rewards
      </h2>

      <div className="space-y-8">
        {/* Spin the Wheel */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-slate-200">Spin for Rewards!</h3>
          <div className="flex flex-col items-center gap-6">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-full h-full rounded-full border-4 border-slate-600 transition-transform duration-[4000ms] ease-out"
                  style={{ 
                    transform: `rotate(${rotation}deg)`,
                    background: `conic-gradient(
                      #4ade80 0deg 45deg,
                      #38bdf8 45deg 90deg,
                      #818cf8 90deg 135deg,
                      #c084fc 135deg 180deg,
                      #f472b6 180deg 225deg,
                      #fb923c 225deg 270deg,
                      #facc15 270deg 315deg,
                      #ef4444 315deg 360deg
                    )`
                  }}
                >
                  {rewards.map((reward, index) => (
                    <div 
                      key={index}
                      className="absolute w-1/2 h-1/2 origin-bottom-right flex items-center justify-end pr-4 text-xs font-bold text-white"
                      style={{ transform: `rotate(${index * (360 / rewards.length)}deg) skewY(-${90 - (360/rewards.length)}deg)` }}
                    >
                      <span className="block text-center" style={{transform: `skewY(${90 - (360/rewards.length)}deg) rotate(${(360 / rewards.length)/2}deg)`}}>{reward.split(' ').slice(0,2).join(' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-slate-800 rounded-full border-4 border-slate-500 z-10"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-0 h-0 
                border-x-[12px] border-x-transparent 
                border-b-[20px] border-b-yellow-400 z-20"></div>
            </div>
            
            <button 
              onClick={spinWheel} 
              disabled={isSpinning}
              className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold py-3 px-8 rounded-lg transition-colors transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {isSpinning ? 'Spinning...' : 'Spin the Wheel!'}
            </button>
            
            {result && !isSpinning && (
              <p className="text-center text-lg font-bold text-lime-400 bg-lime-500/10 p-3 rounded-lg animate-pulse">
                You won: {result}
              </p>
            )}
          </div>
        </div>

        {/* Group Games */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-slate-200">Fun Group Game Ideas</h3>
          <ul className="space-y-3">
            {gameIdeas.map(game => (
              <li key={game.name} className="bg-slate-700/70 p-3 rounded-lg">
                <p className="font-bold text-white">{game.name}</p>
                <p className="text-sm text-slate-400 mt-1">{game.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GamesAndRewards;
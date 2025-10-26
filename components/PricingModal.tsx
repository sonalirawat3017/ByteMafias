import React from 'react';
import { CloseIcon, CheckIcon } from './IconComponents';

const pricingPlans = [
  {
    name: 'Basic',
    price: '₹0',
    frequency: '/ forever',
    description: 'For casual plans',
    features: [
      '2 groups',
      '3 plans per month',
      'Place suggestions',
      'Voting system',
      'Mood filters (basic)',
      'AI Genie Chatbot',
    ],
    buttonText: 'Start Free',
    buttonClass: 'bg-slate-600 hover:bg-slate-700',
  },
  {
    name: 'Plus',
    price: '₹99',
    frequency: '/ month',
    description: 'Best for Friends',
    features: [
      'Unlimited groups',
      '10 plans per month',
      'Mood-based suggestions',
      'Smart place filters',
      'Itinerary builder (basic)',
      'Group polls',
      'AI Genie Chatbot',
    ],
    buttonText: 'Upgrade',
    buttonClass: 'bg-cyan-600 hover:bg-cyan-700',
    highlight: true,
    highlightText: 'Best for Friends ⭐',
  },
  {
    name: 'Pro',
    price: '₹199',
    frequency: '/ month',
    description: 'Best Value',
    features: [
      'Everything in Plus',
      'AI itinerary planner',
      'Budget split',
      'Real-time voting',
      'Nearby restaurant/cafe picks',
      'Unlock rewards for in-app games',
    ],
    buttonText: 'Go Pro',
    buttonClass: 'bg-purple-600 hover:bg-purple-700',
    highlight: true,
    highlightText: 'Best Value 🎉',
  },
  {
    name: 'Elite',
    price: '₹399',
    frequency: '/ month',
    description: 'For the ultimate planner',
    features: [
      'Everything in Pro',
      'Advanced AI trip concierge',
      'VIP meetup ideas',
      'Travel + weekend getaways',
      'Group themes & badges',
      'Priority support',
    ],
    buttonText: 'Go Elite',
    buttonClass: 'bg-pink-600 hover:bg-pink-700',
  },
];


const PricingModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-4 sm:p-6 md:p-8 w-full max-w-6xl relative shadow-2xl shadow-cyan-500/10 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10">
          <CloseIcon />
        </button>
        <div className="text-center mb-8 md:mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400">
                Pricing Plans
            </h2>
            <p className="mt-2 text-slate-300 max-w-xl mx-auto">Choose the plan that's right for your crew and unlock powerful features to make planning effortless.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 md:gap-8">
            {pricingPlans.map((plan) => (
                <div key={plan.name} className={`relative bg-slate-800/70 p-6 rounded-xl border-2 transition-all duration-300 flex flex-col hover:scale-105 hover:border-purple-500 ${plan.highlight ? 'border-purple-500 shadow-lg shadow-purple-500/20' : 'border-slate-700'}`}>
                    {plan.highlight && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                           {plan.highlightText}
                        </div>
                    )}
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    <p className="text-slate-400 mt-1 h-10">{plan.description}</p>
                    <div className="my-6 text-center">
                        <span className="text-5xl font-extrabold text-white">{plan.price}</span>
                        <span className="text-slate-400">{plan.frequency}</span>
                    </div>
                    <ul className="space-y-3 text-slate-300 flex-grow mb-6">
                        {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <CheckIcon className="h-5 w-5 text-green-400 shrink-0 mt-1" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                    <button className={`w-full mt-auto font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 text-white ${plan.buttonClass}`}>
                        {plan.buttonText}
                    </button>
                </div>
            ))}
        </div>

      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        /* For scrollbar styling in webkit browsers */
        .overflow-y-auto::-webkit-scrollbar {
            width: 8px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
            background: transparent;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
            background-color: #4a5568; /* slate-600 */
            border-radius: 20px;
            border: 3px solid #1e293b; /* slate-800 */
        }
      `}</style>
    </div>
  );
};

export default PricingModal;
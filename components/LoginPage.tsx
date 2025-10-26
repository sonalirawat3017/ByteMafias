import React, { useState } from 'react';
import { SparklesIcon, UserIcon, PhoneIcon } from './IconComponents';
import type { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoginView, setIsLoginView] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!isLoginView && !name.trim()) || !phone.trim()) return;
    
    // Simulate sending OTP
    console.log(`Sending OTP to ${phone} for user ${name}`);
    setOtpSent(true);
  };

  const handleLogin = () => {
    setIsLoading(true);
    setError(null);
    // Simulate OTP verification
    if (otp.length < 4) {
        setError("Please enter a valid OTP.");
        setIsLoading(false);
        return;
    }

    const baseUser = {
      name: isLoginView ? `User-${phone.slice(-4)}` : name.trim(),
      phone: phone.trim(),
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLogin({
          ...baseUser,
          id: `u-${Date.now()}`,
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
      },
      (geoError) => {
        console.error("Geolocation error:", geoError);
        setError("Could not get your location. Please enable location services.");
        // Fallback to a default location if geolocation fails
        onLogin({
          ...baseUser,
          id: `u-${Date.now()}`,
          location: { lat: 19.0760, lng: 72.8777 }, // Default to Mumbai
        });
      },
      { timeout: 10000 }
    );
  };
  
  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setOtpSent(false);
    setOtp('');
    setName('');
    setPhone('');
    setError(null);
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 relative">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-500 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        <div className="relative z-10 w-full max-w-md text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400">
                PlanBuddy
            </h1>
            <p className="mt-4 text-lg text-slate-300 flex items-center justify-center gap-2">
                <SparklesIcon /> Your AI-powered planner for unforgettable outings
            </p>

            <div className="mt-12 bg-slate-800/50 p-8 rounded-2xl shadow-lg border border-slate-700 backdrop-blur-sm">
                {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                    <h2 className="text-2xl font-bold text-white mb-4">{isLoginView ? 'Welcome Back!' : 'Create Your Account'}</h2>
                    {!isLoginView && (
                    <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                        type="text" value={name} onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name"
                        className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 pl-12 pr-4 text-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all" required
                        />
                    </div>
                    )}
                    <div className="relative">
                        <PhoneIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                            placeholder="Phone Number"
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 pl-12 pr-4 text-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all" required
                        />
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3 px-4 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/30">
                    Send Code
                    </button>
                </form>
                ) : (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white mb-2">Verify Code</h2>
                    <p className="text-slate-300">Enter the code sent to {phone}</p>
                    <input
                    type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
                    placeholder="4-Digit Code"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg py-3 px-4 text-center text-2xl tracking-[1em] focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all" maxLength={4}
                    />
                    <button 
                    onClick={handleLogin} disabled={isLoading}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-4 rounded-lg text-xl transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30 disabled:opacity-50"
                    >
                    {isLoading ? 'Verifying...' : 'Log In & Plan!'}
                    </button>
                    {error && <p className="text-red-400">{error}</p>}
                </div>
                )}

                <p className="mt-6 text-sm">
                {isLoginView ? "Don't have an account? " : "Already have an account? "}
                <button onClick={toggleView} className="font-semibold text-cyan-400 hover:text-cyan-300">
                    {isLoginView ? 'Sign Up' : 'Log In'}
                </button>
                </p>
            </div>
            <p className="text-sm text-slate-400/50 mt-8">Made by ByteMafias</p>
        </div>
        <style>{`
            @keyframes blob {
                0% { transform: translate(0px, 0px) scale(1); }
                33% { transform: translate(30px, -50px) scale(1.1); }
                66% { transform: translate(-20px, 20px) scale(0.9); }
                100% { transform: translate(0px, 0px) scale(1); }
            }
            .animation-delay-2000 { animation-delay: 2s; }
            .animation-delay-4000 { animation-delay: 4s; }
            .animate-blob { animation: blob 7s infinite; }
        `}</style>
    </div>
  );
};

export default LoginPage;
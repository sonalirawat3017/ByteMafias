
import React, { useState } from 'react';
import type { Group } from '../types';
import { CloseIcon, LinkIcon, ClipboardCopyIcon, PaperAirplaneIcon } from './IconComponents';

interface InviteModalProps {
  group: Group;
  onClose: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ group, onClose }) => {
  const [invitee, setInvitee] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [inviteSent, setInviteSent] = useState<string | null>(null);

  const inviteLink = `${window.location.origin}?join_group=${group.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitee.trim()) return;
    // Simulate sending an invite
    setInviteSent(`Invite sent to ${invitee}!`);
    setInvitee('');
    setTimeout(() => setInviteSent(null), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 w-full max-w-md relative shadow-2xl shadow-pink-500/20">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <CloseIcon />
        </button>
        <h2 className="text-3xl font-bold mb-6 text-pink-400">Invite to {group.name}</h2>
        
        <div className="space-y-6">
          {/* Share Link Section */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Share a join link</label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                  <input 
                    type="text" 
                    value={inviteLink}
                    readOnly
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-slate-300 text-sm"
                  />
              </div>
              <button
                onClick={handleCopyLink}
                className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2 text-sm shrink-0"
              >
                <ClipboardCopyIcon />
                {linkCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="flex items-center text-center">
            <div className="flex-grow border-t border-slate-600"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-sm">OR</span>
            <div className="flex-grow border-t border-slate-600"></div>
          </div>

          {/* Send Invite Section */}
          <form onSubmit={handleSendInvite}>
            <label htmlFor="invitee-name" className="block text-sm font-medium text-slate-300 mb-2">Send a friend request</label>
            <div className="flex gap-2">
              <input
                id="invitee-name"
                type="text"
                value={invitee}
                onChange={(e) => setInvitee(e.target.value)}
                placeholder="Friend's name or phone"
                className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 focus:ring-2 focus:ring-pink-500 focus:outline-none"
              />
              <button 
                type="submit" 
                className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
              >
                <PaperAirplaneIcon />
                Send
              </button>
            </div>
             {inviteSent && <p className="text-green-400 text-sm mt-2 text-center">{inviteSent}</p>}
          </form>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;

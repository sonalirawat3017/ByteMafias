import React, { useState } from 'react';
import type { Group, User } from '../types';
import { PlusIcon, TrashIcon, UserGroupIcon, ShareIcon, NudgeIcon, CheckIcon } from './IconComponents';
import InviteModal from './InviteModal';

interface ManageGroupsProps {
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  currentUser: User;
}

const ManageGroups: React.FC<ManageGroupsProps> = ({ groups, setGroups, currentUser }) => {
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupMembers, setNewGroupMembers] = useState('');
  const [inviteModalGroupId, setInviteModalGroupId] = useState<string | null>(null);
  const [nudgedMembers, setNudgedMembers] = useState<Record<string, boolean>>({});

  const addGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupMembers.trim()) return;
    
    const memberUsers: User[] = newGroupMembers.split(',').map((name, index) => {
      const trimmedName = name.trim();
      return {
        id: `u-manual-${Date.now()}-${index}`,
        name: trimmedName,
        location: {
          lat: 19.0760 + (Math.random() - 0.5) * 0.1,
          lng: 72.8777 + (Math.random() - 0.5) * 0.1,
        }
      };
    });

    const newGroup: Group = {
      id: `g${Date.now()}`,
      name: newGroupName,
      members: [currentUser, ...memberUsers],
    };

    setGroups([...groups, newGroup]);
    setNewGroupName('');
    setNewGroupMembers('');
  };

  const deleteGroup = (id: string) => {
    setGroups(groups.filter(g => g.id !== id));
  };
  
  const handleNudge = (groupId: string, memberId: string) => {
    const nudgeId = `${groupId}-${memberId}`;
    setNudgedMembers(prev => ({ ...prev, [nudgeId]: true }));
    // Here you could also trigger a push notification or an in-app message in a real app
  };

  const selectedGroupForInvite = groups.find(g => g.id === inviteModalGroupId);

  return (
    <>
      <div className="bg-slate-800/50 p-6 rounded-2xl shadow-lg border border-slate-700 backdrop-blur-sm">
        <h2 className="text-3xl font-bold mb-6 text-pink-500">My Groups</h2>
        
        <form onSubmit={addGroup} className="mb-8 p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-4">
          <h3 className="text-xl font-semibold">Create a New Group</h3>
          <div>
            <label htmlFor="group-name" className="block text-sm font-medium text-slate-300 mb-1">Group Name</label>
            <input
              id="group-name"
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g., Movie Buffs"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 focus:ring-2 focus:ring-pink-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="group-members" className="block text-sm font-medium text-slate-300 mb-1">Members (comma-separated)</label>
            <input
              id="group-members"
              type="text"
              value={newGroupMembers}
              onChange={(e) => setNewGroupMembers(e.target.value)}
              placeholder="e.g., John, Jane, Alex"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg py-2 px-3 focus:ring-2 focus:ring-pink-500 focus:outline-none"
            />
          </div>
          <button type="submit" className="w-full flex items-center justify-center gap-2 bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg transition-colors transform hover:scale-105">
            <PlusIcon /> Add Group
          </button>
        </form>

        <div className="space-y-4">
          {groups.map(group => (
            <div key={group.id} className="bg-slate-700/70 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                 <div>
                    <h4 className="font-bold text-lg text-white">{group.name}</h4>
                    <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                    <UserGroupIcon />
                    {group.members.length} members
                    </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <button 
                    onClick={() => setInviteModalGroupId(group.id)} 
                    className="text-slate-400 hover:text-cyan-400 transition-colors p-1"
                    title="Invite members"
                    >
                    <ShareIcon />
                    </button>
                    <button onClick={() => deleteGroup(group.id)} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Delete group">
                    <TrashIcon />
                    </button>
                </div>
              </div>

              <ul className="space-y-2 border-t border-slate-600 pt-3">
                {group.members.map(member => {
                    const isCurrentUser = member.id === currentUser.id;
                    const nudgeId = `${group.id}-${member.id}`;
                    const hasBeenNudged = nudgedMembers[nudgeId];

                    return (
                        <li key={member.id} className="flex justify-between items-center bg-slate-800/50 p-2 rounded-md">
                        <span className="font-medium text-slate-200">{member.name}{isCurrentUser && ' (You)'}</span>
                        {!isCurrentUser && (
                            <button
                            onClick={() => handleNudge(group.id, member.id)}
                            disabled={hasBeenNudged}
                            className={`flex items-center gap-1.5 text-sm font-semibold py-1 px-3 rounded-full transition-colors duration-200 ${
                                hasBeenNudged
                                ? 'bg-green-500/20 text-green-400 cursor-default'
                                : 'bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300'
                            }`}
                            >
                            {hasBeenNudged ? <CheckIcon className="w-4 h-4" /> : <NudgeIcon className="w-4 h-4" />}
                            {hasBeenNudged ? 'Nudged!' : 'Nudge'}
                            </button>
                        )}
                        </li>
                    );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {selectedGroupForInvite && (
        <InviteModal 
          group={selectedGroupForInvite} 
          onClose={() => setInviteModalGroupId(null)} 
        />
      )}
    </>
  );
};

export default ManageGroups;
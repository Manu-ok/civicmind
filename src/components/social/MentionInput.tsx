"use client";

import { useState, useRef, useEffect } from 'react';
import { getFollowing, getSuggestedUsers } from '@/lib/firebase/social';
import { useAuthStore } from '@/lib/stores/authStore';
import { SocialUser } from '@/lib/types';
import { CheckCircle2 } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/useDebounce';

interface MentionInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function MentionInput({ value, onChange, onSubmit, placeholder, autoFocus }: MentionInputProps) {
  const { user } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPos, setDropdownPos] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<SocialUser[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const fetchUsers = async (query: string) => {
    if (!user || !showDropdown) return;
    try {
      const following = await getFollowing(user.id, 100);
      const suggestions = await getSuggestedUsers(user.id, user.city || '', user.ward || '');
      
      const combined = [...following, ...suggestions];
      const uniqueIds = new Set();
      const unique = combined.filter(u => {
        if (uniqueIds.has(u.id)) return false;
        uniqueIds.add(u.id);
        return true;
      });

      const queryLower = query.toLowerCase();
      const filtered = unique.filter(u => 
        u.username?.toLowerCase().includes(queryLower) || 
        u.displayName?.toLowerCase().includes(queryLower)
      ).slice(0, 5);

      setUsers(filtered);
      setSelectedIndex(0);
    } catch (err) {
      console.error(err);
    }
  };

  const debouncedFetchUsers = useDebounce(fetchUsers, 300);

  useEffect(() => {
    if (showDropdown) {
      debouncedFetchUsers(searchQuery);
    }
  }, [searchQuery, showDropdown, debouncedFetchUsers]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    onChange(val);
    
    // Auto-resize
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPosition);
    const match = textBeforeCursor.match(/@(\w*)$/);

    if (match) {
      setShowDropdown(true);
      setSearchQuery(match[1]);
      setDropdownPos(cursorPosition);
    } else {
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showDropdown && users.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % users.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + users.length) % users.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        insertMention(users[selectedIndex]);
      } else if (e.key === 'Escape') {
        setShowDropdown(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (onSubmit) {
        onSubmit();
        if (inputRef.current) {
          inputRef.current.style.height = 'auto';
        }
      }
    }
  };

  const insertMention = (targetUser: SocialUser) => {
    const beforeCursor = value.slice(0, dropdownPos - searchQuery.length - 1);
    const afterCursor = value.slice(dropdownPos);
    
    const newValue = `${beforeCursor}@${targetUser.username} ${afterCursor}`;
    onChange(newValue);
    setShowDropdown(false);
    
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="relative w-full">
      <textarea
        ref={inputRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full min-h-[44px] bg-zinc-900 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white resize-none focus:outline-none focus:border-blue-500/50 transition-colors shadow-inner"
        rows={1}
      />

      {showDropdown && users.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-zinc-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          {users.map((u, i) => (
            <div 
              key={u.id}
              onClick={() => insertMention(u)}
              className={`flex items-center gap-2 p-2.5 cursor-pointer transition-colors ${i === selectedIndex ? 'bg-blue-500/20' : 'hover:bg-zinc-700/50'}`}
            >
              <div className="w-8 h-8 rounded-full bg-zinc-900 shrink-0 overflow-hidden border border-white/5">
                {u.photoURL ? (
                  <img src={u.photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-zinc-500">
                    {u.displayName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-white truncate">{u.displayName}</span>
                  {u.isVerified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                </div>
                <div className="text-xs text-zinc-400 truncate">@{u.username}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import * as React from 'react';

export function parseMentions(text: string): string[] {
  // Matches @username where username is 3-30 chars of valid username chars
  // Lookbehind/lookaround ensures we don't match email addresses
  const regex = /(?:^|\s)@([a-z0-9_.]+)(?=[.,!?;\s]|$)/gi;
  const mentions = new Set<string>();
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const username = match[1];
    // Remove trailing dot if any, since sentences might end with .
    const cleanUsername = username.endsWith('.') ? username.slice(0, -1) : username;
    if (cleanUsername.length >= 3 && cleanUsername.length <= 30) {
      mentions.add(cleanUsername.toLowerCase());
    }
  }
  
  return Array.from(mentions);
}

export function renderTextWithMentions(text: string, onMentionClick: (username: string) => void): React.ReactNode {
  if (!text) return null;
  
  // Group 1: prefix (space or start), Group 2: username
  const regex = /((?:^|\s))@([a-z0-9_.]+)/gi;
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const matchStart = match.index;
    const prefix = match[1] || ''; 
    const username = match[2];
    
    // Check if there's trailing punctuation to exclude from username
    let cleanUsername = username;
    let trailingPunctuation = '';
    
    // Trim trailing dot/punctuation that might be part of the sentence
    if (cleanUsername.endsWith('.')) {
      cleanUsername = cleanUsername.slice(0, -1);
      trailingPunctuation = '.';
    }
    
    if (cleanUsername.length < 3) {
      continue; // Not a valid username format, skip
    }
    
    // Add text before the match
    if (matchStart > lastIndex) {
      parts.push(text.slice(lastIndex, matchStart + prefix.length));
    } else if (prefix) {
      parts.push(prefix);
    }
    
    // Add the mention component
    parts.push(
      <span
        key={`mention-${matchStart}`}
        onClick={(e) => {
          e.stopPropagation();
          onMentionClick(cleanUsername);
        }}
        className="text-blue-500 hover:underline cursor-pointer font-medium"
      >
        @{cleanUsername}
      </span>
    );
    
    if (trailingPunctuation) {
      parts.push(trailingPunctuation);
    }
    
    lastIndex = matchStart + prefix.length + 1 + username.length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return <>{parts}</>;
}

export function highlightSearchTerm(text: string, searchTerm: string): React.ReactNode {
  if (!searchTerm || !text) return <>{text}</>;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => 
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200/50 text-foreground rounded px-1">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

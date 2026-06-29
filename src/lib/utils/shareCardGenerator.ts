import Image from "next/image";
import { Issue, SocialUser } from '../types';

export function generateShareCardHTML(issue: Issue, user: SocialUser): string {
  const severityColors: Record<string, string> = {
    critical: '#ef4444',
    high: '#f97316',
    medium: '#eab308',
    low: '#3b82f6'
  };
  
  const color = severityColors[issue.severity] || '#3b82f6';
  
  return `
    <div style="
      width: 1200px;
      height: 630px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      color: white;
      font-family: system-ui, -apple-system, sans-serif;
      padding: 60px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 15px;">
          <div style="width: 50px; height: 50px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: bold; color: #0f172a; font-size: 24px;">
            CM
          </div>
          <span style="font-size: 32px; font-weight: 800; letter-spacing: -1px;">CivicMind AI</span>
        </div>
        <div style="background: ${color}20; border: 2px solid ${color}; color: ${color}; padding: 10px 24px; border-radius: 99px; font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
          ${issue.severity} Priority
        </div>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 20px;">
        <div style="font-size: 28px; color: #94a3b8; display: flex; align-items: center; gap: 12px;">
          <span>📍 ${issue.location.address || `${issue.location.ward}, ${issue.location.city}`}</span>
          <span>•</span>
          <span>${issue.category.charAt(0).toUpperCase() + issue.category.slice(1)}</span>
        </div>
        
        <h1 style="font-size: 72px; font-weight: 900; line-height: 1.1; margin: 0; letter-spacing: -2px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
          ${issue.title}
        </h1>
        
        <p style="font-size: 32px; color: #cbd5e1; margin: 0; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.4;">
          ${issue.description}
        </p>
      </div>
      
      <div style="display: flex; align-items: center; gap: 24px; border-top: 1px solid #334155; padding-top: 40px;">
        ${user.photoURL ? 
          `<Image src="${user.photoURL}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 4px solid #334155;" />` : 
          `<div style="width: 80px; height: 80px; border-radius: 50%; background: #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: bold;">${user.displayName.charAt(0)}</div>`
        }
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <span style="font-size: 28px; color: #94a3b8;">Reported by</span>
          <span style="font-size: 36px; font-weight: bold;">${user.displayName}</span>
          ${user.username ? `<span style="font-size: 24px; color: #3b82f6;">@${user.username}</span>` : ''}
        </div>
      </div>
    </div>
  `;
}

export function generateShareText(issue: Issue): string {
  const severityEmoji = issue.severity === 'critical' ? '🚨' : issue.severity === 'high' ? '⚠️' : issue.severity === 'medium' ? '🔔' : 'ℹ️';
  const url = generateShareUrl(issue.id);
  const location = issue.location.ward || issue.location.city || "your area";
  const cityTag = issue.location.city ? issue.location.city.replace(/\s+/g, '') : "Community";
  const categoryTag = issue.category ? issue.category.replace(/\s+/g, '') : "Issue";
  
  return `${severityEmoji} ${issue.severity.toUpperCase()} issue reported in ${location}: ${issue.title}

Reported on CivicMind AI
Join your community: ${url}

#CivicMind #${cityTag} #${categoryTag}`;
}

export function generateShareUrl(issueId: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://civicmind.ai';
  return `${baseUrl}/issues/${issueId}`;
}

# Social Notifications System Implementation Plan

This plan outlines the complete overhaul of the Notification System to support social features, real-time toast notifications, and intelligent grouping.

## Proposed Changes

### 1. `src/lib/firebase/firestore.ts`
- **[MODIFY]**: Expand the `AppNotification` type to include the new social types (`new_follower`, `mention`, `comment_on_issue`, `reaction_on_issue`, `story_interaction`, `circle_invite`, `issue_resolved`, `achievement`).
- **[MODIFY]**: Add necessary optional fields for rich rendering: `actorId`, `actorName`, `actorUsername`, `actorAvatar`, `commentPreview`, `circleId`, `circleName`, `badgeName`, `reactionType`.

### 2. `src/lib/firebase/social.ts`
- **[MODIFY]**: Create a robust `createSocialNotification` helper that handles:
  - Wrapping the existing `createNotification`.
  - Fetching missing data (like actor details).
  - Building the rich notification objects for followers, comments, mentions, reactions, etc.
  - Adding server-side aggregation for reactions (if a reaction notification for the same issue exists within the last 30 minutes, it will update that document with the new actor, rather than creating a new document). This ensures the user's notification feed doesn't get spammed.

### 3. `src/components/shared/NotificationCenter.tsx`
- **[MODIFY]**: Completely redesign the dropdown:
  - Add category tabs (All | Social | Issues | Achievements).
  - Add date grouping (Today, Yesterday, This Week) using `date-fns`.
  - Add rich list items: User Avatars, unread indicators, issue thumbnails.
  - Integrate real-time toasts via `react-hot-toast` that trigger only when a *new* unread notification arrives while the app is open.
  - Add the "Mark all as read" button at the top.

## Open Questions

> [!IMPORTANT]
> **Aggregation Strategy**: I am planning to handle the 30-minute reaction aggregation on the *server-side* (Firestore). When a new reaction occurs, the system will look for a reaction notification on the same issue within the last 30 minutes. If found, it will append the new user to it. Does this server-side aggregation approach work for you, or would you prefer strictly client-side visual grouping?

> [!NOTE]
> Please review the plan above. Once you approve, I'll execute the code changes!

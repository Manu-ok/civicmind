import { create } from 'zustand';
import { Comment } from '@/lib/types';

interface CommentState {
  cache: Record<string, Comment[]>;
  setComments: (issueId: string, comments: Comment[]) => void;
  getComments: (issueId: string) => Comment[] | undefined;
}

export const useCommentStore = create<CommentState>((set, get) => ({
  cache: {},
  setComments: (issueId, comments) => {
    set(state => ({
      cache: {
        ...state.cache,
        [issueId]: comments
      }
    }));
  },
  getComments: (issueId) => {
    return get().cache[issueId];
  }
}));

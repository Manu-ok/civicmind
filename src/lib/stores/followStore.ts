import { create } from 'zustand';

interface FollowState {
  cache: Record<string, boolean>;
  setFollowState: (followerId: string, followingId: string, isFollowing: boolean) => void;
  getFollowState: (followerId: string, followingId: string) => boolean | undefined;
}

export const useFollowStore = create<FollowState>((set, get) => ({
  cache: {},
  setFollowState: (followerId, followingId, isFollowing) => {
    set(state => ({
      cache: {
        ...state.cache,
        [`${followerId}_${followingId}`]: isFollowing
      }
    }));
  },
  getFollowState: (followerId, followingId) => {
    return get().cache[`${followerId}_${followingId}`];
  }
}));

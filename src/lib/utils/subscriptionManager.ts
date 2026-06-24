type Unsubscribe = () => void;

class SubscriptionManager {
  private activeSubs: Map<string, Unsubscribe> = new Map();
  private maxSubs = 2;

  add(id: string, unsub: Unsubscribe) {
    if (this.activeSubs.size >= this.maxSubs) {
      // Find the oldest and remove it
      const firstKey = this.activeSubs.keys().next().value;
      if (firstKey) {
        this.remove(firstKey);
      }
    }
    this.activeSubs.set(id, unsub);
  }

  remove(id: string) {
    const unsub = this.activeSubs.get(id);
    if (unsub) {
      unsub();
      this.activeSubs.delete(id);
    }
  }
}

export const globalSubManager = new SubscriptionManager();

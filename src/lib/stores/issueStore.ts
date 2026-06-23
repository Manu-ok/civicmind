import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Issue, Category, Severity, IssueStatus } from '../types';

interface IssueFilters {
  category?: Category;
  severity?: Severity;
  status?: IssueStatus;
  ward?: string;
}

interface IssueState {
  issues: Issue[];
  selectedIssue: Issue | null;
  filters: IssueFilters;
  loading: boolean;
  error: string | null;
  setIssues: (issues: Issue[]) => void;
  addIssue: (issue: Issue) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  setSelectedIssue: (issue: Issue | null) => void;
  setFilters: (filters: Partial<IssueFilters>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useIssueStore = create<IssueState>()(
  devtools((set) => ({
    issues: [],
    selectedIssue: null,
    filters: {},
    loading: false,
    error: null,
    setIssues: (issues) => set({ issues }),
    addIssue: (issue) => set((state) => ({ issues: [issue, ...state.issues] })),
    updateIssue: (id, updates) => set((state) => ({
      issues: state.issues.map((i) => (i.id === id ? { ...i, ...updates } : i))
    })),
    setSelectedIssue: (selectedIssue) => set({ selectedIssue }),
    setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error })
  }))
);

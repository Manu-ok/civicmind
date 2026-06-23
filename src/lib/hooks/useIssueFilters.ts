import { useMemo } from "react";
import { Issue } from "../types";
import { useIssueStore } from "../stores/issueStore";

export function useIssueFilters(issues: Issue[]) {
  const { filters } = useIssueStore();

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Category filter
      if (filters.category && issue.category !== filters.category) {
        return false;
      }
      
      // Status filter
      if (filters.status && issue.status !== filters.status) {
        return false;
      }
      
      // Severity filter
      if (filters.severity && issue.severity !== filters.severity) {
        return false;
      }
      
      // Ward filter
      if (filters.ward && issue.location.ward !== filters.ward) {
        return false;
      }
      
      // Text Search
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = issue.title.toLowerCase().includes(query);
        const matchesDesc = issue.description.toLowerCase().includes(query);
        const matchesCategory = issue.category.toLowerCase().includes(query);
        const matchesWard = (issue.location.ward || "").toLowerCase().includes(query);
        
        if (!matchesTitle && !matchesDesc && !matchesCategory && !matchesWard) {
          return false;
        }
      }
      
      return true;
    });
  }, [issues, filters]);

  // Optionally could return sorted version if we added sorting logic
  return filteredIssues;
}

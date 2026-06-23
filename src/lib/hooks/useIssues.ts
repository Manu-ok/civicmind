"use client";

import { useState, useEffect, useCallback } from "react";
import { collection, query, onSnapshot, where, orderBy, getDocs, limit } from "firebase/firestore";
import { db } from "../firebase/config";
import { Issue } from "../types";
import toast from "react-hot-toast";
import { useIssueStore } from "../stores/issueStore";
import { calculateDistance } from "../maps/geocoding";

export function useIssues() {
  const { setIssues, filters, setLoading, setError, loading, error, issues } = useIssueStore();
  const [localLoading, setLocalLoading] = useState(true);

  const fetchIssues = useCallback(() => {
    setLoading(true);
    setLocalLoading(true);

    try {
      let q = collection(db, "issues");
      const constraints: any[] = [];

      if (filters.category) constraints.push(where("category", "==", filters.category));
      if (filters.severity) constraints.push(where("severity", "==", filters.severity));
      if (filters.status) constraints.push(where("status", "==", filters.status));
      if (filters.ward) constraints.push(where("location.ward", "==", filters.ward));

      if (constraints.length > 0) {
        q = query(q, ...constraints, limit(50)) as any;
      } else {
        q = query(q, orderBy("reportedAt", "desc"), limit(50)) as any;
      }

      let isInitialLoad = true;

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const fetchedIssues = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            // Handle Firestore timestamps safely
            reportedAt: doc.data().reportedAt?.toDate() || new Date(),
          })) as Issue[];

          // Handle real-time notifications via docChanges
          if (!isInitialLoad) {
            snapshot.docChanges().forEach((change) => {
              const data = change.doc.data() as Issue;
              const wardName = data.location?.ward || "Unknown Ward";

              if (change.type === "added") {
                toast(`🚨 New ${data.severity} issue reported in ${wardName}`, {
                  icon: '🔔',
                  style: {
                    borderRadius: '10px',
                    background: '#18181b',
                    color: '#fff',
                    border: '1px solid #3f3f46',
                  },
                });
              }
              
              if (change.type === "modified") {
                // If status changed to resolved
                if (data.status === "resolved") {
                  toast(`✅ Issue resolved in ${wardName}: ${data.title}`, {
                    icon: '🎉',
                    style: {
                      borderRadius: '10px',
                      background: '#18181b',
                      color: '#4ade80',
                      border: '1px solid #22c55e40',
                    },
                  });
                }
              }
            });
          }

          isInitialLoad = false;
          setIssues(fetchedIssues);
          setLocalLoading(false);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error("Error fetching issues:", err);
          setError(err.message);
          setLocalLoading(false);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err: any) {
      console.error("Error setting up issues listener:", err);
      setError(err.message);
      setLocalLoading(false);
      setLoading(false);
      return () => {};
    }
  }, [filters, setIssues, setLoading, setError]);

  useEffect(() => {
    const unsubscribe = fetchIssues();
    return () => unsubscribe();
  }, [fetchIssues]);

  return { issues, loading: localLoading || loading, error, refetch: fetchIssues };
}

export function useNearbyIssues(lat: number | null, lng: number | null, radiusKm: number = 5) {
  const { issues, loading, error } = useIssues();
  const [nearbyIssues, setNearbyIssues] = useState<Issue[]>([]);

  useEffect(() => {
    if (!lat || !lng || !issues.length) {
      setNearbyIssues([]);
      return;
    }

    const filtered = issues.filter((issue) => {
      if (!issue.location?.lat || !issue.location?.lng) return false;
      const distance = calculateDistance(lat, lng, issue.location.lat, issue.location.lng);
      return distance <= radiusKm;
    });

    setNearbyIssues(filtered);
  }, [lat, lng, radiusKm, issues]);

  return { nearbyIssues, loading, error };
}

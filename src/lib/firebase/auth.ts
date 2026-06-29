import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  deleteUser as firebaseDeleteUser,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "./config";
import { User } from "../types";

function getAuthErrorMessage(error: any): string {
  const code = error?.code || "";
  if (code === "auth/popup-closed-by-user") return "Sign in cancelled";
  if (code === "auth/network-request-failed") return "Network error. Check connection";
  if (code === "auth/too-many-requests") return "Too many attempts. Try again later";
  if (code === "auth/user-not-found" || code === "auth/wrong-password") return "Invalid email or password";
  if (code === "auth/email-already-in-use") return "Email is already registered";
  if (code === "auth/weak-password") return "Password is too weak";
  if (code === "auth/invalid-credential") return "Invalid credentials provided";
  return error?.message || "Authentication failed.";
}

export async function signInWithGoogle(): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return await handleUserDocument(result.user);
  } catch (error: any) {
    console.error("Google sign in error:", error);
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return await handleUserDocument(result.user);
  } catch (error: any) {
    console.error("Email sign in error:", error);
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function signUpWithEmail(email: string, password: string, displayName: string): Promise<User> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = result.user;
    
    const newUser: User = {
      id: fbUser.uid,
      displayName: displayName || email.split("@")[0],
      email: email,
      photoURL: fbUser.photoURL || "",
      ward: "",
      city: "",
      points: 0,
      issuesReported: 0,
      issuesVerified: 0,
      createdAt: Timestamp.now(),
      role: "citizen",
      username: null,
      hasCompletedOnboarding: false
    };
    
    await setDoc(doc(db, "users", fbUser.uid), newUser);
    return newUser;
  } catch (error: any) {
    console.error("Sign up error:", error);
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error("Sign out error:", error);
    throw new Error(error.message || "Failed to sign out.");
  }
}

export function onAuthStateChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser) {
      try {
        const userDoc = await getDoc(doc(db, "users", fbUser.uid));
        if (userDoc.exists()) {
          callback(userDoc.data() as User);
        } else {
          const user = await handleUserDocument(fbUser);
          callback(user);
        }
      } catch (error) {
        console.error("Error fetching user profile during auth state change:", error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
}

export async function updateUserProfile(userId: string, data: Partial<User>): Promise<void> {
  try {
    await updateDoc(doc(db, "users", userId), data);
  } catch (error: any) {
    console.error("Update profile error:", error);
    throw new Error(error.message || "Failed to update user profile.");
  }
}

export async function deleteUserAccount(): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No authenticated user found.");
    
    // First delete from firestore
    await deleteDoc(doc(db, "users", currentUser.uid));
    
    // Then delete auth user
    await firebaseDeleteUser(currentUser);
  } catch (error: any) {
    console.error("Delete account error:", error);
    throw new Error(error.message || "Failed to delete account.");
  }
}

async function handleUserDocument(fbUser: FirebaseUser): Promise<User> {
  const userRef = doc(db, "users", fbUser.uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    // Update lastLoginAt
    await updateDoc(userRef, { lastLoginAt: Timestamp.now() });
    return { ...userSnap.data(), lastLoginAt: Timestamp.now() } as unknown as User;
  } else {
    const newUser: User = {
      id: fbUser.uid,
      displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "User",
      email: fbUser.email || "",
      photoURL: fbUser.photoURL || "",
      ward: "",
      city: "",
      points: 0,
      issuesReported: 0,
      issuesVerified: 0,
      createdAt: Timestamp.now(),
      role: "citizen",
      username: null,
      hasCompletedOnboarding: false,
      lastLoginAt: Timestamp.now()
    } as User;
    await setDoc(userRef, newUser);
    return newUser;
  }
}

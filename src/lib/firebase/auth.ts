import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "./config";
import { User } from "../types";

export async function signInWithGoogle(): Promise<User> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return await handleUserDocument(result.user);
  } catch (error: any) {
    console.error("Google sign in error:", error);
    throw new Error(error.message || "Failed to sign in with Google.");
  }
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return await handleUserDocument(result.user);
  } catch (error: any) {
    console.error("Email sign in error:", error);
    throw new Error(error.message || "Failed to sign in with email.");
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
      role: "citizen"
    };
    
    await setDoc(doc(db, "users", fbUser.uid), newUser);
    return newUser;
  } catch (error: any) {
    console.error("Sign up error:", error);
    throw new Error(error.message || "Failed to sign up.");
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

async function handleUserDocument(fbUser: FirebaseUser): Promise<User> {
  const userRef = doc(db, "users", fbUser.uid);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return userSnap.data() as User;
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
      role: "citizen"
    };
    await setDoc(userRef, newUser);
    return newUser;
  }
}

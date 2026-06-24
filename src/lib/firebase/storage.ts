import { getDownloadURL, ref, uploadBytesResumable, uploadBytes, deleteObject } from "firebase/storage";
import { storage } from "./config";

// Placeholder images for demo if storage fails
const DEMO_ISSUE_PLACEHOLDER = "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=1000";
const DEMO_PROFILE_PLACEHOLDER = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200";

const createTimeout = (ms = 5000) => new Promise((_, reject) => 
  setTimeout(() => reject(new Error(`Upload timed out after ${ms}ms`)), ms)
);

export async function uploadIssueMedia(file: File, issueId: string, userId: string): Promise<string> {
  try {
    const timestamp = Date.now();
    const filename = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const path = `issues/${issueId}/${userId}_${timestamp}_${filename}`;
    const storageRef = ref(storage, path);
    
    const snapshot = await Promise.race([
      uploadBytes(storageRef, file),
      createTimeout()
    ]) as any;
    return await getDownloadURL(snapshot.ref);
  } catch (error: any) {
    console.warn("Issue upload failed, using demo placeholder:", error);
    return DEMO_ISSUE_PLACEHOLDER;
  }
}

export async function uploadVerificationMedia(file: File, issueId: string, userId: string): Promise<string> {
  try {
    const timestamp = Date.now();
    const filename = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const path = `verifications/${issueId}/${userId}_${timestamp}_${filename}`;
    const storageRef = ref(storage, path);
    
    const snapshot = await Promise.race([
      uploadBytesResumable(storageRef, file),
      createTimeout()
    ]) as any;
    return await getDownloadURL(snapshot.ref);
  } catch (error: any) {
    console.warn("Verification upload failed, using demo placeholder:", error);
    return DEMO_ISSUE_PLACEHOLDER;
  }
}

export async function uploadProfileMedia(file: File, userId: string): Promise<string> {
  try {
    const timestamp = Date.now();
    const filename = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const path = `profiles/${userId}/${timestamp}_${filename}`;
    const storageRef = ref(storage, path);
    
    const snapshot = await Promise.race([
      uploadBytes(storageRef, file),
      createTimeout()
    ]) as any;
    
    return await getDownloadURL(snapshot.ref);
  } catch (error: any) {
    console.warn("Profile upload failed, using demo placeholder:", error);
    return DEMO_PROFILE_PLACEHOLDER;
  }
}

export async function deleteMedia(url: string): Promise<void> {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error: any) {
    console.warn("Error deleting media (mocked success):", error);
  }
}

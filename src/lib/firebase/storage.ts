import { getDownloadURL, ref, uploadBytesResumable, deleteObject } from "firebase/storage";
import { storage } from "./config";

export async function uploadIssueMedia(file: File, issueId: string, userId: string): Promise<string> {
  try {
    const timestamp = Date.now();
    const filename = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const path = `issues/${issueId}/${userId}_${timestamp}_${filename}`;
    const storageRef = ref(storage, path);
    
    const snapshot = await uploadBytesResumable(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error: any) {
    console.error("Error uploading issue media:", error);
    throw new Error(error.message || "Failed to upload issue media.");
  }
}

export async function uploadVerificationMedia(file: File, issueId: string, userId: string): Promise<string> {
  try {
    const timestamp = Date.now();
    const filename = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const path = `verifications/${issueId}/${userId}_${timestamp}_${filename}`;
    const storageRef = ref(storage, path);
    
    const snapshot = await uploadBytesResumable(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (error: any) {
    console.error("Error uploading verification media:", error);
    throw new Error(error.message || "Failed to upload verification media.");
  }
}

export async function deleteMedia(url: string): Promise<void> {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch (error: any) {
    console.error("Error deleting media:", error);
    throw new Error(error.message || "Failed to delete media from storage.");
  }
}

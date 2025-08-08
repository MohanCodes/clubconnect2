import {
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  FirestoreDataConverter,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/firebase/firebase';
import { ClubInfo } from '@/types/club';

/**
 * Upload a list of image files to `clubs/{clubId}/` in Firebase Storage and
 * return their public download URLs in the original order.
 */
export const uploadImages = async (
  clubId: string,
  files: File[],
): Promise<string[]> => {
  if (!files.length) return [];

  const urlPromises = files.map(async (file) => {
    const storageRef = ref(storage, `clubs/${clubId}/${file.name}`);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  });

  return Promise.all(urlPromises);
};

/**
 * Create or overwrite a club document in Firestore. Uses `setDoc` so the call
 * is idempotent from the caller perspective.
 */
export const saveClub = async (club: ClubInfo): Promise<void> => {
  const clubDocRef = doc(db, 'clubs', club.id);
  await setDoc(clubDocRef, club);
};

/**
 * Update an existing club document. Provide `partial` to merge only the given
 * fields.
 */
export const patchClub = async (
  clubId: string,
  partial: Partial<ClubInfo>,
): Promise<void> => {
  const clubDocRef = doc(db, 'clubs', clubId);
  await updateDoc(clubDocRef, partial);
};

/**
 * Delete the club document and any associated images stored under
 * `clubs/{clubId}/`.
 */
export const deleteClub = async (clubId: string): Promise<void> => {
  // NB: Firebase Storage does not support deleting a folder directly.
  // The caller should supply the list of objects to delete. For simplicity we
  // fetch the club doc first to obtain its image URLs.
  const clubDocRef = doc(db, 'clubs', clubId);
  const snap = await clubDocRef.get();
  if (snap.exists()) {
    const data = snap.data() as ClubInfo;
    const deletePromises = (data.images || []).map((url) => {
      const imageRef = ref(storage, url);
      return deleteObject(imageRef);
    });
    await Promise.all(deletePromises);
  }
  await deleteDoc(clubDocRef);
};

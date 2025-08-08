"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import {
  doc,
  getDoc,
} from 'firebase/firestore';
import { auth, db } from '@/firebase/firebase';
import { ClubInfo } from '@/types/club';
import { uploadImages, saveClub, patchClub } from '@/lib/firebase/clubs';

export type EditorStatus = 'idle' | 'loading' | 'saving' | 'error';

interface UseClubEditorOptions {
  slug: string | string[] | undefined;
}

export const useClubEditor = ({ slug }: UseClubEditorOptions) => {
  const router = useRouter();

  // ----- UI & data state --------------------------------------------------
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [status, setStatus] = useState<EditorStatus>('loading');
  const [error, setError] = useState<unknown>(null);

  // ----- Fetch club -------------------------------------------------------
  const fetchClubInfo = useCallback(async () => {
    if (!slug) return;
    try {
      setStatus('loading');
      const clubDoc = await getDoc(doc(db, 'clubs', String(slug)));
      if (clubDoc.exists()) {
        setClubInfo(clubDoc.data() as ClubInfo);
      } else {
        router.replace('/');
      }
      setStatus('idle');
    } catch (e) {
      setError(e);
      setStatus('error');
    }
  }, [slug, router]);

  // run once
  useEffect(() => {
    fetchClubInfo();
  }, [fetchClubInfo]);

  // auth listener
  useEffect(() => {
    const un = onAuthStateChanged(auth, (u) => setUser(u));
    return () => un();
  }, []);

  // beforeunload guard
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  // ----- helpers ----------------------------------------------------------
  const markDirty = () => setHasUnsavedChanges(true);

  const startEdit = () => setIsEditing(true);
  const cancelEdit = () => {
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  const setField = <K extends keyof ClubInfo>(field: K, value: ClubInfo[K]) => {
    if (!clubInfo) return;
    setClubInfo({ ...clubInfo, [field]: value });
    markDirty();
  };

  const toggleDisplay = async () => {
    if (!clubInfo) return;
    try {
      const next = !clubInfo.isDisplayed;
      setClubInfo({ ...clubInfo, isDisplayed: next });
      await patchClub(clubInfo.id, { isDisplayed: next });
    } catch (e) {
      setError(e);
      setStatus('error');
    }
  };

  // main save
  const save = async (newFiles: File[] = []) => {
    if (!clubInfo) return;
    try {
      setStatus('saving');
      const urls = await uploadImages(clubInfo.id, newFiles);
      const updated: ClubInfo = {
        ...clubInfo,
        images: [...clubInfo.images, ...urls],
      };
      await saveClub(updated);
      setClubInfo(updated);
      setHasUnsavedChanges(false);
      setStatus('idle');
      setIsEditing(false);
    } catch (e) {
      setError(e);
      setStatus('error');
    }
  };

  // debounced auto-save
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (hasUnsavedChanges && status === 'idle') {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        save();
      }, 3000);
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [hasUnsavedChanges]);

  return {
    user,
    clubInfo,
    setClubInfo,
    isEditing,
    hasUnsavedChanges,
    status,
    error,
    // actions
    startEdit,
    cancelEdit,
    setField,
    save,
    toggleDisplay,
    markDirty,
  } as const;
};

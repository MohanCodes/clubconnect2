"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { db, auth } from "@/firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { FaCamera, FaUser } from "react-icons/fa";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  role: 'member' | 'editor';
}

export default function ProfileCard() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile>({
    id: "", name: "", email: "", photoURL: "", role: 'member'
  });
  const [tempName, setTempName] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) router.push("/");
      else setUserId(user.uid);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;
      try {
        const userRef = doc(db, "users", userId);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const userData = snap.data() as UserProfile;
          setProfile({ ...userData });
          setTempName(userData.name || "");
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [userId]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setError(null);
    try {
      const updatedProfile = { ...profile, name: tempName, updatedAt: new Date().toISOString() };
      await updateDoc(doc(db, "users", userId), updatedProfile);
      setProfile(updatedProfile);
      setSuccessMessage("Profile updated!");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfile(prev => ({ ...prev, photoURL: e.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;

  return (
    <div className="text-white px-4 py-6">      
      <h1 className="text-white text-3xl font-bold mb-4">
          Your Profile
      </h1>
      <p className="text-gray-300 mb-6">
        This is where you can change your profile picture and name.
      </p>
      <div className="bg-[#2A2A2A] rounded-xl p-4 space-y-4 max-w-lg">
        {/* Profile Picture */}
        <div className="flex items-center space-x-4">
          <div 
            className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-600 transition-colors overflow-hidden relative"
            onClick={() => fileInputRef.current?.click()}
          >
            {profile.photoURL ? (
              <img src={profile.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <FaUser className="text-xl text-gray-400" />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all flex items-center justify-center">
              <FaCamera className="text-white opacity-0 hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-gray-800 rounded p-2 outline-none focus:ring-1 focus:ring-azul"
            />
            <div className="text-xs text-gray-400 mt-1">{profile.email}</div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        </div>

        {/* Role Toggle */}
        <div className="flex items-center justify-between bg-gray-800 rounded p-3">
          <div>
            <div className="text-sm font-medium">{profile.role === 'editor' ? 'Editor' : 'Member'}</div>
            <div className="text-xs text-gray-400">
              {profile.role === 'editor' ? 'Can edit clubs' : 'Can join clubs'}
            </div>
          </div>
          <button
            onClick={() => setProfile(prev => ({ ...prev, role: prev.role === 'member' ? 'editor' : 'member' }))}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              profile.role === 'editor' ? 'bg-azul' : 'bg-gray-600'
            }`}
          >
            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
              profile.role === 'editor' ? 'translate-x-5' : 'translate-x-1'
            }`} />
          </button>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving || tempName.trim() === ""}
          className={`w-full py-2 rounded font-medium transition-all ${
            saving || tempName.trim() === "" ? 'bg-gray-600 cursor-not-allowed opacity-50' : 'bg-azul hover:opacity-90'
          }`}
        >
          {saving ? 'Saving...' : successMessage ? successMessage : 'Save'}
        </button>

        {/* Messages */}
        {error && <div className="text-red-400 text-sm text-center">{error}</div>}
      </div>
    </div>
  );
}
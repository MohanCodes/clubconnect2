"use client";

import { useState, useEffect } from 'react';
import {
  FaUser,
  FaLock,
  FaBell,
  FaEye,
  FaEyeSlash,
  FaDownload,
  FaTrash,
  FaChevronDown,
  FaCheck,
  FaCamera,
  FaSpinner,
  FaSignOutAlt,
  FaSave,
} from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import { db, auth } from '@/firebase/firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, updateProfile, signOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase/firebase';
import LoadingModal from '@/components/LoadingModal';
import { deleteUser } from 'firebase/auth';
import { deleteObject } from 'firebase/storage';
import { GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  role: 'member' | 'editor';
  phone?: string;
  gradeLevel?: string;
  major?: string;
  notifications?: {
    email: boolean;
    meetingReminders: boolean;
    eventAnnouncements: boolean;
    clubInvitations: boolean;
    weeklyDigest: boolean;
  };
  privacy?: {
    profileVisible: boolean;
    showClubMembership: boolean;
    allowContact: boolean;
  };
}

export default function SettingsPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    name: '',
    email: '',
    photoURL: '',
    role: 'member',
    phone: '',
    gradeLevel: 'Junior',
    major: '',
    notifications: {
      email: true,
      meetingReminders: true,
      eventAnnouncements: true,
      clubInvitations: false,
      weeklyDigest: false,
    },
    privacy: {
      profileVisible: false,
      showClubMembership: false,
      allowContact: false,
    },
  });

  const handlePasswordUpdate = async () => {
    if (!auth.currentUser) {
      alert('No user logged in');
      return;
    }

    // Validation
    if (!currentPassword) {
      alert('Please enter your current password');
      return;
    }

    if (!newPassword) {
      alert('Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      alert('New password must be different from current password');
      return;
    }

    setPasswordSaving(true);

    try {
      const user = auth.currentUser;
      const email = user.email;

      if (!email) {
        throw new Error('User email is missing');
      }

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      alert('Password updated successfully!');
    } catch (error: any) {
      console.error('Error updating password:', error);
      if (error.code === 'auth/wrong-password') {
        alert('Current password is incorrect');
      } else if (error.code === 'auth/weak-password') {
        alert('New password is too weak');
      } else {
        alert(error.message || 'Error updating password. Please try again.');
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (!auth.currentUser || !userId) return;
  
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete your account? This cannot be undone."
    );
    if (!confirmDelete) return;
  
    try {
      const user = auth.currentUser;
      const email = user.email;
  
      if (!email) throw new Error("Your email is missing — please sign in again.");
  
      // Get provider from current user session
      const providers = user.providerData.map(p => p.providerId);
      console.log("Detected providers:", providers);
  
      // Reauthentication
      if (providers.includes("password")) {
        const password = prompt("Please enter your password to confirm deletion:");
        if (!password) throw new Error("Password required for reauthentication");
  
        const credential = EmailAuthProvider.credential(email, password);
        await reauthenticateWithCredential(user, credential);
  
      } else if (providers.includes("google.com")) {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
  
      } else {
        throw new Error("Your sign-in provider is not supported for deletion through this method.");
      }
  
      // Delete profile picture if exists
      if (profile.photoURL) {
        try {
          const imageRef = ref(storage, `profile-pictures/${userId}`);
          await deleteObject(imageRef);
        } catch {
          console.warn("Profile picture not found or already deleted.");
        }
      }
  
      // Delete Firestore user document
      await deleteDoc(doc(db, "users", userId));
  
      // Delete Auth account
      await deleteUser(user);
  
      alert("Your account has been deleted.");
      window.location.href = "/";
  
    } catch (error: any) {
      console.error("Error deleting account:", error);
      alert(error.message || "Error deleting account.");
    }
  };
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        loadUserData(user.uid);
      } else {
        router.push('/signin'); // redirect if not signed in
      }
    });

    return () => unsubscribe();
  }, []);

  // Load user data from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        loadUserData(user.uid);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line
  }, []);

  const loadUserData = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        setProfile(prev => ({
          ...prev,
          ...userData,
          notifications: {
            ...prev.notifications!,
            ...(userData.notifications || {})
          },
          privacy: {
            ...prev.privacy!,
            ...(userData.privacy || {})
          }
        }));
        setHasLoaded(true); // signal that load is done
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-update Firestore when profile changes, with debounce
  useEffect(() => {
    if (!userId || !hasLoaded) return;
    setIsSaving(true);
    const timeout = setTimeout(async () => {
      try {
        await updateDoc(doc(db, "users", userId), {
          ...profile,
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error auto-updating profile:", error);
      } finally {
        setIsSaving(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeout);
  }, [profile, userId, hasLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !userId) return;
    
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('File size should be less than 5MB');
      return;
    }

    setUploading(true);
    const storageRef = ref(storage, `profile-pictures/${userId}/${file.name}`);
    
    try {
      // Upload the file to Firebase Storage
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update user profile in Firestore
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        photoURL: downloadURL
      });
      
      // Update auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          photoURL: downloadURL
        });
      }
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        photoURL: downloadURL
      }));
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleNotificationChange = (key: keyof NonNullable<UserProfile['notifications']>) => {
    setProfile(prev => ({
      ...prev,
      notifications: {
        ...(prev.notifications || {
          email: true,
          meetingReminders: true,
          eventAnnouncements: true,
          clubInvitations: true,
          weeklyDigest: true,
        }),
        [key]: !prev.notifications?.[key as keyof NonNullable<UserProfile['notifications']>]
      }
    }));
  };

  const handlePrivacyChange = (key: keyof NonNullable<UserProfile['privacy']>) => {
    setProfile(prev => ({
      ...prev,
      privacy: {
        ...(prev.privacy || {
          profileVisible: true,
          showClubMembership: true,
          allowContact: true,
        }),
        [key]: !prev.privacy?.[key as keyof NonNullable<UserProfile['privacy']>]
      }
    }));
  };

  const gradeLevels = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];

  if (loading) {
    return (
      <div className="min-h-screen bg-cblack flex items-center justify-center">
        <LoadingModal loadingMessage="Loading your settings..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cblack flex flex-col">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        <div className="mb-8">
          <div className='text-5xl mb-2 font-semibold text-white'>
            Your <span className="text-azul">Settings</span>
          </div>
          <p className="mt-1 text-sm text-gray-400">
            Manage your account preferences and profile information
          </p>
        </div>

        <div className="space-y-10">
          {/* Profile Information */}
          <div className="bg-tilegrey shadow-lg rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-white mb-6 flex items-center">
              <FaUser className="mr-2" /> Profile Information
            </h2>
            <div className="flex flex-col sm:flex-row gap-8">
              <div className="sm:w-1/3">
                <div className="relative w-32 h-32 mx-auto" style={{ minWidth: 128, minHeight: 128 }}>
                  <div className="rounded-full bg-gray-700 overflow-hidden w-32 h-32 flex items-center justify-center">
                    {profile.photoURL ? (
                      <img
                        src={profile.photoURL}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl text-gray-400 select-none">
                        {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    )}
                  </div>
                  <label
                    htmlFor="profile-upload"
                    className="absolute -bottom-0 -right-0 bg-tilegrey shadow-lg border-2 border-white rounded-full p-2 cursor-pointer flex items-center justify-center hover:bg-gray-600 transition"
                    style={{ zIndex: 10 }}
                  >
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <FaSpinner className="animate-spin h-5 w-5 text-white" />
                    ) : (
                      <FaCamera className="h-5 w-5 text-white" />
                    )}
                  </label>
                  <p className="text-xs text-gray-400 text-center mt-3">JPG, PNG or GIF.</p>
                </div>

              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-azul focus:border-azul"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-gray-400 rounded-md shadow-sm cursor-not-allowed"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-azul focus:border-azul"
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Grade Level</label>
                    <button
                      type="button"
                      onClick={() => setShowGradeDropdown(!showGradeDropdown)}
                      className="w-full flex justify-between items-center px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm text-left focus:outline-none focus:ring-azul focus:border-azul"
                    >
                      <span>{profile.gradeLevel || 'Select grade'}</span>
                      <FaChevronDown className="h-5 w-5 text-gray-400" />
                    </button>
                    {showGradeDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-gray-700 shadow-lg rounded-md py-1 border border-gray-600">
                        {gradeLevels.map((level) => (
                          <button
                            key={level}
                            onClick={() => {
                              setProfile(prev => ({ ...prev, gradeLevel: level }));
                              setShowGradeDropdown(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-600 flex items-center ${profile.gradeLevel === level ? 'bg-azul/20 text-white' : 'text-gray-300'}`}
                          >
                            {profile.gradeLevel === level && <FaCheck className="mr-2 h-4 w-4" />}
                            <span className={profile.gradeLevel === level ? 'ml-6' : 'ml-6'}>{level}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Major</label>
                  <input
                    type="text"
                    name="major"
                    value={profile.major || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-azul focus:border-azul"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-tilegrey shadow-lg rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-white mb-6 flex items-center">
              <FaLock className="mr-2" /> Account Security
            </h2>
            <div className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-azul focus:border-azul"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    ) : (
                      <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-azul focus:border-azul"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 border border-gray-600 bg-gray-700 text-white rounded-md shadow-sm focus:outline-none focus:ring-azul focus:border-azul"
                />
              </div>
              
              {/* Password Update Button */}
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handlePasswordUpdate}
                  disabled={passwordSaving || !currentPassword || !newPassword || !confirmPassword}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-azul hover:bg-azul/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azul disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {passwordSaving ? (
                    <>
                      <FaSpinner className="animate-spin -ml-1 mr-2 h-5 w-5" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <FaSave className="-ml-1 mr-2 h-5 w-5" />
                      Update Password
                    </>
                  )}
                </button>
              </div>

              <div className="pt-2">
                <h3 className="text-sm font-medium text-white flex items-center">
                  Two-Factor Authentication
                </h3>
                <p className="text-sm text-gray-400 mt-1">Add an extra layer of security to your account</p>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-azul focus:ring-offset-2 ${twoFactorEnabled ? 'bg-azul' : 'bg-gray-700'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                  <span className="ml-3 text-sm font-medium text-white">
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-tilegrey shadow-lg rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-white mb-6 flex items-center">
              <FaBell className="mr-2" /> Notification Preferences
            </h2>
            <div className="space-y-4">
              {[
                { id: 'email', label: 'Email Notifications', description: 'Receive notifications via email' },
                { id: 'meetingReminders', label: 'Club Meeting Reminders', description: 'Get reminded about upcoming club meetings' },
                { id: 'eventAnnouncements', label: 'Event Announcements', description: 'Stay updated on club events and activities' },
                { id: 'clubInvitations', label: 'New Club Invitations', description: 'Get notified when invited to join new clubs' },
                { id: 'weeklyDigest', label: 'Weekly Digest', description: 'Receive a weekly summary of club activities' },
              ].map(({ id, label, description }) => (
                <div key={id} className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id={id}
                      name={id}
                      type="checkbox"
                      checked={profile.notifications?.[id as keyof NonNullable<UserProfile['notifications']>] || false}
                      onChange={() => handleNotificationChange(id as keyof NonNullable<UserProfile['notifications']>)}
                      className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-azul focus:ring-azul"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor={id} className="font-medium text-white cursor-pointer">
                      {label}
                    </label>
                    <p className="text-gray-400">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-tilegrey shadow-lg rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-white mb-6 flex items-center">
              <FaLock className="mr-2" /> Privacy Settings
            </h2>
            <div className="space-y-4">
              {[
                { id: 'profileVisible', label: 'Profile Visibility', description: 'Allow other students to view your profile' },
                { id: 'showClubMembership', label: 'Show Club Membership', description: 'Display which clubs you\'re a member of' },
                { id: 'allowContact', label: 'Contact Information', description: 'Allow club officers to contact you directly' },
              ].map(({ id, label, description }) => (
                <div key={id} className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id={`privacy-${id}`}
                      name={`privacy-${id}`}
                      type="checkbox"
                      checked={profile.privacy?.[id as keyof NonNullable<UserProfile['privacy']>] || false}
                      onChange={() => handlePrivacyChange(id as keyof NonNullable<UserProfile['privacy']>)}
                      className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-azul focus:ring-azul cursor-pointer"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor={`privacy-${id}`} className="font-medium text-white cursor-pointer">
                      {label}
                    </label>
                    <p className="text-gray-400">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-tilegrey shadow-lg rounded-lg p-6 mb-6">
            <h2 className="text-lg font-medium text-white mb-6 flex items-center">
              <FaLock className="mr-2" /> Account Actions
            </h2>
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-700 pb-6">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-base font-medium text-white">Sign Out</h3>
                  <p className="mt-1 text-sm text-gray-400">Sign out of your account on this device.</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await signOut(auth);
                      window.location.href = '/';
                    } catch (error) {
                      console.error('Error signing out:', error);
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azul transition-colors"
                >
                  <FaSignOutAlt className="-ml-1 mr-2 h-5 w-5" />
                  Sign Out
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-700 pb-6">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-base font-medium text-white">Export Data</h3>
                  <p className="text-sm text-gray-400 mt-1">Download a copy of your account data</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-azul transition-colors"
                >
                  <FaDownload className="-ml-1 mr-2 h-5 w-5 text-gray-300" />
                  Download
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-base font-medium text-white">Delete Account</h3>
                  <p className="text-sm text-gray-400 mt-1">Permanently delete your account and all data</p>
                </div>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <FaTrash className="-ml-1 mr-2 h-5 w-5" />
                  Delete
                </button>
              </div>
            </div>
          </div>

          {/* Mini status bar for auto-save */}
          <div className="text-sm text-gray-400 py-2 text-right">
            {isSaving ? "Saving changes..." : "All changes saved"}
          </div>
        </div>
      </div>
    </div>
  );
}
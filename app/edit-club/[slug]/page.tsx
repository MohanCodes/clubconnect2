"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { FaEnvelope, FaTimes, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUserGraduate, FaDollarSign, FaPlus, FaTrash, FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaYoutube, FaDiscord, FaGithub, FaTiktok, FaGlobe, FaUser, FaLink, FaCircleNotch } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import { auth, db, storage } from '@/firebase/firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { User as FirebaseUser } from 'firebase/auth';
import { nanoid } from 'nanoid';

type User = Pick<FirebaseUser, 'uid' | 'email' | 'displayName'>;

interface Advisor {
  name: string;
  email: string;
}

interface StudentLead {
  name: string;
  role: string;
  email: string;
}

interface ClubLink {
  url: string;
  platform: string;
}

interface OneOffEvent {
  date: string; // Store as 'YYYY-MM-DD' string
  title: string;
}

interface RecurringEvent {
  title: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  dayOfWeek: number;
  startDate: string; // Format: 'YYYY-MM-DD'
  endDate: string; // Format: 'YYYY-MM-DD'
  exceptions: string[]; // Array of 'YYYY-MM-DD' strings
}

interface Blog {
  id: string; // Add ID property
  title: string;
  content: string;
  date: Date;
}

interface ClubInfo {
  id: string;
  isComplete: boolean;
  name: string;
  school: string;
  tags: string[];
  description: string;
  length: string;
  meetingTimes: string;
  meetingSite: string;
  eligibility: string;
  costs: string;
  advisors: Advisor[];
  studentLeads: StudentLead[];
  links: ClubLink[];
  images: string[];
  recurringEvents: RecurringEvent[];
  oneOffEvents: OneOffEvent[];
  blogIds: string[];
}

function getNextMeetingDate(event: RecurringEvent) {
  const today = new Date();
  const eventDay = event.dayOfWeek;
  const nextMeeting = new Date(today);

  // Calculate the next occurrence of the event's day of the week
  while (nextMeeting.getDay() !== eventDay) {
    nextMeeting.setDate(nextMeeting.getDate() + 1);
  }

  // Check if the next meeting is within the event's date range
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  
  if (nextMeeting >= startDate && nextMeeting <= endDate) {
    return nextMeeting;
  } else {
    return null; // No upcoming meeting within the range
  }
}

const EditClubPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLink, setNewLink] = useState({ url: '', platform: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newOneOffEvent, setNewOneOffEvent] = useState<OneOffEvent>({
    date: new Date().toISOString().split('T')[0], // This will give you 'YYYY-MM-DD'
    title: ''
  });
  const [newBlogTitle, setNewBlogTitle] = useState<string>('');
  const [newBlogContent, setNewBlogContent] = useState<string>('');
  const [blogToDelete] = useState<Blog | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [clubInfo, setClubInfo] = useState<ClubInfo>({
    id: "",
    isComplete: false,
    name: "",
    school: "",
    tags: [],
    description: "",
    length: "",
    meetingTimes: "",
    meetingSite: "",
    eligibility: "",
    costs: "",
    advisors: [],
    studentLeads: [],
    links: [],
    images: [],
    recurringEvents: [],
    oneOffEvents: [],
    blogIds: [],
});
  const [newTag, setNewTag] = useState("");

  const router = useRouter();
  const params = useParams();
  const slug = params.slug;

  const fetchClubInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      if (typeof slug !== 'string') {
        console.error('Invalid slug');
        return;
      }
      const clubDocRef = doc(db, 'clubs', slug);;
      const clubSnapshot = await getDoc(clubDocRef);
  
      if (clubSnapshot.exists()) {
        const clubData = clubSnapshot.data() as ClubInfo;
        
        // Fetch blog data separately
        if (clubData.blogIds && clubData.blogIds.length > 0) {
          const blogPromises = clubData.blogIds.map(async (blogId) => {
            const blogDocRef = doc(db, 'blogs', blogId);
            const blogSnapshot = await getDoc(blogDocRef);
            if (blogSnapshot.exists()) {
              const blogData = blogSnapshot.data();
              return {
                id: blogId,
                title: blogData.title,
                content: blogData.content,
                date: blogData.date ? new Date(blogData.date.seconds * 1000) : new Date(),
              } as Blog;
            }
            return null;
          });
          const blogs = (await Promise.all(blogPromises)).filter((blog): blog is Blog => blog !== null);
          setBlogs(blogs);
        }
  
        setClubInfo({
            ...clubData,
            links: clubData.links || [], // Default to empty array if undefined
            oneOffEvents: clubData.oneOffEvents || [],
        });
      } else {
        console.error('Club not found');
      }
    } catch (error) {
      console.error('Error fetching club data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        router.push('/signin');
      } else {
        fetchClubInfo();
      }
    });
  
    return () => unsubscribe();
  }, [router, fetchClubInfo]);

  const checkCompletion = (info: ClubInfo): boolean => {
    const requiredFields: (keyof ClubInfo)[] = [
      'name', 'school', 'description', 'length', 'meetingTimes', 
      'meetingSite', 'eligibility', 'costs'
    ];
    
    const isAllFieldsFilled = requiredFields.every(field => 
      info[field] !== undefined && info[field] !== ''
    );
    
    const hasAdvisor = info.advisors && info.advisors.length > 0 && 
      info.advisors.every(advisor => advisor.name !== '' && advisor.email !== '');
    
    const hasStudentLead = info.studentLeads && info.studentLeads.length > 0 && 
      info.studentLeads.every(lead => lead.name !== '' && lead.role !== '' && lead.email !== '');
    
    const hasLink = info.links && info.links.length > 0;
    
    return isAllFieldsFilled && hasAdvisor && hasStudentLead && hasLink;
  };

  const handleEdit = () => setIsEditing(true);
  const handleSave = () => setIsEditing(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof ClubInfo) => {
    if (field !== 'name' && field !== 'school') {
      const updatedClubInfo = { ...clubInfo, [field]: e.target.value };
      setClubInfo({
        ...updatedClubInfo,
        isComplete: checkCompletion(updatedClubInfo)
      });
    }
  };

  const handleAddTag = () => {
    if (newTag && !clubInfo.tags?.includes(newTag)) {
      setClubInfo(prevState => ({
        ...prevState,
        tags: [...(prevState.tags || []), newTag]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (index: number) => {
    setClubInfo(prevState => ({
      ...prevState,
      tags: (prevState.tags || []).filter((_, i) => i !== index)
    }));
  };

  const handleAdvisorChange = (index: number, field: keyof Advisor, value: string) => {
    const updatedAdvisors = [...clubInfo.advisors];
    updatedAdvisors[index] = { ...updatedAdvisors[index], [field]: value };
    const updatedClubInfo = { ...clubInfo, advisors: updatedAdvisors };
    setClubInfo({
      ...updatedClubInfo,
      isComplete: checkCompletion(updatedClubInfo)
    });
  };

  const handleAddAdvisor = () => {
    setClubInfo(prevState => ({
      ...prevState,
      advisors: [...(prevState.advisors || []), { name: "", email: "" }]
    }));
  };

  const handleRemoveAdvisor = (index: number) => {
    const updatedAdvisors = clubInfo.advisors.filter((_, i) => i !== index);
    setClubInfo({ ...clubInfo, advisors: updatedAdvisors });
  };

  const handleStudentLeadChange = (index: number, field: keyof StudentLead, value: string) => {
    const updatedLeads = [...clubInfo.studentLeads];
    updatedLeads[index] = { ...updatedLeads[index], [field]: value };
    const updatedClubInfo = { ...clubInfo, studentLeads: updatedLeads };
    setClubInfo({
      ...updatedClubInfo,
      isComplete: checkCompletion(updatedClubInfo)
    });
  };

  const handleAddStudentLead = () => {
    setClubInfo(prevState => ({
      ...prevState,
      studentLeads: [...(prevState.studentLeads || []), { name: "", role: "", email: "" }]
    }));
  };

  const handleRemoveStudentLead = (index: number) => {
    const updatedLeads = clubInfo.studentLeads.filter((_, i) => i !== index);
    setClubInfo({ ...clubInfo, studentLeads: updatedLeads });
  };

  const handleAddLink = () => {
    if (newLink.url && newLink.platform) {
      const updatedClubInfo = {
        ...clubInfo,
        links: [...clubInfo.links, newLink]
      };
      setClubInfo({
        ...updatedClubInfo,
        isComplete: checkCompletion(updatedClubInfo)
      });
      setNewLink({ url: '', platform: '' });
      setIsModalOpen(false);
    }
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = clubInfo.links.filter((_, i) => i !== index);
    setClubInfo({ ...clubInfo, links: updatedLinks });
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      const clubDocRef = doc(db, 'clubs', clubInfo.id);
  
      // Create the club data object
      const clubData: ClubInfo = {
        ...clubInfo,
        isComplete: checkCompletion(clubInfo),
      };
  
      // Only include recurringEvents if they exist
      if (clubInfo.recurringEvents && clubInfo.recurringEvents.length > 0) {
        clubData.recurringEvents = clubInfo.recurringEvents.map(event => ({
          ...event,
          startDate: event.startDate, // Assuming these are already in the correct format
          endDate: event.endDate,
          exceptions: event.exceptions,
        }));
      }
  
      // Only include oneOffEvents if they exist
      if (clubInfo.oneOffEvents && clubInfo.oneOffEvents.length > 0) {
        clubData.oneOffEvents = clubInfo.oneOffEvents.map(event => ({
          ...event,
          date: event.date, // Assuming these are already in the correct format
        }));
      }
  
      await setDoc(clubDocRef, clubData);
      console.log('Club data uploaded successfully');
    } catch (error) {
      console.error('Error uploading club data:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteClub = async () => {
    try {
      const docId = `${clubInfo.name.replace(/\s+/g, '-')}-${clubInfo.school.replace(/\s+/g, '-')}`.toLowerCase();
      const clubDocRef = doc(db, 'clubs', docId);
      await deleteDoc(clubDocRef);
      console.log('Club deleted successfully');
      router.push('/dashboard'); // Redirect to the clubs list page
    } catch (error) {
      console.error('Error deleting club:', error);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return <FaTwitter />;
      case 'instagram': return <FaInstagram />;
      case 'facebook': return <FaFacebook />;
      case 'linkedin': return <FaLinkedin />;
      case 'youtube': return <FaYoutube />;
      case 'discord': return <FaDiscord />;
      case 'github': return <FaGithub />;
      case 'tiktok': return <FaTiktok />;
      case 'website': return <FaGlobe />;
      case 'personal': return <FaUser />;
      default: return <FaLink />;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const storageRef = ref(storage, `clubs/${clubInfo.id}/${file.name}`);
      try {
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        const clubDocRef = doc(db, 'clubs', clubInfo.id);
        await updateDoc(clubDocRef, {
          images: arrayUnion(downloadURL)
        });
        setClubInfo(prevState => ({
          ...prevState,
          images: [...(prevState.images || []), downloadURL]
        }));
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };
  
  const handleImageDelete = async (url: string) => {
    try {
      // Create a reference to the file using the full URL
      const imageRef = ref(storage, url);
  
      // Delete the file from Firebase Storage
      await deleteObject(imageRef);
  
      // Update Firestore document
      const clubDocRef = doc(db, 'clubs', clubInfo.id);
      await updateDoc(clubDocRef, {
        images: arrayRemove(url)
      });
  
      // Update local state
      setClubInfo(prevState => ({
        ...prevState,
        images: prevState.images.filter(image => image !== url)
      }));
  
      console.log('Image deleted successfully');
    } catch (error) {
      console.error('Error deleting image:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleOneOffEventChange = (field: 'date' | 'title', value: string) => {
    setNewOneOffEvent(prev => ({ ...prev, [field]: value }));
  };
  
  const handleAddOneOffEvent = () => {
    if (newOneOffEvent.title && newOneOffEvent.date) {
      setClubInfo(prevState => ({
        ...prevState,
        oneOffEvents: [...prevState.oneOffEvents, newOneOffEvent]
      }));
      setNewOneOffEvent({ date: new Date().toISOString().split('T')[0], title: '' });
    }
  };
  
  // Similarly for recurring events when adding or updating
  
  const handleRemoveOneOffEvent = (index: number) => {
    setClubInfo(prevState => ({
      ...prevState,
      oneOffEvents: prevState.oneOffEvents.filter((_, i) => i !== index)
    }));
  };

  type RecurringEventValueType = string | number | 'weekly' | 'biweekly' | 'monthly';

  const handleRecurringEventChange = (index: number, field: keyof RecurringEvent, value: RecurringEventValueType) => {
      const updatedEvents = [...clubInfo.recurringEvents];
      updatedEvents[index] = { ...updatedEvents[index], [field]: value };
      setClubInfo(prevState => ({ ...prevState, recurringEvents: updatedEvents }));
  };
    
  const handleAddRecurringEvent = () => {
    const today = new Date().toISOString().split('T')[0];
    const oneYearLater = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0];
    
    setClubInfo(prevState => ({
        ...prevState,
        recurringEvents: [
            ...(prevState.recurringEvents || []), // Ensure this defaults to an empty array if undefined
            {
                title: '',
                frequency: 'weekly',
                dayOfWeek: 1,
                startDate: today,
                endDate: oneYearLater,
                exceptions: []
            }
        ]
    }));
  };
  
  const handleRemoveRecurringEvent = (index: number) => {
    setClubInfo(prevState => ({
      ...prevState,
      recurringEvents: prevState.recurringEvents.filter((_, i) => i !== index)
    }));
  };
  
  const handleAddException = (eventIndex: number, date: string) => {
    setClubInfo(prevState => {
      const updatedEvents = [...prevState.recurringEvents];
      updatedEvents[eventIndex].exceptions.push(date);
      return { ...prevState, recurringEvents: updatedEvents };
    });
  };
  
  const handleRemoveException = (eventIndex: number, exceptionIndex: number) => {
    setClubInfo(prevState => {
      const updatedEvents = [...prevState.recurringEvents];
      updatedEvents[eventIndex].exceptions = updatedEvents[eventIndex].exceptions.filter((_, i) => i !== exceptionIndex);
      return { ...prevState, recurringEvents: updatedEvents };
    });
  };

  const handleAddBlog = async () => {
    if (newBlogTitle.trim() && newBlogContent.trim()) {
      try {
        if (!clubInfo.id) {
          console.error('Invalid club ID:', clubInfo.id);
          return;
        }
  
        const blogId = nanoid(6);
        const newBlog = {
          id: blogId,
          title: newBlogTitle,
          content: newBlogContent,
          date: new Date(),
          clubId: clubInfo.id,
          clubName: clubInfo.name
        };
  
        // Add the blog to the 'blogs' collection
        const blogDocRef = doc(db, 'blogs', blogId);
        await setDoc(blogDocRef, newBlog);
  
        // Update the club document with just the blog ID
        const clubDocRef = doc(db, 'clubs', clubInfo.id);
        await updateDoc(clubDocRef, {
          blogIds: arrayUnion(blogId)
        });
  
        setNewBlogTitle('');
        setNewBlogContent('');
        fetchClubInfo();
      } catch (error) {
        console.error('Error adding blog:', error);
      }
    } else {
      console.error('Title and content cannot be empty');
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    try {
      const clubDocRef = doc(db, 'clubs', clubInfo.id);
      const blogDocRef = doc(db, 'blogs', blogId);
  
      // Remove the blog ID from the club document
      await updateDoc(clubDocRef, {
        blogIds: arrayRemove(blogId)
      });
  
      // Delete the blog document from the 'blogs' collection
      await deleteDoc(blogDocRef);

      setClubInfo(prevState => ({
      ...prevState,
      blogIds: prevState.blogIds.filter(id => id !== blogId)
    }));
  
      console.log('Blog deleted successfully');
      fetchClubInfo();
    } catch (error) {
      console.error('Error deleting blog:', error);
    }
  };

  if (!user) {
    return null; // Prevent rendering if user is not authenticated
  }

  return (
    <div className="bg-cblack min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
      {isLoading && (
        <div className="fixed inset-0 bg-black backdrop-blur bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex flex-col items-center">
            <FaCircleNotch className="animate-spin h-16 w-16 text-azul" />
            <p className="mt-4 text-azul font-semibold">Loading club data...</p>
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black backdrop-blur bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Delete Club</h2>
              <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <FaTimes size={24} />
              </button>
            </div>
            <p className="mb-4">Are you sure you want to delete this club? This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteClub();
                  setIsDeleteModalOpen(false);
                }}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
        <div className="flex flex-col md:flex-row items-center justify-between pb-4 pt-2 sticky top-0 z-40 bg-cblack break-words">
          <h1 className="text-2xl md:text-4xl font-bold text-white mb-4 text-center md:text-left">
            {clubInfo.name === "" ? 'Enter Club Name Here' : clubInfo.name}
          </h1>
          
          <div className='flex flex-wrap justify-center md:justify-end gap-2 w-full'>
            <button
              onClick={isEditing ? handleSave : handleEdit}
              className="bg-azul text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-full flex-grow md:flex-grow-0"
            >
              {isEditing ? 'Render Page' : 'Edit Page'}
            </button>
            
            <button
              onClick={handleUpload}
              className="bg-azul text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-full flex-grow md:flex-grow-0"
              disabled={isUploading}
            >
              {isUploading ? 'Uploading...' : 'Save Changes'}
            </button>
            
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-red-500 text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-full flex-grow md:flex-grow-0"
            >
              Delete Club
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex-grow">
            {(clubInfo.tags || []).map((tag, index) => (
              <span key={index} className="inline-block bg-blue-100 text-azul text-sm font-medium px-3 py-1 rounded-full mr-2 mb-2">
                {tag}
                {isEditing && (
                  <button onClick={() => handleRemoveTag(index)} className="ml-2 text-red-500 text-xl">×</button>
                )}
              </span>
            ))}
            {isEditing && (
              <div className="flex items-center mt-2 max-w-screen">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a new tag"
                  className="bg-gray-800 text-white p-1 rounded"
                />
                <button onClick={handleAddTag} className="bg-green-500 text-white px-2 py-1 rounded ml-2">
                  Add
                </button>
              </div>
            )}
          </div>
          <div className="flex-shrink-0 max-w-full md:w-1/3 md:text-right">
            <p className={`text-${clubInfo.isComplete ? 'white' : 'red-500'} ${clubInfo.isComplete ? '' : 'whitespace-normal'}`}>
              {clubInfo.isComplete 
                ? 'Club information is complete!' 
                : 'Club information is incomplete, and won\'t be shown on the main page until all fields have been filled.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 grid lg:grid-cols-2">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Description</h2>
              {isEditing ? (
                <div className="relative">
                  <textarea
                    value={clubInfo.description}
                    onChange={(e) => {
                      if (e.target.value.length <= 1000) {
                        handleChange(e, 'description');
                      }
                    }}
                    className="w-full box-border h-60 p-2 text-grey bg-gray-800 rounded mb-4 overflow-x-hidden"
                    placeholder="One paragraph club description"
                    maxLength={1000}
                  />
                  <span className={`absolute bottom-6 left-2 text-sm ${
                    clubInfo.description?.length === 1000 ? 'text-red-500 font-bold' : 'text-grey'
                  }`}>
                    {clubInfo.description ? clubInfo.description.length : 0}/1000
                  </span>
                </div>
              ) : (
                <p className="text-grey break-words mb-4">{clubInfo.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-grey">
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2 text-azul" />
                {isEditing ? (
                  <input
                    type="text"
                    value={clubInfo.length}
                    onChange={(e) => handleChange(e, 'length')}
                    className="bg-gray-800 text-white p-1 rounded"
                    placeholder="Club Length"
                  />
                ) : (
                  <span>{clubInfo.length}</span>
                )}
              </div>
              <div className="flex items-center">
                <FaClock className="mr-2 text-azul" />
                {isEditing ? (
                  <input
                    type="text"
                    value={clubInfo.meetingTimes}
                    onChange={(e) => handleChange(e, 'meetingTimes')}
                    className="bg-gray-800 text-white p-1 rounded"
                    placeholder="Meeting Times"
                  />
                ) : (
                  <span>{clubInfo.meetingTimes}</span>
                )}
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-2 text-azul" />
                {isEditing ? (
                  <input
                    type="text"
                    value={clubInfo.meetingSite}
                    onChange={(e) => handleChange(e, 'meetingSite')}
                    className="bg-gray-800 text-white p-1 rounded"
                    placeholder="Meeting Site"
                  />
                ) : (
                  <span>{clubInfo.meetingSite}</span>
                )}
              </div>
              <div className="flex items-center">
                <FaUserGraduate className="mr-2 text-azul" />
                {isEditing ? (
                  <input
                    type="text"
                    value={clubInfo.eligibility}
                    onChange={(e) => handleChange(e, 'eligibility')}
                    className="bg-gray-800 text-white p-1 rounded"
                    placeholder="Eligibility"
                  />
                ) : (
                  <span>{clubInfo.eligibility}</span>
                )}
              </div>
              <div className="flex items-center">
                <FaDollarSign className="mr-2 text-azul" />
                {isEditing ? (
                  <input
                    type="text"
                    value={clubInfo.costs}
                    onChange={(e) => handleChange(e, 'costs')}
                    className="bg-gray-800 text-white p-1 rounded"
                    placeholder="Costs"
                  />
                ) : (
                  <span>{clubInfo.costs}</span>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Advisors</h2>
              {(clubInfo.advisors || []).map((advisor, index) => (
                <div key={index} className="mb-2">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={advisor.name}
                        onChange={(e) => handleAdvisorChange(index, 'name', e.target.value)}
                        className="bg-gray-800 text-white p-1 rounded mr-2"
                        placeholder="Advisor Name"
                      />
                      <input
                        type="email"
                        value={advisor.email}
                        onChange={(e) => handleAdvisorChange(index, 'email', e.target.value)}
                        className="bg-gray-800 text-white p-1 rounded mr-2"
                        placeholder="Advisor Email"
                      />
                      <button onClick={() => handleRemoveAdvisor(index)} className="text-red-500">
                        <FaTrash />
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-grey">{advisor.name}</p>
                      <Link href={`mailto:${advisor.email}`} className="text-azul hover:underline">
                        <span className="flex items-center">
                          <FaEnvelope className="mr-2" />
                          {advisor.email}
                        </span>
                      </Link>
                    </>
                  )}
                </div>
              ))}
              {isEditing && (
                <button onClick={handleAddAdvisor} className="bg-green-500 text-white px-2 py-1 rounded flex flex-row items-center">
                  <FaPlus className="mr-2" /> Add Advisor
                </button>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Student Leads</h2>
              {(clubInfo.studentLeads || []).map((lead, index) => (
                <div key={index} className="mb-2">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={lead.name}
                        onChange={(e) => handleStudentLeadChange(index, 'name', e.target.value)}
                        className="bg-gray-800 text-white p-1 rounded mr-2"
                        placeholder="Student Name"
                      />
                      <input
                        type="text"
                        value={lead.role}
                        onChange={(e) => handleStudentLeadChange(index, 'role', e.target.value)}
                        className="bg-gray-800 text-white p-1 rounded mr-2 mt-2"
                        placeholder="Student Role"
                      />
                      <input
                        type="email"
                        value={lead.email}
                        onChange={(e) => handleStudentLeadChange(index, 'email', e.target.value)}
                        className="bg-gray-800 text-white p-1 rounded mr-2 mt-2"
                        placeholder="Student Email"
                      />
                      <button onClick={() => handleRemoveStudentLead(index)} className="text-red-500">
                        <FaTrash />
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-grey">{lead.name} - {lead.role}</p>
                      <Link href={`mailto:${lead.email}`} className="text-azul hover:underline">
                        <span className="flex items-center">
                          <FaEnvelope className="mr-2" />
                          {lead.email}
                        </span>
                      </Link>
                    </>
                  )}
                </div>
              ))}
              {isEditing && (
                <button onClick={handleAddStudentLead} className="bg-green-500 text-white px-2 py-1 rounded flex flex-row items-center">
                  <FaPlus className="mr-2" /> Add Student Lead
                </button>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Links</h2>
              {(clubInfo.links || []).map((link, index) => (
                <div key={index} className="flex items-center mb-2">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-azul hover:underline flex items-center">
                    {getPlatformIcon(link.platform)}
                    <span className="ml-2">{link.platform}</span>
                  </a>
                  {isEditing && (
                    <button onClick={() => handleRemoveLink(index)} className="text-red-500 ml-2">
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <button onClick={() => setIsModalOpen(true)} className="bg-green-500 text-white px-2 py-1 rounded flex flex-row items-center">
                  <FaPlus className="mr-2" /> Add Link
                </button>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-2">One-off Events</h2>
              {isEditing && (
                  <p className="text-grey mb-2">
                    Leave blank if there are no events
                  </p>
              )}
              {clubInfo.oneOffEvents && clubInfo.oneOffEvents.length > 0 ? (
                clubInfo.oneOffEvents.map((event, index) => (
                  <div key={index} className="mb-4 flex items-center justify-between bg-gray-800 p-4 rounded-lg shadow-md lg:w-2/3">
                    <div className="flex items-center">
                      <FaCalendarAlt className="text-blue-400 mr-4" />
                      <span className="text-white">
                        {new Date(event.date).toLocaleDateString()} - {event.title}
                      </span>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveOneOffEvent(index)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        <FaTrash />
                      </button>
                      )}
                  </div>
                ))
              ) : (
                !isEditing && <p className="text-gray-300">No one-off events are scheduled at this time.</p>
              )}
              {isEditing && (
                <div>
                  <div className="flex items-center mt-2">
                    <input
                      type="date"
                      value={newOneOffEvent.date}
                      onChange={(e) => handleOneOffEventChange('date', e.target.value)}
                      className="bg-gray-800 text-white p-1 rounded mr-2"
                    />
                    <input
                      type="text"
                      value={newOneOffEvent.title}
                      onChange={(e) => handleOneOffEventChange('title', e.target.value)}
                      placeholder="Event Title"
                      className="bg-gray-800 text-white p-1 rounded md:w-auto w-1/2"
                    />
                  </div>
                  <button onClick={handleAddOneOffEvent} className="bg-green-500 text-white px-2 py-1 mt-2 rounded">
                    Add Event
                  </button>
                </div>
              )}
            </div>

            <div>
              {isEditing ? (
                <>
                  <h2 className="text-2xl font-bold text-white mb-2">Recurring Events</h2>
                  {(clubInfo.recurringEvents || []).map((event, index) => (
                    <div key={index} className="mb-4 p-4 bg-gray-800 rounded text-white">
                      {/* Event Title Input */}
                      <input
                        type="text"
                        value={event.title || ''}
                        onChange={(e) => handleRecurringEventChange(index, 'title', e.target.value)}
                        placeholder="Event Title"
                        className="bg-gray-700 text-white p-2 rounded mr-2"
                        disabled={!isEditing}
                      />
                      
                      {/* Remove Event Button */}
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveRecurringEvent(index)}
                          className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                          <FaTrash />
                        </button>
                      )}

                      {/* Frequency and Day of Week Selectors */}
                      <div className='flex flex-row mt-4'>
                        <select
                          value={event.frequency}
                          onChange={(e) => handleRecurringEventChange(index, 'frequency', e.target.value)}
                          className="bg-gray-700 p-2 rounded mr-2"
                          disabled={!isEditing}
                        >
                          <option value="weekly">Weekly</option>
                          <option value="biweekly">Bi-weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                        
                        <p className='flex items-center ml-1 mr-2'>
                          {event.frequency === 'biweekly' ? 'every other' : 'every'}
                        </p>
                        
                        <select
                          value={event.dayOfWeek}
                          onChange={(e) => handleRecurringEventChange(index, 'dayOfWeek', parseInt(e.target.value))}
                          className="bg-gray-700 p-2 rounded mr-2"
                          disabled={!isEditing}
                        >
                          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => (
                            <option key={i} value={i}>{day}</option>
                          ))}
                        </select>
                      </div>

                      {/* Start Date and End Date Inputs */}
                      <div className='my-2 flex flex-row'>
                        <p className='flex items-center mx-2'>From</p>
                        <input
                          type="date"
                          value={event.startDate}
                          onChange={(e) => handleRecurringEventChange(index, 'startDate', e.target.value)}
                          className="bg-gray-700 text-white p-2 rounded mr-2"
                          disabled={!isEditing}
                        />
                        
                        <p className='flex items-center mx-2'>To</p>
                        <input
                          type="date"
                          value={event.endDate}
                          onChange={(e) => handleRecurringEventChange(index, 'endDate', e.target.value)}
                          className="bg-gray-700 text-white p-2 rounded mr-2"
                          disabled={!isEditing}
                        />
                      </div>

                      {/* Exceptions Section */}
                      <div className="mt-2">
                        <h3 className="text-xl font-bold text-white mb-2">Exceptions</h3>
                        
                        {event.exceptions.map((exception, exceptionIndex) => (
                          <div key={exceptionIndex} className="flex items-center mb-2">
                            <span className="text-white mr-2">{exception}</span>
                            
                            {isEditing && (
                              <button
                                onClick={() => handleRemoveException(index, exceptionIndex)}
                                className="text-red-500"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        ))}
                        
                        {isEditing && (
                          <input
                            type="date"
                            onChange={(e) => handleAddException(index, e.target.value)}
                            className="bg-gray-700 text-white p-2 rounded"
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Add Recurring Event Button - only show when editing */}
                  {isEditing && (
                    <button
                      onClick={handleAddRecurringEvent}
                      className="bg-green-500 text-white px-2 py-1 rounded flex flex-row items-center"
                    >
                      <FaPlus className="mr-2" /> Add Recurring Event
                    </button>
                  )}
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold text-white mb-3">Recurring Events</h3>
                  {(clubInfo.recurringEvents || []).length > 0 ? (
                    clubInfo.recurringEvents.map((event, index) => {
                      const nextMeeting = getNextMeetingDate(event);
                      return (
                        <div key={index} className="mb-6 p-6 bg-gray-800 rounded-lg shadow-md text-white">
                          {/* Event Title */}
                          <p className="font-semibold text-lg">Event: {event.title || 'Untitled Event'}</p>

                          {/* Frequency and Day of Week */}
                          <p className="mt-2">
                            This event occurs{' '}
                            {event.frequency === 'biweekly' ? 'every other' : 'every'}{' '}
                            {
                              ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
                                event.dayOfWeek
                              ]
                            }.
                          </p>

                          {/* Start Date, End Date, and Next Meeting */}
                          <p className="mt-2">
                            It runs from {new Date(event.startDate).toLocaleDateString()} to{' '}
                            {new Date(event.endDate).toLocaleDateString()}.
                          </p>
                          
                          <p className="mt-2 font-semibold text-blue-400">
                            Next meeting: {nextMeeting ? nextMeeting.toLocaleDateString() : 'No upcoming meeting'}
                          </p>

                          {/* Display Exceptions */}
                          {event.exceptions.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-lg font-bold text-white mb-2">Exceptions:</h4>
                              <ul className="list-disc pl-5 text-gray-300">
                                {event.exceptions.map((exception, exceptionIndex) => (
                                  <li key={exceptionIndex}>{new Date(exception).toLocaleDateString()}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-300">No recurring events are currently scheduled.</p>
                  )}
                </>
              )}

              <div className="mt-8">
                <h2 className="text-2xl font-bold text-white mb-2">More Information</h2>
                <p className="text-grey">
                  For more information, please{' '}
                  <Link href="mailto:help@mnclubconnect.com" className="text-azul hover:underline">
                    contact ClubConnect.
                  </Link>
                </p>
              </div>
            </div>

          </div>

          <div className="space-y-10">
            <>
              {(clubInfo.images && clubInfo.images.length > 0 || isEditing) && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white -mb-8">Images</h2>
                </div>
              )}
                <div className="grid grid-cols-2 gap-4">
                  {clubInfo.images?.map((src: string, index: number) => (
                    <div key={index} className="relative h-64">
                      <Image
                        src={src}
                        alt={`Club activity ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                      />
                      {isEditing && ( // Only show the trash can when in edit mode
                        <button
                          onClick={() => handleImageDelete(src)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  ))}
                  {isEditing && ( // Show upload area only in edit mode
                    <div className="relative h-64 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg">
                      <input
                        type="file"
                        onChange={handleImageUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <FaPlus className="text-gray-400" />
                    </div>
                  )}
                </div>
            </>
          <div>
            
          {isEditing && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Add New Blog</h2>
              <input
                type="text"
                value={newBlogTitle}
                onChange={(e) => setNewBlogTitle(e.target.value)}
                placeholder="Blog Title"
                className="w-full p-2 mb-2 text-grey bg-gray-800 rounded"
              />
              <textarea
                value={newBlogContent}
                onChange={(e) => setNewBlogContent(e.target.value)}
                placeholder="Blog Content (Markdown supported)"
                className="w-full h-40 p-2 mb-2 text-grey bg-gray-800 rounded"
              />
              <button
                onClick={handleAddBlog}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Add Blog
              </button>
            </div>
          )}

            {(blogs && blogs.length > 0 || isEditing) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Blogs</h2>
              </div>
            )}
            <div className="flex flex-col lg:flex-row gap-8">
              {blogs.map((blog) => (
                <div key={blog.id} className="rounded-lg p-9 transition-shadow duration-300 bg-[#2A2A2A] lg:w-1/2">
                  <div className='flex flex-row justify-between'>
                    <h3 className="text-xl text-white font-bold">{blog.title}</h3>
                    {isEditing ? (
                      // Show the trash can when isEditing is true
                      <button onClick={() => handleDeleteBlog(blog.id)} className="text-red-500">
                        <FaTrash />
                      </button>
                    ) : (
                      // Show the link when isEditing is false
                      <Link href={`/blog/${blog.id}`} className="text-blue-500 hover:underline">
                        View
                      </Link>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1 mb-2">
                    {blog.date.toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-gray-300">
                    {blog.content.length > 200 ? `${blog.content.substring(0, 200)}...` : blog.content}
                  </p>
                </div>
              ))}
            </div>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && blogToDelete && (
                <div className="fixed inset-0 bg-black backdrop-blur bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg w-96">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold">Delete Blog</h2>
                            <button onClick={() => setIsDeleteModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <FaTimes size={24} />
                            </button>
                        </div>
                        <p className="mb-4">Are you sure you want to delete the blog titled &quot;{blogToDelete.title}&quot;? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-4">
                            <button onClick={() => setIsDeleteModalOpen(false)} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400">
                                Cancel
                            </button>
                            <button onClick={() => handleDeleteBlog(blogToDelete.id)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
          </div>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Add New Link</h3>
            <input
              type="text"
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              placeholder="Enter URL"
              className="w-full p-2 mb-2 border rounded"
            />
            <select
              value={newLink.platform}
              onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
              className="w-full p-2 mb-4 border rounded"
            >
              <option value="">Select Platform</option>
              <option value="twitter">Twitter</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="linkedin">LinkedIn</option>
              <option value="youtube">YouTube</option>
              <option value="discord">Discord</option>
              <option value="github">GitHub</option>
              <option value="tiktok">TikTok</option>
              <option value="website">Website</option>
              <option value="personal">Personal</option>
              <option value="other">Other</option>
            </select>
            <div className="flex justify-end">
              <button onClick={() => setIsModalOpen(false)} className="bg-gray-300 text-black px-4 py-2 rounded mr-2">
                Cancel
              </button>
              <button onClick={handleAddLink} className="bg-azul text-white px-4 py-2 rounded">
                Add Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditClubPage;

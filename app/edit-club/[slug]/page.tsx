"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { FaEnvelope, FaTimes, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUserGraduate, FaDollarSign, FaPlus, FaTrash, FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaYoutube, FaDiscord, FaGithub, FaTiktok, FaGlobe, FaUser, FaLink, FaCircleNotch } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import { auth, db, storage } from '@/firebase/firebase';
import { doc, collection, setDoc, getDocs, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { onAuthStateChanged } from 'firebase/auth';
import { User as FirebaseUser } from 'firebase/auth';

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
  date: Date;
  title: string;
}

interface RecurringEvent {
  title: string;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  dayOfWeek: number;
  startDate: Date;
  endDate: Date;
  exceptions: Date[];
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
  oneOffEvents: OneOffEvent[]; // Add this line
}

const EditClubPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLink, setNewLink] = useState({ url: '', platform: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newOneOffEvent, setNewOneOffEvent] = useState<OneOffEvent>({ date: new Date(), title: '' });
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
    oneOffEvents: [], // Add this line
  });
  const [newTag, setNewTag] = useState("");
  const [recurringEvents, setRecurringEvents] = useState<RecurringEvent[]>([]);

  const router = useRouter();
  const params = useParams();
  const slug = params.slug;

  const fetchClubInfo = useCallback(async () => {
    setIsLoading(true);
    try {
      const clubsCollectionRef = collection(db, 'clubs');
      const clubsSnapshot = await getDocs(clubsCollectionRef);
      const clubsData = clubsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          tags: data.tags || [],
          advisors: data.advisors || [],
          studentLeads: data.studentLeads || [],
          links: data.links || [],
          images: data.images || [],
          recurringEvents: data.recurringEvents || [],
          oneOffEvents: data.oneOffEvents || [] // Add this line
        } as ClubInfo;
      });
      const matchingClub = clubsData.find(club => club.id === slug);
      if (matchingClub) {
        setClubInfo(matchingClub);
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
    
    const hasAdvisor = info.advisors.length > 0 && 
      info.advisors.every(advisor => advisor.name !== '' && advisor.email !== '');
    
    const hasStudentLead = info.studentLeads.length > 0 && 
      info.studentLeads.every(lead => lead.name !== '' && lead.role !== '' && lead.email !== '');
    
    const hasLink = info.links.length > 0;
    
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
      
      // Update the title of recurring events
      const updatedRecurringEvents = clubInfo.recurringEvents?.map(event => ({
        ...event,
        title: `${clubInfo.name} ${event.title}`
      }));
  
      const clubData = {
        ...clubInfo,
        recurringEvents: updatedRecurringEvents,
        isComplete: checkCompletion({...clubInfo})
      };
  
      await setDoc(clubDocRef, clubData);
      console.log('Club data uploaded successfully');
  
      // Update the local state with the new recurring events
      setClubInfo(prevState => ({
        ...prevState,
        recurringEvents: updatedRecurringEvents
      }));
  
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

  const handleAddOneOffEvent = () => {
    if (newOneOffEvent.title && newOneOffEvent.date) {
      setClubInfo(prevState => ({
        ...prevState,
        oneOffEvents: [...prevState.oneOffEvents, newOneOffEvent]
      }));
      setNewOneOffEvent({ date: new Date(), title: '' });
    }
  };
  
  const handleRemoveOneOffEvent = (index: number) => {
    setClubInfo(prevState => ({
      ...prevState,
      oneOffEvents: prevState.oneOffEvents.filter((_, i) => i !== index)
    }));
  };
  
  const handleOneOffEventChange = (field: 'date' | 'title', value: string | Date) => {
    setNewOneOffEvent({ ...newOneOffEvent, [field]: value });
  };

  const handleRecurringEventChange = (index: number, field: keyof ClubInfo['recurringEvents'][0], value: any) => {
    const updatedEvents = [...recurringEvents];
    if (field === 'startDate' || field === 'endDate') {
      // Ensure the date is set to noon UTC to avoid timezone issues
      const date = new Date(value);
      date.setUTCHours(12, 0, 0, 0);
      updatedEvents[index] = { ...updatedEvents[index], [field]: date };
    } else {
      updatedEvents[index] = { ...updatedEvents[index], [field]: value };
    }
    setRecurringEvents(updatedEvents);
  };
  
  const handleAddRecurringEvent = () => {
    const today = new Date();
    today.setUTCHours(12, 0, 0, 0);
    const oneYearLater = new Date(today);
    oneYearLater.setFullYear(today.getFullYear() + 1);
  
    setRecurringEvents([...recurringEvents, {
      title: '',
      frequency: 'weekly',
      dayOfWeek: 1,
      startDate: today,
      endDate: oneYearLater,
      exceptions: []
    }]);
  };
  
  const handleRemoveRecurringEvent = (index: number) => {
    setRecurringEvents(recurringEvents.filter((_, i) => i !== index));
  };
  
  const handleAddException = (eventIndex: number, date: Date) => {
    const exceptionDate = new Date(date);
    exceptionDate.setUTCHours(12, 0, 0, 0);
    const updatedEvents = [...recurringEvents];
    updatedEvents[eventIndex].exceptions.push(exceptionDate);
    setRecurringEvents(updatedEvents);
  };
  
  const handleRemoveException = (eventIndex: number, exceptionIndex: number) => {
    const updatedEvents = [...recurringEvents];
    updatedEvents[eventIndex].exceptions = updatedEvents[eventIndex].exceptions.filter((_, i) => i !== exceptionIndex);
    setRecurringEvents(updatedEvents);
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
        <div className="fixed inset-0 bg-black backdrop-blur bg-opacity-50 flex items-center justify-center">
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
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold text-white">{clubInfo.name == "" ? 'Enter Club Name Here' : clubInfo.name}</h1>
          <div className='space-x-4'>
            <button
              onClick={isEditing ? handleSave : handleEdit}
              className="bg-azul text-white text-sm px-4 py-2 rounded-full"
            >
              {isEditing ? <p>Render Page</p> : <p>Edit Page</p>}
            </button>
            <button
              onClick={handleUpload}
              className="bg-azul text-white text-sm px-4 py-2 rounded-full"
              disabled={isUploading}
            >
              {isUploading ? <p>Uploading...</p> : <p>Upload Page</p>}
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-red-500 text-white text-sm px-4 py-2 rounded-full"
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
                  <button onClick={() => handleRemoveTag(index)} className="ml-2 text-red-500">×</button>
                )}
              </span>
            ))}
            {isEditing && (
              <div className="flex items-center mt-2">
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
          <div className="flex-shrink-0 w-1/3 text-right">
            <p className={`text-${clubInfo.isComplete ? 'white' : 'red-500'} ${clubInfo.isComplete ? '' : 'whitespace-normal'}`}>
              {clubInfo.isComplete 
                ? 'Club information is complete!' 
                : 'Club information is incomplete, and won\'t be shown on the main page until all fields have been filled.'}
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3">
            {isEditing ? (
              <textarea
                value={clubInfo.description}
                onChange={(e) => handleChange(e, 'description')}
                className="w-full h-40 p-2 text-grey bg-gray-800 rounded mb-4"
                placeholder="Club Description"
              />
            ) : (
              <p className="text-grey mb-4">{clubInfo.description}</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-grey mb-8">
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

            <div className="mb-8">
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

            <div className="mb-8">
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
                        className="bg-gray-800 text-white p-1 rounded mr-2"
                        placeholder="Student Role"
                      />
                      <input
                        type="email"
                        value={lead.email}
                        onChange={(e) => handleStudentLeadChange(index, 'email', e.target.value)}
                        className="bg-gray-800 text-white p-1 rounded mr-2"
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

            <div className="mb-8">
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

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">More Information</h2>
              <p className="text-grey">
                For more information, please{' '}
                <Link href="/contact" className="text-azul hover:underline">
                  contact Mr. Dobson
                </Link>.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">One-off Events</h2>
              {clubInfo.oneOffEvents.map((event, index) => (
                <div key={index} className="mb-2 flex items-center">
                  <span className="text-white mr-2">
                    {event.date.toDateString()} - {event.title}
                  </span>
                  {isEditing && (
                    <button onClick={() => handleRemoveOneOffEvent(index)} className="text-red-500">
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <div className="flex items-center mt-2">
                  <input
                    type="date"
                    value={newOneOffEvent.date.toISOString().split('T')[0]}
                    onChange={(e) => handleOneOffEventChange('date', new Date(e.target.value))}
                    className="bg-gray-800 text-white p-1 rounded mr-2"
                  />
                  <input
                    type="text"
                    value={newOneOffEvent.title}
                    onChange={(e) => handleOneOffEventChange('title', e.target.value)}
                    placeholder="Event Title"
                    className="bg-gray-800 text-white p-1 rounded mr-2"
                  />
                  <button onClick={handleAddOneOffEvent} className="bg-green-500 text-white px-2 py-1 rounded">
                    Add Event
                  </button>
                </div>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Recurring Events</h2>
              {recurringEvents.map((event, index) => (
                <div key={index} className="mb-4 p-4 bg-gray-800 rounded xl:w-2/3 text-white">
                  <input
                    type="text"
                    value={event.title || ''}
                    onChange={(e) => handleRecurringEventChange(index, 'title', e.target.value)}
                    placeholder="Event Title"
                    className="bg-gray-700 text-white p-2 rounded mr-2"
                  />
                  <button
                    onClick={() => handleRemoveRecurringEvent(index)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    <FaTrash />
                  </button>
                  <div className='flex flex-row mt-4'>
                    <select
                      value={event.frequency}
                      onChange={(e) => handleRecurringEventChange(index, 'frequency', e.target.value)}
                      className="bg-gray-700 p-2 rounded mr-2"
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
                    >
                      {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => (
                        <option key={i} value={i}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div className='my-2 flex flex-row'>
                    <p className='flex items-center mx-2'>From</p>
                    <input
                      type="date"
                      value={event.startDate.toISOString().split('T')[0]}
                      onChange={(e) => handleRecurringEventChange(index, 'startDate', e.target.value)}
                      className="bg-gray-700 text-white p-2 rounded mr-2"
                    />

                    <input
                      type="date"
                      value={event.endDate.toISOString().split('T')[0]}
                      onChange={(e) => handleRecurringEventChange(index, 'endDate', e.target.value)}
                      className="bg-gray-700 text-white p-2 rounded mr-2"
                    />
                  </div>
                  <div className="mt-2">
                    <h3 className="text-xl font-bold text-white mb-2">Exceptions</h3>
                    {event.exceptions.map((exception, exceptionIndex) => (
                      <div key={exceptionIndex} className="flex items-center mb-2">
                        <span className="text-white mr-2">{exception.toDateString()}</span>
                        <button
                          onClick={() => handleRemoveException(index, exceptionIndex)}
                          className="text-red-500"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                    <input
                      type="date"
                      onChange={(e) => handleAddException(index, new Date(e.target.value))}
                      className="bg-gray-700 text-white p-2 rounded"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={handleAddRecurringEvent}
                className="bg-green-500 text-white px-2 py-1 rounded flex flex-row items-center"
              >
                <FaPlus className="mr-2" /> Add Recurring Event
              </button>
            </div>
          </div>

          <div className="md:w-1/3">
          <div className="grid grid-cols-2 gap-4">
            {clubInfo.images?.map((src: string, index: number) => (
              <div key={index} className="relative h-48">
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
              <div className="relative h-48 flex items-center justify-center border-2 border-dashed border-gray-400 rounded-lg">
                <input
                  type="file"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <FaPlus className="text-gray-400" />
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

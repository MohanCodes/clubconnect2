"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { FaEnvelope, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUserGraduate, FaDollarSign, FaEdit, FaSave, FaPlus, FaTrash, FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaYoutube, FaDiscord, FaGithub, FaTiktok, FaGlobe, FaUser, FaLink } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import { db, storage } from '@/firebase/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface Advisor {
  name: string;
  email: string;
}

interface StudentLead {
  name: string;
  role: string;
  imgSrc: string;
}

interface ClubLink {
  url: string;
  platform: string;
}

interface ClubInfo {
  name: string;
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
}

const EditClubPage = () => {
  const params = useParams();
  const slug = params.slug;
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLink, setNewLink] = useState({ url: '', platform: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [clubInfo, setClubInfo] = useState<ClubInfo>({
    name: "",
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
  });

  const [newTag, setNewTag] = useState("");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newLeadImage, setNewLeadImage] = useState<File | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (slug) {
      const [club, school] = (slug as string).split("-");
      fetchClubInfo(club, school);
    }
  }, [slug]);

  const fetchClubInfo = async (club: string, school: string) => {
    try {
      const clubDocRef = doc(db, 'clubs', `${club}-${school}`);
      const clubDoc = await getDoc(clubDocRef);
      if (clubDoc.exists()) {
        setClubInfo(clubDoc.data() as ClubInfo);
      } else {
        const dashClubDocRef = doc(db, 'dashclubs', `${club}-${school}`);
        const dashClubDoc = await getDoc(dashClubDocRef);
        if (dashClubDoc.exists()) {
          setClubInfo(dashClubDoc.data() as ClubInfo);
        }
      }
    } catch (error) {
      console.error('Error fetching club data:', error);
    }
  };

  const handleEdit = () => setIsEditing(true);
  const handleSave = () => setIsEditing(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof ClubInfo) => {
    setClubInfo({ ...clubInfo, [field]: e.target.value });
  };

  const handleAddTag = () => {
    if (newTag && !clubInfo.tags.includes(newTag)) {
      setClubInfo({ ...clubInfo, tags: [...clubInfo.tags, newTag] });
      setNewTag("");
    }
  };

  const handleRemoveTag = (index: number) => {
    const updatedTags = clubInfo.tags.filter((_, i) => i !== index);
    setClubInfo({ ...clubInfo, tags: updatedTags });
  };

  const handleAdvisorChange = (index: number, field: keyof Advisor, value: string) => {
    const updatedAdvisors = [...clubInfo.advisors];
    updatedAdvisors[index] = { ...updatedAdvisors[index], [field]: value };
    setClubInfo({ ...clubInfo, advisors: updatedAdvisors });
  };

  const handleAddAdvisor = () => {
    setClubInfo({ ...clubInfo, advisors: [...clubInfo.advisors, { name: "", email: "" }] });
  };

  const handleRemoveAdvisor = (index: number) => {
    const updatedAdvisors = clubInfo.advisors.filter((_, i) => i !== index);
    setClubInfo({ ...clubInfo, advisors: updatedAdvisors });
  };

  const handleStudentLeadChange = (index: number, field: keyof StudentLead, value: string) => {
    const updatedLeads = [...clubInfo.studentLeads];
    updatedLeads[index] = { ...updatedLeads[index], [field]: value };
    setClubInfo({ ...clubInfo, studentLeads: updatedLeads });
  };

  const handleAddStudentLead = () => {
    setClubInfo({ ...clubInfo, studentLeads: [...clubInfo.studentLeads, { name: "", role: "", imgSrc: "https://via.placeholder.com/50" }] });
  };

  const handleRemoveStudentLead = (index: number) => {
    const updatedLeads = clubInfo.studentLeads.filter((_, i) => i !== index);
    setClubInfo({ ...clubInfo, studentLeads: updatedLeads });
  };

  const handleAddLink = () => {
    if (newLink.url && newLink.platform) {
      setClubInfo({ ...clubInfo, links: [...clubInfo.links, newLink] });
      setNewLink({ url: '', platform: '' });
      setIsModalOpen(false);
    }
  };

  const handleRemoveLink = (index: number) => {
    const updatedLinks = clubInfo.links.filter((_, i) => i !== index);
    setClubInfo({ ...clubInfo, links: updatedLinks });
  };

  const handleImageUpload = async (file: File) => {
    const storageRef = ref(storage, `clubImages/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  };

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      if (newImage) {
        const imageUrl = await handleImageUpload(newImage);
        setClubInfo({ ...clubInfo, images: [...clubInfo.images, imageUrl] });
      }

      if (newLeadImage) {
        const leadImageUrl = await handleImageUpload(newLeadImage);
        const updatedLeads = clubInfo.studentLeads.map((lead, index) => {
          if (index === clubInfo.studentLeads.length - 1) {
            return { ...lead, imgSrc: leadImageUrl };
          }
          return lead;
        });
        setClubInfo({ ...clubInfo, studentLeads: updatedLeads });
      }

      const clubDocRef = doc(db, 'clubs', clubInfo.name);
      await setDoc(clubDocRef, clubInfo);
      console.log('Club data uploaded successfully');
    } catch (error) {
      console.error('Error uploading club data:', error);
    } finally {
      setIsUploading(false);
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

  return (
    <div className="bg-cblack min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          {isEditing ? (
            <input
              type="text"
              value={clubInfo.name}
              onChange={(e) => handleChange(e, 'name')}
              className="text-4xl font-bold text-white bg-transparent border-b border-azul"
            />
          ) : (
            <h1 className="text-4xl font-bold text-white">{clubInfo.name}</h1>
          )}
        <div className='space-x-4'>
          <button
            onClick={isEditing ? handleSave : handleEdit}
            className="bg-azul text-white text-sm px-4 py-2 rounded-full"
          >
            {isEditing ? <p>Save Page</p> :<p>Edit Page</p>}
          </button>
          <button
            onClick={handleUpload}
            className="bg-azul text-white text-sm px-4 py-2 rounded-full"
            disabled={isUploading}
          >
            {isUploading ? <p>Uploading...</p> : <p>Upload Page</p>}
          </button>
        </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {clubInfo.tags.map((tag, index) => (
            <span key={index} className="bg-blue-100 text-azul text-sm font-medium px-3 py-1 rounded-full">
              {tag}
              {isEditing && (
                <button onClick={() => handleRemoveTag(index)} className="ml-2 text-red-500">×</button>
              )}
            </span>
          ))}
          {isEditing && (
            <div className="flex items-center">
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

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3">
            {isEditing ? (
              <textarea
                value={clubInfo.description}
                onChange={(e) => handleChange(e, 'description')}
                className="w-full h-40 p-2 text-grey bg-gray-800 rounded mb-4"
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
                  />
                ) : (
                  <span>{clubInfo.costs}</span>
                )}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Advisors</h2>
              {clubInfo.advisors.map((advisor, index) => (
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
              {clubInfo.studentLeads.map((lead, index) => (
                <div key={index} className="flex items-center mb-2">
                  <Image
                    src={lead.imgSrc}
                    alt={`${lead.name}'s profile`}
                    width={50}
                    height={50}
                    className="rounded-full mr-3"
                  />
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={lead.name}
                        onChange={(e) => handleStudentLeadChange(index, 'name', e.target.value)}
                        placeholder='Student Name'
                        className="bg-gray-800 text-white p-1 rounded mr-2"
                        />
                        <input
                          type="file"
                          onChange={(e) => setNewLeadImage(e.target.files ? e.target.files[0] : null)}
                          className="mb-2"
                        />
                        <button
                          onClick={async () => {
                            if (newLeadImage) {
                              const leadImageUrl = await handleImageUpload(newLeadImage);
                              const updatedLeads = clubInfo.studentLeads.map((lead, i) => {
                                if (i === index) {
                                  return { ...lead, imgSrc: leadImageUrl };
                                }
                                return lead;
                              });
                              setClubInfo({ ...clubInfo, studentLeads: updatedLeads });
                            }
                          }}
                          className="bg-green-500 text-white px-2 py-1 rounded"
                        >
                          Upload Image
                        </button>
                        <button onClick={() => handleRemoveStudentLead(index)} className="text-red-500 ml-2">
                          <FaTrash />
                        </button>
                    </>
                  ) : (
                    <span className="text-grey">{lead.name} - {lead.role}</span>
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
              {clubInfo.links.map((link, index) => (
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

            <div className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-2">More Information</h2>
              <p className="text-grey">
                For more information, please{' '}
                <Link href="/contact" className="text-azul hover:underline">
                  contact Mr. Dobson
                </Link>.
              </p>
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
                  {isEditing && (
                    <button onClick={() => {
                      const updatedImages = clubInfo.images.filter((_, i) => i !== index);
                      setClubInfo({ ...clubInfo, images: updatedImages });
                    }} className="absolute top-2 right-2 text-red-500">
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
              {isEditing && (
                <div className="flex flex-col items-center">
                  <input
                    type="file"
                    onChange={(e) => setNewImage(e.target.files ? e.target.files[0] : null)}
                    className="mb-2"
                  />
                  <button
                    onClick={async () => {
                      if (newImage) {
                        const imageUrl = await handleImageUpload(newImage);
                        setClubInfo({ ...clubInfo, images: [...clubInfo.images, imageUrl] });
                      }
                    }}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Upload Image
                  </button>
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

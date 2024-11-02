"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FaEnvelope, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUserGraduate, FaDollarSign, FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaYoutube, FaDiscord, FaGithub, FaTiktok, FaGlobe, FaUser, FaLink, FaCircleNotch } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import { db } from '@/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ClubNotFound from '@/components/ClubNotFound';

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

interface ClubInfo {
  id: string;
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
}

const ClubPage = () => {
  const params = useParams();
  const slug = params.slug;
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClubInfo = async () => {
      setIsLoading(true);
      try {
        if (typeof slug === 'string') {
          const clubDocRef = doc(db, 'clubs', slug);
          const clubDoc = await getDoc(clubDocRef);
          
          if (clubDoc.exists()) {
            const clubData = clubDoc.data();
            
            // Check if the club document has isComplete set to true
            if (clubData.isComplete === true) {
              setClubInfo(clubData as ClubInfo);
            } else {
              console.log('Club data is not complete');
              // You might want to set some state here to indicate incomplete data
              // For example: setIsIncomplete(true);
            }
          } else {
            console.error('Club not found');
          }
        } else {
          console.error('Invalid slug');
        }
      } catch (error) {
        console.error('Error fetching club data:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchClubInfo();
  }, [slug]);

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

  if (isLoading) {
    return (
    <div className="fixed inset-0 bg-cblack flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg flex flex-col items-center">
        <FaCircleNotch className="animate-spin h-16 w-16 text-azul" />
        <p className="mt-4 text-azul font-semibold">Loading club data...</p>
      </div>
    </div>
    );
  }

  if (!clubInfo) {
    return (
    <div>
      <Navbar />
      <ClubNotFound />
    </div>
  );
  }

  return (
    <div className="bg-cblack min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold text-white">{clubInfo.name}</h1>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {(clubInfo.tags || []).map((tag, index) => (
            <span key={index} className="inline-block bg-blue-100 text-azul text-sm font-medium px-3 py-1 rounded-full mr-2 mb-2">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3">
            <p className="text-grey mb-4">{clubInfo.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-grey mb-8">
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2 text-azul" />
                <span>{clubInfo.length}</span>
              </div>
              <div className="flex items-center">
                <FaClock className="mr-2 text-azul" />
                <span>{clubInfo.meetingTimes}</span>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-2 text-azul" />
                <span>{clubInfo.meetingSite}</span>
              </div>
              <div className="flex items-center">
                <FaUserGraduate className="mr-2 text-azul" />
                <span>{clubInfo.eligibility}</span>
              </div>
              <div className="flex items-center">
                <FaDollarSign className="mr-2 text-azul" />
                <span>{clubInfo.costs}</span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Advisors</h2>
              {(clubInfo.advisors || []).map((advisor, index) => (
                <div key={index} className="mb-2">
                  <p className="text-grey">{advisor.name}</p>
                  <Link href={`mailto:${advisor.email}`} className="text-azul hover:underline">
                    <span className="flex items-center">
                      <FaEnvelope className="mr-2" />
                      {advisor.email}
                    </span>
                  </Link>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Student Leads</h2>
              {(clubInfo.studentLeads || []).map((lead, index) => (
                <div key={index} className="mb-2">
                  <p className="text-grey">{lead.name} - {lead.role}</p>
                  <Link href={`mailto:${lead.email}`} className="text-azul hover:underline">
                    <span className="flex items-center">
                      <FaEnvelope className="mr-2" />
                      {lead.email}
                    </span>
                  </Link>
                </div>
              ))}
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Links</h2>
              {(clubInfo.links || []).map((link, index) => (
                <div key={index} className="flex items-center mb-2">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-azul hover:underline flex items-center">
                    {getPlatformIcon(link.platform)}
                    <span className="ml-2">{link.platform}</span>
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-2">More Information</h2>
              <p className="text-grey">
                For more information, please{' '}
                <Link href="mailto:help@clubconnect.xyz" className="text-azul hover:underline">
                  contact ClubConnect for help
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
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClubPage;

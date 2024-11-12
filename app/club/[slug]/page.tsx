"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FaEnvelope, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUserGraduate, FaDollarSign, FaTwitter, FaInstagram, FaFacebook, FaLinkedin, FaYoutube, FaDiscord, FaGithub, FaTiktok, FaGlobe, FaUser, FaLink, FaCircleNotch, FaCopy } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import { db } from '@/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ClubNotFound from '@/components/ClubNotFound';
import { parseISO, isAfter, format } from 'date-fns';

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
  id: string;
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

type Day = 0 | 1 | 2 | 3 | 4 | 5 | 6;

type NextMeetingDateResult = string; // The function returns a date string or an error message.

function getNextMeetingDate(event: RecurringEvent): NextMeetingDateResult {
  const today = new Date();
  const startDate = parseISO(event.startDate);
  const endDate = parseISO(event.endDate);
  
  // Check if today is past the end date
  if (isAfter(today, endDate)) {
    return "The event has ended.";
  }

  let nextMeeting: Date;
  
  // Function to check if a date is an exception
  const isException = (date: Date): boolean => {
    return event.exceptions.includes(format(date, 'yyyy-MM-dd'));
  };

  // Calculate next meeting based on frequency
  let increment = event.frequency === 'weekly' ? 7 : (event.frequency === 'biweekly' ? 14 : null);

  // Start checking from today or from start date, whichever is later
  let checkDate = new Date(Math.max(today.getTime(), startDate.getTime()));

  while (true) {
    // Set checkDate to the next occurrence of the specified dayOfWeek
    checkDate.setDate(checkDate.getDate() + ((event.dayOfWeek + 7 - checkDate.getDay()) % 7));

    // If frequency is monthly, adjust for month increment
    if (event.frequency === 'monthly') {
      checkDate.setMonth(checkDate.getMonth() + 1);
      checkDate.setDate(event.dayOfWeek); // Set to specific day of month
    }

    // Check if this date is within range and not an exception
    if (!isException(checkDate) && !isAfter(checkDate, endDate)) {
      nextMeeting = checkDate;
      return format(nextMeeting, 'yyyy-MM-dd'); // Return the formatted next meeting date.
    }

    // If it's an exception or past end date, continue checking further dates
    checkDate.setDate(checkDate.getDate() + (increment || 0));
    
    // If we exceed end date without finding a valid meeting, break
    if (isAfter(checkDate, endDate)) {
      return "No more meetings scheduled.";
    }
  }
}

const ClubPage = () => {
  const [isLoading, setIsLoading] = useState(true);
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

  const params = useParams();
  const slug = params.slug;

  const fetchClubInfo = useCallback(async () => {
    setIsLoading(true);
    try {
        if (typeof slug !== 'string') {
            console.error('Invalid slug');
            return;
        }
        const clubDocRef = doc(db, 'clubs', slug);
        const clubSnapshot = await getDoc(clubDocRef);
        
        if (clubSnapshot.exists()) {
            const clubData = clubSnapshot.data() as ClubInfo;

            // Check if clubData is complete
            if (!clubData.isComplete) {
                console.log('Club data is incomplete');
                return; // Exit if the data is incomplete
            }

            // Proceed to fetch blogs only if club data is complete
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

            // Set the complete club info
            setClubInfo(clubData);
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
    fetchClubInfo();
  }, [fetchClubInfo]);

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

  if (clubInfo && !clubInfo.isComplete) {
    return (
      <div>
        <Navbar />
        {isLoading && (
          <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg flex flex-col items-center">
              <FaCircleNotch className="animate-spin h-16 w-16 text-azul" />
              <p className="mt-4 text-azul font-semibold">Loading club data...</p>
            </div>
          </div>
        )}
        <div className="-mt-20">
          <ClubNotFound />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cblack min-h-screen">
      <Navbar />
      <main className="container mx-auto px-8 pt-4 pb-8">
      {isLoading && (
        <div className="fixed inset-0 bg-black backdrop-blur bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex flex-col items-center">
            <FaCircleNotch className="animate-spin h-16 w-16 text-azul" />
            <p className="mt-4 text-azul font-semibold">Loading club data...</p>
          </div>
        </div>
      )}
        <div className="flex flex-row items-center justify-between bg-cblack break-words -mr-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 text-wrap pr-10">{clubInfo.name == "" ? 'Enter Club Name Here' : clubInfo.name}</h1>
          <button 
              className="bg-azul text-white text-xs sm:text-sm px-3 sm:px-4 py-2 rounded-full"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                  .then(() => {
                    alert('Link copied to clipboard!');
                  })
                  .catch(err => {
                    console.error('Failed to copy link: ', err);
                  });
              }}
            >
              <FaCopy />
            </button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <div className="flex-grow">
            {(clubInfo.tags || []).map((tag, index) => (
              <span key={index} className="inline-block bg-blue-100 text-azul text-xs sm:text-sm font-medium px-3 py-1 rounded-full mr-2 mb-2">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-20 grid lg:grid-cols-2">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Description</h2>
            <p className="text-grey mb-4 text-wrap text-md lg:text-base">
              {clubInfo.description}
            </p>
          </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-grey text-md">
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

            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Advisors</h2>
              {(clubInfo.advisors || []).map((advisor, index) => (
                <div key={index} className="mb-2">
                  <p className="text-grey">{advisor.name}</p>
                    <Link href={`mailto:${advisor.email}`} className="text-azul hover:underline">
                    <span className="flex items-center">
                        <FaEnvelope className="mr-2" />
                        <span className=''>{advisor.email}</span>
                    </span>
                    </Link>
                </div>
              ))}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Student Leads</h2>
              {(clubInfo.studentLeads || []).map((lead, index) => (
                <div key={index} className="mb-2">
                  <p className="text-grey">{lead.name} - {lead.role}</p>
                    <Link href={`mailto:${lead.email}`} className="text-azul hover:underline">
                    <span className="flex items-center">
                        <FaEnvelope className="mr-2" />
                        <span className=''>{lead.email}</span>
                    </span>
                    </Link>
                </div>
              ))}
            </div>

            <div>
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

            <div>
              <h2 className="text-2xl font-bold text-white mb-2">One-off Events</h2>
              {clubInfo.oneOffEvents && clubInfo.oneOffEvents.length > 0 ? (
                    clubInfo.oneOffEvents.map((event, index) => (
                      <div key={index} className="mb-4 flex items-center bg-gray-800 p-4 rounded-lg shadow-md lg:w-5/6">
                        <FaCalendarAlt className="text-blue-400 mr-4" />
                        <span className="text-white">
                          {format(parseISO(event.date), 'MMMM dd, yyyy')} - {event.title}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-300">No one-off events are scheduled at this time.</p>
                  )}
            </div>

            <div>
              <h3 className="text-2xl font-semibold text-white mb-3">Recurring Events</h3>
                  {(clubInfo.recurringEvents || []).length > 0 ? (
                    clubInfo.recurringEvents.map((event, index) => {
                      const nextMeeting = getNextMeetingDate(event);
                      return (
                        <div key={index} className="mb-6 p-6 bg-gray-800 rounded-lg shadow-md text-white lg:w-5/6">
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
                            It runs from {format(parseISO(event.startDate), 'MMMM dd, yyyy')} to{' '}
                            {format(parseISO(event.endDate), 'MMMM dd, yyyy')}.
                          </p>
                          
                          <p className="mt-2 font-semibold text-blue-400">
                          Next meeting: {nextMeeting ? format(parseISO(nextMeeting), 'MMMM dd, yyyy') : 'No upcoming meeting'}
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

                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-white mb-2">More Information</h2>
                    <p className="text-grey">
                        For more information, please{' '}
                        <Link href="mailto:hello@mnclubconnect.com" className="text-azul hover:underline">
                        contact ClubConnect.
                        </Link>
                    </p>
                </div>
            </div>
          </div>

          <div className="space-y-10">
          {clubInfo.images && clubInfo.images.length > 0 && (
            <>
                <h2 className="text-2xl font-bold text-white -mb-8">Images</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    {clubInfo.images.map((src: string, index: number) => (
                    <div key={index} className="relative h-64">
                        <Image
                        src={src}
                        alt={`Club activity ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg"
                        priority
                        />
                    </div>
                    ))}
                </div>
            </>
            )}
          <div>
            {clubInfo.blogIds && clubInfo.blogIds.length > 0 && (
            <h2 className="text-2xl font-bold text-white mb-2">Blogs</h2>
            )}
            <div className="flex flex-col lg:flex-row gap-8">
              {blogs.map((blog) => (
                <div key={blog.id} className="rounded-lg p-9 transition-shadow duration-300 bg-[#2A2A2A]">
                  <Link href={`/blog/${blog.id}`} passHref>
                    <div className='flex flex-row justify-between'>
                      <h3 className="text-lg text-white font-bold">{blog.title}</h3>
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
                  </Link>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      </main>
    </div>
  );

};

export default ClubPage;

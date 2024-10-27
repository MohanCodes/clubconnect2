"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaEnvelope, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUserGraduate, FaDollarSign, FaTwitter, FaGithub, FaLinkedin, FaDiscord } from 'react-icons/fa';
import Navbar from '@/components/Navbar';

const BiologyClubPage: React.FC = () => {
  const clubImages = [
    "https://images.pexels.com/photos/256262/pexels-photo-256262.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/356040/pexels-photo-356040.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    "https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  ];

  const studentLeads = [
    { name: "Jane Doe", role: "President", imgSrc: "https://via.placeholder.com/50" },
    { name: "John Smith", role: "Vice President", imgSrc: "https://via.placeholder.com/50" },
    { name: "Emily Brown", role: "Secretary", imgSrc: "https://via.placeholder.com/50" },
    { name: "Michael Johnson", role: "Treasurer", imgSrc: "https://via.placeholder.com/50" },
  ];

  return (
    <div className="bg-cblack min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-white mb-6">Biology Club</h1>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-2/3">
            <p className="text-grey mb-6">
              Bio Club is a student-driven organization that explores various topics in biology. 
              Students are encouraged to participate in several biological academic contests but this is not a requirement. 
              Each meeting will cover a topic that is of interest to the club members, with background, discussion and a lab led by one of their fellow club members. 
              No experience in biology is needed, only a desire to learn about the life around us.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-grey">
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2 text-azul" />
                <span>Length: Academic school year</span>
              </div>
              <div className="flex items-center">
                <FaClock className="mr-2 text-azul" />
                <span>Meeting times: Most Mondays</span>
              </div>
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-2 text-azul" />
                <span>Meeting site: A403</span>
              </div>
              <div className="flex items-center">
                <FaUserGraduate className="mr-2 text-azul" />
                <span>Eligibility: Grades 9-12</span>
              </div>
              <div className="flex items-center">
                <FaDollarSign className="mr-2 text-azul" />
                <span>Costs: Participation fee</span>
              </div>
            </div>

            <div className="mt-8 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Advisor</h2>
                <p className="text-grey">Dan Dobson</p>
                <Link href="mailto:Dan.Dobson@wayzataschools.org" className="text-azul hover:underline">
                  <span className="flex items-center">
                    <FaEnvelope className="mr-2" />
                    Dan.Dobson@wayzataschools.org
                  </span>
                </Link>
              </div>
              <div className="flex space-x-4">
                <a href="https://twitter.com/devclub" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                  <FaTwitter size={24} className="text-azul" />
                </a>
                <a href="https://github.com/devclub" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <FaGithub size={24} className="text-azul" />
                </a>
                <a href="https://linkedin.com/company/devclub" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <FaLinkedin size={24} className="text-azul" />
                </a>
                <a href="https://discord.com/invite/devclub" target="_blank" rel="noopener noreferrer" aria-label="Discord">
                  <FaDiscord size={24} className="text-azul" />
                </a>
              </div>
            </div>

            {/* Student Leads Section */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-2">Student Leads</h2>
              <ul className="list-disc list-inside text-grey">
                {studentLeads.map((lead, index) => (
                  <li key={index} className="flex items-center mb-2">
                    {/* Profile Picture */}
                    <Image
                      src={"https://images.pexels.com/photos/3825527/pexels-photo-3825527.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"}
                      alt={`${lead.name}'s profile`}
                      width={50}
                      height={50}
                      className="rounded-full mr-3"
                    />
                    {/* Name and Role */}
                    <span>{lead.name} - {lead.role}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* More Information Section */}
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

          {/* Image Gallery */}
          <div className="md:w-1/3">
            <div className="grid grid-cols-2 gap-4">
              {clubImages.map((src, index) => (
                <div key={index} className="relative h-48">
                  <Image
                    src={src}
                    alt={`Biology Club activity ${index + 1}`}
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

export default BiologyClubPage;
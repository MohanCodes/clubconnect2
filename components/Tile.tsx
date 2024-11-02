import Link from 'next/link';
import Image from 'next/image'
import React from 'react';
import {
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaLinkedin,
  FaYoutube,
  FaGithub,
  FaDiscord,
  FaTiktok,
  FaLink
} from 'react-icons/fa'; // Import additional icons

interface TileProps {
  icon: string;
  clubName: string;
  description: string;
  tags: string[];
  links: { platform: string; url: string; }[];
}

const Tile: React.FC<TileProps> = ({ icon, clubName, description, tags, links }) => {
  // Function to render the correct icon based on the platform name
  const renderIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return <FaTwitter className="text-azul w-5 h-5" />;
      case 'instagram':
        return <FaInstagram className="text-azul w-5 h-5" />;
      case 'facebook':
        return <FaFacebook className="text-azul w-5 h-5" />;
      case 'linkedin':
        return <FaLinkedin className="text-azul w-5 h-5" />;
      case 'youtube':
        return <FaYoutube className="text-azul w-5 h-5" />;
      case 'github':
        return <FaGithub className="text-azul w-5 h-5" />;
      case 'discord':
        return <FaDiscord className="text-azul w-5 h-5" />;
      case 'tiktok':
        return <FaTiktok className="text-azul w-5 h-5" />;
      case 'website':
      case 'personal':
      case 'link': // Add a general link icon for personal websites
        return <FaLink className="text-azul w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="rounded-lg p-9 transition-shadow duration-300 bg-[#2A2A2A]">
      {/* Icon and Club Name */}
      <div className="flex items-center mb-4">
        <Image src={icon} alt="Club Icon" width={40} height={40} className="mr-4" />
        <h2 className="text-2xl font-semibold text-white">{clubName}</h2>
      </div>

      {/* Club Description */}
      <p className="text-grey mb-4 text-left">
        {description.length > 150 ? `${description.slice(0, 150)}...` : description}
      </p>

      {/* Horizontal Line */}
      <hr className="border-t border-gray-600 mb-4" />

      {/* Bottom section with tags and links */}
      <div className="grid grid-cols-[1fr,auto] gap-4 items-start">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span key={index} className="bg-blue-100 text-azul text-sm font-medium px-3 py-1 rounded-full break-words">
              {tag}
            </span>
          ))}
        </div>

        {/* Links - Only show the first three */}
        <div className="flex flex-row gap-4 self-center">
          {links.slice(0, 3).map((link, index) => (
            <span
              key={index}
              className="flex items-center text-azul hover:text-blue-300"
            >
              {renderIcon(link.platform)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tile;

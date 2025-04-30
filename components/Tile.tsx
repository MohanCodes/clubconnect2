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
  FaLink,
  FaStar,
  FaRegStar,
  FaCheckCircle,
  FaUser,
  FaGlobe,
  FaDollarSign
} from 'react-icons/fa';

interface TileProps {
  icon?: string;
  clubName: string;
  description?: string;
  tags: string[];
  links: { platform: string; url: string }[];
  upvoteCount: number;
  isUpvoted: boolean;
  onUpvoteClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isUpvoteLoading: boolean;
  showVoteButton: boolean; // New prop added here
  isVerified?: boolean; // Add optional isVerified prop
}

const schoolColors: { [key: string]: { bg: string; text: string } } = {
    'wayzata': { bg: 'bg-yellow-400', text: 'text-blue-500' },
    'minnetonka': { bg: 'bg-blue-600', text: 'text-white' },
    'edina': { bg: 'bg-green-700', text: 'text-white' },
    'hopkins': { bg: 'bg-gray-200', text: 'text-blue-500' },
    'st-louis-park': { bg: 'bg-orange-500', text: 'text-black' },
    'osseo': { bg: 'bg-orange-600', text: 'text-white' },
    'robbinsdale': { bg: 'bg-cyan-600', text: 'text-white' },
    'anoka-hennepin': { bg: 'bg-blue-900', text: 'text-white' },
  };

const Tile: React.FC<TileProps> = ({ 
  icon, 
  clubName, 
  description, 
  tags, 
  links, 
  upvoteCount, 
  isUpvoted,
  onUpvoteClick,
  isUpvoteLoading,
  showVoteButton,
  isVerified, // Add isVerified prop
}) => {
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
        return <FaGlobe className="text-azul w-5 h-5" />;
      case 'personal':
        return <FaUser className="text-azul w-5 h-5" />;
      case 'epay':
        return <FaDollarSign className="text-azul w-5 h-5" />;
      case 'link':
        return <FaLink className="text-azul w-5 h-5" />;
      default:
        return <FaLink className="text-azul w-5 h-5" />;
    }
  };

  const getSchoolTag = (tags: string[]) => {
    return tags.find(tag => Object.keys(schoolColors).some(school => tag.toLowerCase().includes(school)));
  };

  const schoolTag = getSchoolTag(tags);
  const schoolStyle = schoolTag ? schoolColors[Object.keys(schoolColors).find(school => schoolTag.toLowerCase().includes(school)) || ''] : null;

  const sortedTags = [...tags].sort((a, b) => {
    if (a === schoolTag) return -1;
    if (b === schoolTag) return 1;
    return 0;
  });

  return (
    <div className="rounded-xl p-8 transition-shadow duration-300 bg-[#2A2A2A] relative">
        <div className="absolute top-8 right-0 flex items-center">
          <div className="flex items-center">
            {showVoteButton && ( // Check if showVoteButton is true
              <div>
                <button
                  onClick={onUpvoteClick}
                  className={`flex items-center ${isUpvoted ? 'text-azul' : 'text-gray-500'} hover:text-blue-500 transition-colors duration-300`}
                  disabled={isUpvoteLoading}
                >
                  {isUpvoteLoading ? (
                    <FaStar className="animate-spin w-5 h-5" />
                  ) : isUpvoted ? (
                    <FaStar className="w-5 h-5" />     
                  ) : (
                    <FaRegStar className="w-5 h-5" />
                  )}
                </button>
              </div>
            )}
          </div>
          <div className="w-10 text-right">
            <span className="text-white hidden">{upvoteCount > 0 ? upvoteCount : ''}</span>
          </div>
        </div>
      {/* Icon and Club Name */}
      <div className="flex items-center mb-4 mr-6 space-x-4">
        {icon && (
          <Image 
            src={icon} 
            alt="Club Icon" 
            width={12} 
            height={12} 
            className="w-12 h-12"
          />
        )}
        <h2 className="text-xl font-semibold text-white text-left pr-6">
          {clubName}
        </h2>
      </div>

      {description && (
        <p className="text-md text-grey mb-4 text-left line-clamp-4">
          {description.length > 150 ? `${description.slice(0, 150)}...` : description}
        </p>
      )}
      <div className="flex items-center gap-4 mt-4">
        {links && links.length > 0 ? (
          <>
            {/* Left HR */}
            <hr className="flex-grow border-t border-gray-600" />

            {/* Social Media Links */}
            <div className="flex gap-4 justify-center">
              {links.slice(0, isVerified ? 3 : 4).map((link, index) => (
                <Link
                  key={index}
                  href={link.url}
                  className="flex items-center text-azul hover:text-blue-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {renderIcon(link.platform)}
                </Link>
              ))}
              {isVerified && <FaCheckCircle className="text-green-500 w-5 h-5" />}
            </div>

            {/* Right HR */}
            <hr className="flex-grow border-t border-gray-600" />
          </>
        ) : (
          <hr className="flex-grow border-t border-gray-600" />
        )}
      </div>

      {/* Bottom section with tags and links */}
      <div className={`${tags.length > 0 ? 'mb-6' : ''}`} />
      <div className="grid grid-cols-[1fr,auto] gap-4 items-start">
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {sortedTags.map((tag, index) => (
            <span 
              key={index} 
              className={`text-xs md:text-sm font-medium px-3 py-1 rounded-full break-words ${
                tag === schoolTag && schoolStyle
                  ? `${schoolStyle.bg} ${schoolStyle.text}`
                  : "bg-blue-100 text-azul"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

      </div>      
    </div>
  );
};

export default Tile;

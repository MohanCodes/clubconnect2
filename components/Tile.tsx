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
  FaThumbsUp,
  FaSpinner
} from 'react-icons/fa';

interface TileProps {
  icon: string;
  clubName: string;
  description: string;
  tags: string[];
  links: { platform: string; url: string }[];
  upvoteCount: number;
  isUpvoted: boolean;
  onUpvoteClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  isUpvoteLoading: boolean;
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
  isUpvoteLoading
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
      case 'personal':
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
    <div className="rounded-lg p-9 transition-shadow duration-300 bg-[#2A2A2A] relative">
      {/* Upvote Section - Moved to top right */}
      <div className="absolute top-10 right-0 flex items-center">
        <div className="flex items-center">
          <button
            onClick={onUpvoteClick}
            className={`flex items-center ${isUpvoted ? 'text-blue-500' : 'text-gray-500'} hover:text-blue-500 transition-colors duration-300`}
            disabled={isUpvoteLoading}
          >
            {isUpvoteLoading ? (
              <FaSpinner className="animate-spin w-5 h-5" />
            ) : (
              <FaThumbsUp className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="w-10 text-right">
          <span className="text-white hidden">{upvoteCount > 0 ? upvoteCount : ''}</span>
        </div>
      </div>

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
          {sortedTags.map((tag, index) => (
            <span 
              key={index} 
              className={`text-sm font-medium px-3 py-1 rounded-full break-words ${
                tag === schoolTag && schoolStyle
                  ? `${schoolStyle.bg} ${schoolStyle.text}`
                  : "bg-blue-100 text-azul"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Links - Only show the first three */}
        <div className="flex flex-row gap-4 self-center">
          {links.slice(0, 3).map((link, index) => (
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
        </div>
      </div>      
    </div>
  );
};

export default Tile;

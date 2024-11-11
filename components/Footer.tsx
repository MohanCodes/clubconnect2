import React from 'react';
import { FaInstagram } from 'react-icons/fa';

const Footer: React.FC = () => {

  const socialLinks = [
    { href: 'https://instagram.com/mnclubconnect', icon: <FaInstagram size={24} /> },
  ];

  return (
    <footer className="bg-cblack text-white py-8 -mt-1">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          <div className="flex space-x-4 mb-4">
            {socialLinks.map((social) => (
              <a
                key={social.href}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-azul"
              >
                {social.icon}
              </a>
            ))}
          </div>
          <p className="text-center text-sm">© {new Date().getFullYear()} MNClubConnect. All rights reserved.</p>
          <p className="text-center text-sm mb-2">Made with 💙 by Mohan</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-cblack text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex space-x-4">
            <Link href="/" className="hover:text-azul">Home</Link>
            <Link href="/about" className="hover:text-azul">About</Link>
            <Link href="/blog" className="hover:text-azul">Blog</Link>
            <Link href="/dashboard" className="hover:text-azul">Dashboard</Link>
            <Link href="/signin" className="hover:text-azul">Sign In</Link>
            <Link href="/signup" className="hover:text-azul">Sign Up</Link>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-grey">&copy; {new Date().getFullYear()} MNClubConnect. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

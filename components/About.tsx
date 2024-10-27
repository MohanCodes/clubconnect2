import Image from 'next/image';
import Navbar from '@/components/Navbar'

const AboutPage: React.FC = () => {
  return (
    <div className="bg-cblack text-white">
      <Navbar />
      <main className="relative flex min-h-screen flex-col items-center justify-center p-6">
        <h1 className="text-4xl font-bold mb-6 text-center">
          About Club<span className="text-azul">Connect</span>
        </h1>
        
        <section className="mb-8 max-w-2xl text-center">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-lg text-gray-300">
            At ClubConnect, we aim to foster a vibrant community for students in the west metro. Our platform serves as a hub where students can discover, connect, and engage with various clubs that share their interests and passions.
          </p>
        </section>

        <section className="mb-8 max-w-2xl text-center">
          <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
          <p className="text-lg text-gray-300">
            We provide a comprehensive database of clubs, allowing students to find communities that resonate with their hobbies and aspirations. From photography to technology, we support a diverse range of interests.
          </p>
        </section>

        <section className="max-w-2xl text-center">
          <h2 className="text-2xl font-semibold mb-4">Join Us</h2>
          <p className="text-lg text-gray-300">
            Whether you're looking to make new friends, develop new skills, or just have fun, ClubConnect is here for you. Join us today and be part of something great!
          </p>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;

import dynamic from 'next/dynamic';
import Link from 'next/link';

const Navbar = dynamic(() => import('@/components/Navbar'));

export default function About() {
  return (
    <div className="bg-cblack min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className='max-w-3xl w-full'>
          <h1 className='font-semibold text-white text-5xl mb-12 text-center'>
            About Us
          </h1>
          
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-4">Our <span className='text-azul'>Mission</span></h2>
                <p className="text-grey">
                  To foster a thriving ecosystem of student clubs by providing a centralized platform for discovery, communication, and collaboration.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white mb-4">What We <span className='text-azul'>Offer</span></h2>
                <ul className="list-disc list-inside text-grey">
                  <li>Comprehensive club platform</li>
                  <li>Easy-to-use search functionality</li>
                  <li>Direct links to club social media and websites</li>
                </ul>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">How to Use <span className='text-azul'>MNClubConnect</span></h2>
              <p className="text-grey mb-6">
                Follow these steps to make the most out of MNClubConnect:
              </p>
              <ol className="list-decimal list-inside text-grey">
                <li>Use the search functionality to find clubs that match your interests.</li>
                <li>Click on a club to view its details, including meeting times, location, and contact information.</li>
                <li>Join a club by following the provided instructions or contacting the club leader.</li>
                <li>Promote your own club by creating a profile and adding it to the MNClubConnect database.</li>
                <li>Stay updated with club events and announcements through the event calendar.</li>
              </ol>
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-white mb-4">Get <span className='text-azul'>Involved</span></h2>
              <p className="text-grey mb-6">
                Whether you&apos;re looking to join a club or promote your own, MNClubConnect is here to help. Join our community today!
              </p>
              <div className="text-center">
                <Link href={`/signup`} className="px-7 py-3 rounded-full bg-azul text-white hover:opacity-70">
                  Join MNClubConnect
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

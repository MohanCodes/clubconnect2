import dynamic from 'next/dynamic';
import Link from 'next/link';
import { FaSearch, FaMobileAlt, FaCalendarAlt } from 'react-icons/fa';
const Navbar = dynamic(() => import('@/components/Navbar'));

export default function About() {
  return (
    <div className="bg-cblack min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className='max-w-4xl w-full'>
          <h1 className='font-bold text-white text-5xl mb-6 text-center'>
            About <span className='text-azul'>MNClubConnect</span>
          </h1>
          
          <p className="text-grey text-lg text-center mb-16 max-w-2xl mx-auto">
            Connecting Minnesota students with their perfect club match through our comprehensive platform.
          </p>
          
          <div className="space-y-16">
            {/* Mission & Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
                <h2 className="text-3xl font-semibold text-white mb-6">
                  Our <span className='text-azul'>Mission</span>
                </h2>
                <p className="text-grey text-lg leading-relaxed">
                  To create a thriving ecosystem where every Minnesota student can discover, 
                  connect with, and actively participate in clubs that align with their passions, 
                  interests, and academic goals.
                </p>
              </div>
              
              <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800">
                <h2 className="text-3xl font-semibold text-white mb-6">
                  Our <span className='text-azul'>Vision</span>
                </h2>
                <p className="text-grey text-lg leading-relaxed">
                  To be Minnesota&apos;s premier platform for student engagement, fostering 
                  meaningful connections and building stronger campus communities across the state.
                </p>
              </div>
            </div>

            {/* What We Offer */}
            <div>
              <h2 className="text-3xl font-semibold text-white mb-8 text-center">
                What We <span className='text-azul'>Offer</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-800 hover:border-azul/30 transition-colors">
                  <div className="text-azul text-4xl mb-4"><FaSearch /></div>
                  <h3 className="text-xl font-semibold text-white mb-3">Smart Discovery</h3>
                  <p className="text-grey">Advanced search and filtering to help you find clubs that match your interests, schedule, and location.</p>
                </div>
                
                <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-800 hover:border-azul/30 transition-colors">
                  <div className="text-azul text-4xl mb-4"><FaMobileAlt /></div>
                  <h3 className="text-xl font-semibold text-white mb-3">Direct Connections</h3>
                  <p className="text-grey">Instant access to club social media, websites, and contact information to get involved immediately.</p>
                </div>
                
                <div className="bg-gray-900/30 p-6 rounded-xl border border-gray-800 hover:border-azul/30 transition-colors">
                  <div className="text-azul text-4xl mb-4"><FaCalendarAlt /></div>
                  <h3 className="text-xl font-semibold text-white mb-3">Event Management</h3>
                  <p className="text-grey">Stay updated with club meetings, events, and activities through our integrated calendar system.</p>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gray-900/30 p-10 rounded-2xl border border-gray-800">
              <h2 className="text-3xl font-semibold text-white mb-8 text-center">
                How to Use <span className='text-azul'>MNClubConnect</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">For Students:</h3>
                  <ol className="space-y-3 text-grey">
                    <li className="flex items-start">
                      <span className="bg-azul text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5 flex-shrink-0">1</span>
                      Browse or search for clubs that match your interests and availability
                    </li>
                    <li className="flex items-start">
                      <span className="bg-azul text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5 flex-shrink-0">2</span>
                      View detailed club profiles with meeting times, locations, and requirements
                    </li>
                    <li className="flex items-start">
                      <span className="bg-azul text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5 flex-shrink-0">3</span>
                      Connect directly with club leaders or join through provided links
                    </li>
                    <li className="flex items-start">
                      <span className="bg-azul text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5 flex-shrink-0">4</span>
                      Stay engaged with upcoming events and club announcements
                    </li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">For Club Leaders:</h3>
                  <ol className="space-y-3 text-grey">
                    <li className="flex items-start">
                      <span className="bg-azul text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5 flex-shrink-0">1</span>
                      Create a comprehensive club profile showcasing your organization
                    </li>
                    <li className="flex items-start">
                      <span className="bg-azul text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5 flex-shrink-0">2</span>
                      Post events, meetings, and important announcements
                    </li>
                    <li className="flex items-start">
                      <span className="bg-azul text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5 flex-shrink-0">3</span>
                      Manage member applications and communicate with interested students
                    </li>
                    <li className="flex items-start">
                      <span className="bg-azul text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5 flex-shrink-0">4</span>
                      Track engagement and grow your club&apos;s presence on campus
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Statistics
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-white mb-12">
                Making an <span className='text-azul'>Impact</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <div className="text-3xl font-bold text-azul mb-2">500+</div>
                  <div className="text-grey">Student Clubs</div>
                </div>
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <div className="text-3xl font-bold text-azul mb-2">25+</div>
                  <div className="text-grey">MN Campuses</div>
                </div>
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <div className="text-3xl font-bold text-azul mb-2">10K+</div>
                  <div className="text-grey">Active Students</div>
                </div>
                <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-800">
                  <div className="text-3xl font-bold text-azul mb-2">95%</div>
                  <div className="text-grey">Success Rate</div>
                </div>
              </div>
            </div> */}

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-azul/20 to-azul/10 p-10 rounded-2xl border border-azul/30 text-center">
              <h2 className="text-3xl font-semibold text-white mb-4">
                Ready to Get <span className='text-azul'>Connected</span>?
              </h2>
              <p className="text-grey text-lg mb-8 max-w-2xl mx-auto">
                Whether you&apos;re looking to join your first club or expand your campus involvement, 
                MNClubConnect is here to help you find your community and make lasting connections.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" className="px-8 py-3 rounded-full bg-azul text-white font-semibold hover:bg-azul/80 transition-colors">
                  Join MNClubConnect
                </Link>
                <Link href="/" className="px-8 py-3 rounded-full border border-azul text-azul font-semibold hover:bg-azul/10 transition-colors">
                  Browse Clubs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
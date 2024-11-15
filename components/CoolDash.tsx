import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('@/components/Navbar'));
const Calendar = dynamic(() => import('@/components/Calendar'));
const Profile = dynamic(() => import('@/components/Profile'));
const YourClubs = dynamic(() => import('@/components/YourClubs'));

const CoolDash: React.FC = () => {
    return (
        <div className="bg-cblack min-h-screen">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <div className='text-5xl pb-10 font-semibold text-white'>
                    Your <span className="text-azul">Dashboard</span>
                </div>

                {/* Dashboard Summary Section */}
                <div className="bg-[#2A2A2A] rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">Dashboard Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[#3A3A3A] p-4 rounded-lg">
                            <p className="text-gray-300">Total Starred Clubs</p>
                            <p className="text-3xl font-bold text-azul">{/* Add total starred clubs count */}</p>
                        </div>
                        <div className="bg-[#3A3A3A] p-4 rounded-lg">
                            <p className="text-gray-300">Upcoming Events</p>
                            <p className="text-3xl font-bold text-azul">{/* Calculate upcoming events */}</p>
                        </div>
                        <div className="bg-[#3A3A3A] p-4 rounded-lg">
                            <p className="text-gray-300">New Notifications</p>
                            <p className="text-3xl font-bold text-azul">{/* Add notification count */}</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Section */}
                <div className="bg-[#2A2A2A] rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">Quick Actions</h2>
                    <div className="flex flex-wrap gap-4">
                        <button className="bg-azul text-white px-4 py-2 rounded-lg">Explore New Clubs</button>
                        <button className="bg-azul text-white px-4 py-2 rounded-lg">Create Event</button>
                        <button className="bg-azul text-white px-4 py-2 rounded-lg">Update Profile</button>
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-[#2A2A2A] rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">Recent Activity</h2>
                    <ul className="space-y-2">
                        {/* Map through recent activities */}
                        <li className="text-gray-300">You starred Club XYZ</li>
                        <li className="text-gray-300">New event added to Your Favorite Club</li>
                        <li className="text-gray-300">Club ABC posted a new update</li>
                    </ul>
                </div>

                {/* Upcoming Events Widget */}
                <div className="bg-[#2A2A2A] rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">Upcoming Events</h2>
                    <ul className="space-y-2">
                        {/* Map through upcoming events */}
                        <li className="text-gray-300">Club Meeting - Tomorrow at 3 PM</li>
                        <li className="text-gray-300">Workshop - Next Tuesday at 5 PM</li>
                        <li className="text-gray-300">Social Gathering - Friday at 7 PM</li>
                    </ul>
                </div>

                {/* Personalized Recommendations */}
                <div className="bg-[#2A2A2A] rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">Recommended for You</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Example recommendations without Tile component */}
                        {[{ id: '1', name: 'Club A', tags: ['tag1'], upvoteCount: 10 },
                          { id: '2', name: 'Club B', tags: ['tag1', 'tag2'], upvoteCount: 5 }].map((club) => (
                            <div key={club.id} 
                                 className="bg-[#3A3A3A] p-4 rounded-lg cursor-pointer transition-transform transform hover:scale-[1.02]">
                                <h3 className="text-xl font-semibold text-white">{club.name}</h3>
                                <p className="text-gray-300">{club.tags.join(', ')}</p>
                                <p className="text-gray-400">{club.upvoteCount} Upvotes</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* User Stats Section */}
                <div className="bg-[#2A2A2A] rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-4">Your Stats</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Clubs Joined', value: 5 },
                            { label: 'Events Attended', value: 12 },
                            { label: 'Achievements', value: 3 },
                            { label: 'Connections Made', value: 20 },
                        ].map((stat) => (
                            <div key={stat.label} className="text-center">
                                <p className="text-3xl font-bold text-azul">{stat.value}</p>
                                <p className="text-gray-300">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Existing components */}
                <Calendar />
                <Profile />
                <YourClubs />
                
                {/* Additional spacing */}
                <div className='pb-20'></div>
            </main>
        </div>
    );
};

export default CoolDash;
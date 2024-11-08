import dynamic from 'next/dynamic';
import { format, parseISO, isBefore, addDays, addWeeks, addMonths } from 'date-fns';

const Navbar = dynamic(() => import('@/components/Navbar'));
const YourClubs = dynamic(() => import('@/components/YourClubs'));
const Calendar = dynamic(() => import('@/components/Calendar'));
const Profile = dynamic(() => import('@/components/Profile'));

const Dashboard: React.FC = () => {

    return (
        <div className="bg-cblack min-h-screen">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
                <div className='text-5xl pb-10 font-semibold text-white'>
                    Your <span className="text-azul">Dashboard</span>
                </div>
                <div className="rounded-lg p-9 transition-shadow duration-300 bg-[#2A2A2A] md:w-1/2">
                    <p className="text-gray-300">
                        This is your <span className='text-white font-semibold'>dashboard!</span><br />
                        Here, you can also find your personalized club <span className='text-white font-semibold'>calendar</span>, featuring all the clubs you like and those you&apos;ve <span className='text-white font-semibold'>starred</span> for quick reference.<br/><br/>If you&apos;re a club <span className='text-white font-semibold'>owner</span>, this is also your opportunity to <span className='text-white font-semibold'>promote</span> your club by creating a dedicated <span className='text-white font-semibold'>page</span> that showcases its unique offerings and events. Stay organized and engaged with your favorite clubs all in one convenient location!
                    </p>
                </div>
                <Calendar />
                <Profile />
                <YourClubs />
                <div className='pb-20'></div>
            </main>
        </div>
    );
};

export default Dashboard;

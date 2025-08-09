import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('@/components/Navbar'));
const Calendar = dynamic(() => import('@/components/Calendar'));
const Profile = dynamic(() => import('@/components/Profile'));
const YourClubs = dynamic(() => import('@/components/YourClubs'));
const ProfileCard = dynamic(() => import('@/components/ProfileCard'));

const Dashboard: React.FC = () => {

    return (
        <div className="bg-cblack min-h-screen">
            <Navbar />
            <main className="container mx-auto px-4 py-4">
                <div className='text-5xl pb-10 font-semibold text-white'>
                    Your <span className="text-azul">Dashboard</span>
                </div>
                <ProfileCard />
                <Calendar />
                <Profile />
                <YourClubs />
                <div className='pb-20'></div>
            </main>
        </div>
    );
};

export default Dashboard;

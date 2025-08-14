import Navbar from '@/components/Navbar';
import Calendar from '@/components/Calendar';
import Profile from '@/components/Profile';
import YourClubs from '@/components/YourClubs';

const Dashboard: React.FC = () => {

    return (
        <div className="bg-cblack min-h-screen">
            <Navbar />
            <main className="container mx-auto px-4 py-4">
                <div className='text-5xl pb-10 text-white ml-4'>
                    <h1 className="font-semibold">
                        Your <span className="text-azul ">Dashboard</span>
                    </h1>
                </div>
                <Profile />
                <YourClubs />
                <Calendar />
                <div className='pb-20'></div>
            </main>
        </div>
    );
};

export default Dashboard;

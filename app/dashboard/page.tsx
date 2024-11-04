"use client";
import React from 'react';
import Navbar from '@/components/Navbar';
import YourClubs from '@/components/YourClubs';
import Calendar from '@/components/Calendar';
import Profile from '@/components/Profile';

const Dashboard: React.FC = () => {

    return (
        <main className="bg-cblack min-h-screen">
            <Navbar />
            <Profile />
            <Calendar />
            <YourClubs />
            <div className='pb-20'>

            </div>
        </main>
    );
};

export default Dashboard;

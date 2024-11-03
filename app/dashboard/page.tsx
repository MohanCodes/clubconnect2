"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import YourClubs from '@/components/YourClubs';
import Calendar from '@/components/Calendar';
import Profile from '@/components/Profile';

interface User {
    uid: string;
    displayName: string | null;
}

const Dashboard: React.FC = () => {

    return (
        <div className="bg-cblack min-h-screen">
            <Navbar />
            <Profile />
            <Calendar />
            <YourClubs />
        </div>
    );
};

export default Dashboard;

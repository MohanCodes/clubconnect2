"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface CalendarProps {
  events?: { date: Date; title: string; link: string }[];
}

const CalendarProp: React.FC<CalendarProps> = ({ events = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isWeeklyView, setIsWeeklyView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsWeeklyView(window.innerWidth < 768); // Switch to weekly view below 640px
    };

    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevPeriod = () => {
    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - (isWeeklyView ? 7 : currentDate.getDate()))));
  };

  const nextPeriod = () => {
    setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + (isWeeklyView ? 7 : (32 - currentDate.getDate())))));
  };

  const renderWeeklyView = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());
    const days = [];
  
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dayEvents = events.filter(event => event.date.toDateString() === date.toDateString());
  
      days.push(
        <div key={i} className="border border-gray-700 p-2 rounded">
          <div className="text-right text-gray-400">{date.getDate()}</div>
          <div className="text-xs text-gray-500">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]}</div>
          <div className="flex flex-col mt-1">
            {dayEvents.map((event, index) => (
              <Link key={index} href={event.link} className="text-xs text-white mt-1">
                <div className='bg-[#2A2A2A] rounded p-1 inline-block hover:underline break-words w-full'>{event.title}</div>
              </Link>
            ))}
          </div>
        </div>
      );
    }
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-1">
        {days}
      </div>
    );
  };

  const renderMonthlyView = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = events.filter(event => event.date.toDateString() === date.toDateString());

      days.push(
        <div key={day} className="h-32 border border-gray-700 p-2 rounded overflow-y-auto">
          <div className="text-right text-gray-400">{day}</div>
          <div className="flex flex-col">
            {dayEvents.map((event, index) => (
              <Link key={index} href={event.link} className="text-xs text-white mt-1">
                <div className='bg-[#2A2A2A] rounded p-2 inline-block hover:underline break-words w-full'>{event.title}</div>
              </Link>
            ))}
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-7 gap-1 font-medium mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-gray-500">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{days}</div>
      </>
    );
  };

  return (
    <div className="bg-cblack text-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevPeriod} className="text-azul hover:text-blue-400 text-lg">
          &lt; Prev
        </button>
        <h2 className="text-2xl font-semibold text-center">
          {isWeeklyView 
            ? `Week of ${currentDate.toLocaleDateString()}`
            : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
          }
        </h2>
        <button onClick={nextPeriod} className="text-azul hover:text-blue-400 text-lg">
          Next &gt;
        </button>
      </div>
      {isWeeklyView ? renderWeeklyView() : renderMonthlyView()}
    </div>
  );
};

export default CalendarProp;
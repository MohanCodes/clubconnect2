"use client";

import React, { useState } from 'react';
import Link from 'next/link'; // Import Link from Next.js

interface CalendarProps {
  events?: { date: Date; title: string; link: string }[]; // Add link property
}

const CalendarProp: React.FC<CalendarProps> = ({ events = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const renderCalendarDays = () => {
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-24"></div>);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = events.filter(event => 
        event.date.toDateString() === date.toDateString()
      );
      days.push(
        <div key={day} className="h-32 border border-gray-700 p-2 rounded">
          <div className="text-right text-gray-400">{day}</div>
          <div className="flex flex-col">
            {dayEvents.map((event, index) => (
              <Link key={index} href={event.link} className="text-xs text-azul mt-1 truncate hover:underline">
                {event.title}
              </Link>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="bg-cblack text-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevMonth} className="text-azul hover:text-blue-400">
          &lt; Prev
        </button>
        <h2 className="text-2xl font-semibold">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        <button onClick={nextMonth} className="text-azul hover:text-blue-400">
          Next &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 font-medium mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-gray-500">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>
    </div>
  );
};

export default CalendarProp;
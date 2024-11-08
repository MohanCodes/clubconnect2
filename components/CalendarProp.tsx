"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { format, addDays, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

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

  const prevPeriod = () => {
    setCurrentDate(isWeeklyView ? subDays(currentDate, 7) : subDays(currentDate, currentDate.getDate()));
  };

  const nextPeriod = () => {
    setCurrentDate(isWeeklyView ? addDays(currentDate, 7) : addDays(currentDate, 32 - currentDate.getDate()));
  };

  const renderWeeklyView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-1">
        {days.map((date, index) => {
          const dayEvents = events.filter(event => isSameDay(event.date, date));
          return (
            <div key={index} className="border border-gray-700 p-2 rounded">
              <div className="text-right text-gray-400">{format(date, 'd')}</div>
              <div className="text-xs text-gray-500">{format(date, 'EEE')}</div>
              <div className="flex flex-col mt-1">
                {dayEvents.map((event, index) => (
                  <Link key={index} href={event.link} className="text-xs text-white mt-1">
                    <div className='bg-[#2A2A2A] rounded p-1 inline-block hover:underline break-words w-full'>{event.title}</div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthlyView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <>
        <div className="grid grid-cols-7 gap-1 font-medium mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-gray-500">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            const dayEvents = events.filter(event => isSameDay(event.date, date));
            return (
              <div key={index} className="h-32 border border-gray-700 p-2 rounded overflow-y-auto">
                <div className="text-right text-gray-400">{format(date, 'd')}</div>
                <div className="flex flex-col">
                  {dayEvents.map((event, index) => (
                    <Link key={index} href={event.link} className="text-xs text-white mt-1">
                      <div className='bg-[#2A2A2A] rounded p-2 inline-block hover:underline break-words w-full'>{event.title}</div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="bg-cblack text-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <button onClick={prevPeriod} className="text-azul hover:text-blue-400 text-xl flex items-center space-x-2">
          <FaAngleLeft size={40}/> 
          <span>Prev</span>
        </button>
        <h2 className="text-2xl font-semibold text-center">
          {isWeeklyView 
            ? `Week of ${format(currentDate, 'MM/dd/yyyy')}`
            : `${format(currentDate, 'MMMM yyyy')}`
          }
        </h2>
        <button onClick={nextPeriod} className="text-azul hover:text-blue-400 text-xl flex items-center space-x-2">
          <span>Next</span>
          <FaAngleRight size={40}/> 
        </button>
      </div>
      {isWeeklyView ? renderWeeklyView() : renderMonthlyView()}
    </div>
  );
};

export default CalendarProp;

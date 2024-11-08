"use client";

import React, { useState, useEffect } from 'react';
import CalendarProp from '@/components/CalendarProp';
import { auth, db } from '@/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { FaCircleNotch } from 'react-icons/fa';
import { User } from 'firebase/auth'; // Import User type
import { parseISO, format, addDays } from 'date-fns'; // Import date-fns functions

interface Event {
  date: Date;
  title: string;
  link: string; // Add link property for navigation
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null); // Update user state type

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;

      setLoading(true);
      try {
        console.log("Fetching user document...");
        const userDocRef = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (!userSnapshot.exists()) {
          console.error("User not found");
          setLoading(false);
          return;
        }

        const userData = userSnapshot.data();
        console.log("User data:", userData);

        const upvotedClubIds = userData.upvotedClubs || [];
        console.log("Upvoted clubs:", upvotedClubIds);

        if (upvotedClubIds.length === 0) {
          setLoading(false);
          return;
        }

        const fetchedEvents: Event[] = [];
        
        for (const clubId of upvotedClubIds) {
          console.log(`Fetching club document for ID: ${clubId}`);
          const clubDocRef = doc(db, 'clubs', clubId);
          const clubSnapshot = await getDoc(clubDocRef);

          if (!clubSnapshot.exists()) continue;

          const clubData = clubSnapshot.data();
          console.log(`Club data for ${clubId}:`, clubData);

          const clubName = clubData.name;

          if (clubData.oneOffEvents) {
            console.log("Processing one-off events...");
            clubData.oneOffEvents.forEach((event: { date: string; title: string }) => {
              fetchedEvents.push({
                date: parseISO(event.date), // Use date-fns to parse ISO date
                title: `${clubName}: ${event.title}`,
                link: `/club/${clubId}` // Create a link
              });
            });
          }

          if (clubData.recurringEvents) {
            console.log("Processing recurring events...");
            clubData.recurringEvents.forEach((event: {
              title: string;
              frequency: 'weekly' | 'biweekly' | 'monthly';
              dayOfWeek: number;
              startDate: string;
              endDate: string;
              exceptions: string[];
            }) => {
              const dates = generateRecurringDates(event);
              dates.forEach(date => {
                fetchedEvents.push({
                  date,
                  title: `${clubName}: ${event.title}`,
                  link: `/club/${clubId}` // Create a link for recurring events
                });
              });
            });
          }
        }

        console.log("Fetched events:", fetchedEvents);
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchEvents();
    }
  }, [user]);

  const generateRecurringDates = (event: {
    frequency: 'weekly' | 'biweekly' | 'monthly';
    dayOfWeek: number;
    startDate: string;
    endDate: string;
    exceptions: string[];
  }): Date[] => {
    console.log("Generating recurring dates for event:", event);
    const dates: Date[] = [];
    let currentDate = parseISO(event.startDate); // Parse start date
    const endDate = parseISO(event.endDate); // Parse end date

    while (currentDate.getDay() !== event.dayOfWeek) {
      currentDate = addDays(currentDate, 1); // Use date-fns to add days
    }

    while (currentDate <= endDate) {
      const currentDateString = format(currentDate, 'yyyy-MM-dd'); // Format the date

      if (!event.exceptions.includes(currentDateString)) {
        dates.push(new Date(currentDate)); // Push a new instance of the current date
      }

      switch (event.frequency) {
        case 'weekly':
          currentDate = addDays(currentDate, 7); // Add a week
          break;
        case 'biweekly':
          currentDate = addDays(currentDate, 14); // Add two weeks
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1); // Add a month
          break;
      }
    }

    return dates;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-cblack flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex flex-col items-center">
            <FaCircleNotch className="animate-spin h-16 w-16 text-azul" />
            <p className="mt-4 text-azul font-semibold">Loading calendar data...</p>
          </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-cblack min-h-screen flex items-center justify-center">
        <p className="text-white text-xl">Please log in to view the calendar.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-white text-3xl font-bold mb-8">
          Your Calendar {events.length === 0 ? ' - No events currently' : ''}
      </h1>
      <CalendarProp events={events} />
    </div>
  );
}
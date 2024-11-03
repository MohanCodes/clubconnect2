"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import UnderDevelopment from '@/components/UnderDevelopment';
import Calendar from '@/components/Calendar';
import { auth, db } from '@/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface Event {
  date: Date;
  title: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const user = auth.currentUser;
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user's document
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

        // Fetch events for each upvoted club
        const fetchedEvents: Event[] = [];
        
        for (const clubId of upvotedClubIds) {
          console.log(`Fetching club document for ID: ${clubId}`);
          const clubDocRef = doc(db, 'clubs', clubId);
          const clubSnapshot = await getDoc(clubDocRef);

          if (!clubSnapshot.exists()) continue;

          const clubData = clubSnapshot.data();
          console.log(`Club data for ${clubId}:`, clubData);

          const clubName = clubData.name; // Get the club name

          // Process one-off events
          if (clubData.oneOffEvents) {
            console.log("Processing one-off events...");
            clubData.oneOffEvents.forEach((event: { date: string; title: string }) => {
              fetchedEvents.push({
                date: new Date(event.date),
                title: `${clubName}: ${event.title}`, // Prefix the club name to the event title
              });
            });
          }
          // Process recurring events
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
              // Generate dates for recurring events
              const dates = generateRecurringDates(event);
              dates.forEach(date => {
                fetchedEvents.push({
                  date,
                  title: `${clubName}: ${event.title}`, // Prefix the club name to the event title
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

    fetchEvents();
  }, []);

  // Function to generate recurring event dates
  const generateRecurringDates = (event: {
    frequency: 'weekly' | 'biweekly' | 'monthly';
    dayOfWeek: number;
    startDate: string;
    endDate: string;
    exceptions: string[];
  }): Date[] => {
    console.log("Generating recurring dates for event:", event);
    const dates: Date[] = [];
    let currentDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);

    // Adjust currentDate to first occurrence of correct dayOfWeek after startDate
    if (currentDate.getDay() !== event.dayOfWeek) {
      while (currentDate.getDay() !== event.dayOfWeek) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    while (currentDate <= endDate) {
      const currentDateString = currentDate.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
      
      // Check if this date is in exceptions
      if (!event.exceptions.includes(currentDateString)) {
        dates.push(new Date(currentDate));
      }

      // Increment based on frequency
      switch (event.frequency) {
        case 'weekly':
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case 'biweekly':
          currentDate.setDate(currentDate.getDate() + 14);
          break;
        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }

    return dates;
  };

  return (
    <div className="bg-cblack">
      <Navbar />
      <main className="min-h-screen bg-cblack text-center">
        {loading ? (
          <p className="text-white">Loading events...</p>
        ) : events.length === 0 ? (
          <p className="text-white">No events available</p>
        ) : (
          <>
            <Calendar events={events} />
            <UnderDevelopment />
          </>
        )}
      </main>
    </div>
  );
}
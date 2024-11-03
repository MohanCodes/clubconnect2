import Navbar from '@/components/Navbar'
import UnderDevelopment from '@/components/UnderDevelopment'
import Calendar from '@/components/Calendar'

export default function CalendarPage() {
  const events = [
    { date: new Date(2024, 10, 5), title: "Club Meeting" },
    { date: new Date(2024, 10, 15), title: "Workshop" },
    // Add more events as needed
  ];
  return (
    <div className="bg-cblack">
      <Navbar />
      <main className="min-h-screen bg-cblack text-center">
        <Calendar events={[
          { date: new Date(2024, 10, 5), title: "Club Meeting" },
          { date: new Date(2024, 10, 15), title: "Workshop" },
        ]}/>
        <UnderDevelopment />
      </main>
    </div>
  )
}
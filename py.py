from datetime import datetime, timedelta

def get_next_meeting(start_date, end_date):
    # Convert string dates to datetime objects
    start_date = datetime.strptime(start_date, '%Y-%m-%d')
    end_date = datetime.strptime(end_date, '%Y-%m-%d')
    
    # Get today's date
    today = datetime.now()
    
    # Check if today is past the end date
    if today > end_date:
        return "The event has ended."

    # Calculate the next Monday
    days_ahead = (7 - today.weekday()) % 7  # 0 is Monday, 6 is Sunday
    if days_ahead == 0 and today >= start_date:  # If today is Monday and after start date
        next_meeting = today + timedelta(days=7)
    else:
        next_meeting = today + timedelta(days=days_ahead)

    # Ensure the next meeting is after the start date
    if next_meeting < start_date:
        next_meeting = start_date

    # Check if the next meeting is before the end date
    if next_meeting <= end_date:
        return next_meeting.strftime('%Y-%m-%d')
    else:
        return "No more meetings scheduled."

# Define the event dates
start_date = '2024-10-29'
end_date = '2025-11-10'

# Get the next meeting date
next_meeting = get_next_meeting(start_date, end_date)
print("The next meeting is on:", next_meeting)
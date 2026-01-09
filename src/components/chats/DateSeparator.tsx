import React from 'react';

interface DateSeparatorProps {
  date: Date;
}

const DateSeparator: React.FC<DateSeparatorProps> = ({ date }) => {
  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const messageDate = new Date(date);
    
    // Reset time to compare only dates
    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();
    const messageDateStr = messageDate.toDateString();
    
    if (messageDateStr === todayStr) {
      return 'Today';
    } else if (messageDateStr === yesterdayStr) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  return (
    <div className="flex justify-center my-4">
      <div className="bg-gray-500/10 text-gray-500 px-3 py-1 rounded-full text-xs font-medium">
        {formatDate(date)}
      </div>
    </div>
  );
};

export default DateSeparator;
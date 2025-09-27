import React from 'react';
import { motion } from 'framer-motion';

interface ContributionCalendarProps {
  className?: string;
}

export function ContributionCalendar({ className = '' }: ContributionCalendarProps) {
  // Generate mock contribution data for the last 12 months
  const generateContributionData = () => {
    const data = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() - 12);
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Generate random contribution count (0-4 scale like GitHub)
      const contributionLevel = Math.random() < 0.3 ? 0 : Math.floor(Math.random() * 4) + 1;
      
      data.push({
        date: date.toISOString().split('T')[0],
        contributionLevel,
        contributions: contributionLevel === 0 ? 0 : Math.floor(Math.random() * 10) + contributionLevel
      });
    }
    
    return data;
  };

  const contributionData = generateContributionData();
  
  // Group data by weeks for display
  const getWeeksData = () => {
    const weeks = [];
    let currentWeek = [];
    
    contributionData.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay();
      
      if (index === 0) {
        // Fill the first week with empty cells if needed
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push({ isEmpty: true });
        }
      }
      
      currentWeek.push(day);
      
      if (currentWeek.length === 7 && index !== contributionData.length - 1) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    
    // Add the last partial week
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({ isEmpty: true });
      }
      weeks.push(currentWeek);
    }
    
    return weeks;
  };

  const weeks = getWeeksData();
  
  const getContributionColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-gray-800';
      case 1: return 'bg-green-900';
      case 2: return 'bg-green-700';
      case 3: return 'bg-green-500';
      case 4: return 'bg-green-400';
      default: return 'bg-gray-800';
    }
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className={`p-4 bg-black/20 border border-gray-800/50 rounded-lg ${className}`}>
      <div className="mb-4">
        <h4 className="text-white font-medium text-sm mb-2">
          {contributionData.reduce((sum, day) => sum + day.contributions, 0)} contributions in the last year
        </h4>
      </div>
      
      <div className="flex items-start space-x-2">
        {/* Day labels */}
        <div className="flex flex-col space-y-1 text-xs text-gray-400 pt-6">
          {dayNames.map((day, index) => (
            index % 2 === 1 ? (
              <div key={day} className="h-3 flex items-center">
                {day}
              </div>
            ) : (
              <div key={day} className="h-3"></div>
            )
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="flex-1">
          {/* Month labels */}
          <div className="flex mb-2 text-xs text-gray-400">
            {monthNames.map((month, index) => (
              <div key={month} className="flex-1 text-center">
                {index % 2 === 0 ? month : ''}
              </div>
            ))}
          </div>
          
          {/* Contribution squares */}
          <div className="flex space-x-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col space-y-1">
                {week.map((day: any, dayIndex) => (
                  <motion.div
                    key={`${weekIndex}-${dayIndex}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (weekIndex * 7 + dayIndex) * 0.002 }}
                    className={`w-3 h-3 rounded-sm ${
                      day.isEmpty 
                        ? 'bg-transparent' 
                        : getContributionColor(day.contributionLevel)
                    } hover:ring-1 hover:ring-gray-500 transition-all cursor-pointer`}
                    title={day.isEmpty ? '' : `${day.contributions} contributions on ${day.date}`}
                  />
                ))}
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-gray-400">Less</span>
            <div className="flex items-center space-x-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`w-3 h-3 rounded-sm ${getContributionColor(level)}`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
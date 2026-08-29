
import React, { useState, useMemo } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';

const NotificationsView: React.FC = () => {
  const { notifications, markNotificationAsRead } = useData();
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const myNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications
        .filter(n => n.userId === currentUser.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications, currentUser]);

  const filteredNotifications = useMemo(() => {
      const lowerTerm = searchTerm.toLowerCase();
      return myNotifications.filter(n =>
          n.message.toLowerCase().includes(lowerTerm) ||
          new Date(n.timestamp).toLocaleString().toLowerCase().includes(lowerTerm)
      );
  }, [myNotifications, searchTerm]);

  const handleMarkAsRead = (id: string) => {
      markNotificationAsRead(id);
  }

  const handleMarkAllRead = () => {
      filteredNotifications.forEach(n => {
          if(!n.isRead) markNotificationAsRead(n.id);
      });
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md min-h-[600px]">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-800">System Notifications</h2>
                <p className="text-gray-500 text-sm mt-1">Updates on requests and system activities.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input
                        type="search"
                        placeholder="Search notifications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                 </div>
                 <button
                    onClick={handleMarkAllRead}
                    className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm whitespace-nowrap"
                 >
                    Mark All Read
                 </button>
            </div>
        </div>

        <div className="space-y-3">
            {filteredNotifications.length > 0 ? (
                filteredNotifications.map(notif => (
                    <div
                        key={notif.id}
                        onClick={() => handleMarkAsRead(notif.id)}
                        className={`p-4 rounded-lg border flex items-start justify-between cursor-pointer transition-all duration-200 group ${
                            notif.isRead ? 'bg-white border-gray-200 hover:border-gray-300' : 'bg-blue-50/50 border-blue-200 shadow-sm hover:shadow-md'
                        }`}
                    >
                         <div className="flex items-start space-x-4">
                            <div className={`mt-1 p-2 rounded-full flex-shrink-0 ${
                                notif.type === 'success' ? 'bg-green-100 text-green-600' :
                                notif.type === 'error' ? 'bg-red-100 text-red-600' :
                                'bg-blue-100 text-blue-600'
                            }`}>
                                {notif.type === 'success' ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                ) : notif.type === 'error' ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                )}
                            </div>
                            <div>
                                <p className={`text-sm ${notif.isRead ? 'text-gray-700' : 'text-gray-900 font-bold'}`}>{notif.message}</p>
                                <p className="text-xs text-gray-500 mt-1 flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    {new Date(notif.timestamp).toLocaleString()}
                                </p>
                            </div>
                         </div>
                         {!notif.isRead && (
                             <span className="h-3 w-3 bg-blue-600 rounded-full mt-2 ring-2 ring-blue-100"></span>
                         )}
                    </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                    <p className="text-lg font-medium">No notifications found</p>
                    <p className="text-sm">Try adjusting your search terms</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default NotificationsView;

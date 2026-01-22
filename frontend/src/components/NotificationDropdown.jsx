import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { Bell, CheckCircle, XCircle, Heart, MessageCircle, Calendar, Trash2 } from "lucide-react";
import moment from "moment";
import { Link } from "react-router-dom";

const NotificationDropdown = ({ isOpen, onClose }) => {
    const { notifications, markNotificationAsRead, markAllNotificationsAsRead, backendUrl } =
        useContext(AppContext);

    if (!isOpen) return null;

    const getIcon = (type) => {
        switch (type) {
            case "application_accepted":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "application_rejected":
                return <XCircle className="h-5 w-5 text-red-500" />;
            case "job_deleted":
                return <Trash2 className="h-5 w-5 text-gray-500" />;
            case "post_liked":
                return <Heart className="h-5 w-5 text-red-500" fill="currentColor" />;
            case "post_commented":
                return <MessageCircle className="h-5 w-5 text-blue-500" fill="currentColor" />;
            case "interview_scheduled":
                return <Calendar className="h-5 w-5 text-purple-500" />;
            default:
                return <Bell className="h-5 w-5 text-gray-500" />;
        }
    };

    return (
        <div className="absolute right-0 top-12 mt-2 w-96 origin-top-right rounded-2xl border border-gray-100 bg-white shadow-2xl z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-white">
                <h3 className="font-bold text-gray-800 text-lg">Notifications</h3>
                {notifications.length > 0 && (
                    <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold uppercase tracking-wider"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="h-8 w-8 text-gray-200" />
                        </div>
                        <p className="text-sm font-medium">All caught up!</p>
                        <p className="text-xs mt-1">Check back later for updates.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-50">
                        {notifications.map((notification) => (
                            <li
                                key={notification._id}
                                onClick={() =>
                                    !notification.read && markNotificationAsRead(notification._id)
                                }
                                className={`p-4 hover:bg-gray-50 transition-all cursor-pointer relative group ${!notification.read ? "bg-blue-50/30" : "bg-white"
                                    }`}
                            >
                                <div className="flex gap-4">
                                    <Link
                                        to={`/profile/${notification.senderId?._id}`}
                                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                                        className="mt-1 flex-shrink-0 relative group/avatar"
                                    >
                                        {notification.senderId?.image ? (
                                            <img
                                                src={notification.senderId.image.startsWith('http') ? notification.senderId.image : `${backendUrl}${notification.senderId.image}`}
                                                className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm group-hover/avatar:ring-2 group-hover/avatar:ring-blue-400 transition"
                                                alt=""
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-50">
                                                <Bell className="w-5 h-5 text-gray-400" />
                                            </div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm border border-gray-50">
                                            {getIcon(notification.type)}
                                        </div>
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className={`text-sm leading-snug ${!notification.read
                                                ? "font-bold text-gray-900"
                                                : "text-gray-600 font-medium"
                                                }`}
                                        >
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1.5 font-bold uppercase tracking-tighter">
                                            {moment(notification.createdAt).fromNow()}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <div className="mt-2 h-2.5 w-2.5 rounded-full bg-blue-600 flex-shrink-0 animate-pulse"></div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                <button className="text-xs font-bold text-gray-500 hover:text-blue-600 transition tracking-widest uppercase">
                    View Archive
                </button>
            </div>
        </div>
    );
};

export default NotificationDropdown;

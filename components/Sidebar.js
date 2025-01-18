import React from "react";
import { Home, Calendar, Clock, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, onDashboardClick, onAppointmentsClick, onScheduleManagerClick, onSettingsClick }) => { // Update 1: Added onSettingsClick prop
    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <aside
            className={`${
                isOpen ? "translate-x-0" : "-translate-x-64"
            } transform fixed top-0 left-0 w-64 bg-blue-600 text-white h-full overflow-auto ease-in-out transition-all duration-300 z-30`}
        >
            <div className="flex items-center justify-between p-4 border-b border-blue-500">
                <h2 className="text-2xl font-bold">Menu</h2>
                <button
                    onClick={toggleSidebar}
                    className="p-1 rounded-full hover:bg-blue-500 focus:outline-none focus:ring"
                >
                    {isOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
                </button>
            </div>
            <nav className="mt-8">
                <ul className="space-y-2">
                    <li>
                        <button onClick={onDashboardClick} className="w-full flex items-center px-4 py-3 hover:bg-blue-500 transition-colors duration-200">
                            <Home className="h-5 w-5 mr-3" />
                            Dashboard
                        </button>
                    </li>
                    <li>
                        <button onClick={onAppointmentsClick} className="w-full flex items-center px-4 py-3 hover:bg-blue-500 transition-colors duration-200">
                            <Calendar className="h-5 w-5 mr-3" />
                            Appointments
                        </button>
                    </li>
                    <li>
                        <button onClick={onScheduleManagerClick} className="w-full flex items-center px-4 py-3 hover:bg-blue-500 transition-colors duration-200">
                            <Clock className="h-5 w-5 mr-3" />
                            Schedule Manager
                        </button>
                    </li>
                    <li>
                        <button onClick={onSettingsClick} className="w-full flex items-center px-4 py-3 hover:bg-blue-500 transition-colors duration-200"> {/* Update 2: Added onClick handler */}
                            <Settings className="h-5 w-5 mr-3" />
                            Settings
                        </button>
                    </li>
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;


import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { auth } from "@/firebase/config";
import withAuth from "../utils/withAuth";
import DoctorScheduleManager from "@/components/DoctorScheduleManager";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import DashboardStats from "@/components/DashboardStats";
import UpcomingAppointments from "@/components/UpcomingAppointments";
import { Menu, Layout } from 'lucide-react';

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [user, setUser] = useState(null);
    const appointmentsRef = useRef(null);
    const scheduleManagerRef = useRef(null);
    const topRef = useRef(null);
    const [totalUpcomingAppointments, setUpcomingAppointmentsCount] = useState(0)
    const [schedules, setSchedules] = useState([]);

    useEffect(() => {
        setIsClient(true);
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
            } else {
                router.push("/signin");
            }
        });
        return () => unsubscribe();
    }, [router]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const scrollToSection = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (!isClient) {
        return null;
    }



    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                onDashboardClick={() => topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                onAppointmentsClick={() => scrollToSection(appointmentsRef)}
                onScheduleManagerClick={() => scrollToSection(scheduleManagerRef)}
            />
            <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <Navbar toggleSidebar={toggleSidebar} user={user} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <div ref={topRef} className="container mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-3xl font-semibold text-gray-800">Welcome, Dr. {user?.displayName || 'User'}</h1>
                            <button
                                onClick={toggleSidebar}
                                className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring"
                            >
                                {isSidebarOpen ? <Menu /> : <Layout />}
                            </button>
                        </div>
                        <DashboardStats totalUpcomingAppointments={totalUpcomingAppointments} totalSchedules={schedules.length} />
                        <div ref={appointmentsRef}>
                            {/* Pass the setUpcomingAppointmentsCount function */}
                            <UpcomingAppointments setUpcomingAppointmentsCount={setUpcomingAppointmentsCount} />
                        </div>
                        <div ref={scheduleManagerRef}>
                            <DoctorScheduleManager schedules={schedules} setSchedules={setSchedules} setUpcomingAppointmentsCount={setUpcomingAppointmentsCount}/>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );

};

export default withAuth(Dashboard);

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { auth } from "@/firebase/config";
import withAuth from "../utils/withAuth";
import DoctorScheduleManager from "@/components/DoctorScheduleManager";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { Menu, Layout, Calendar, Users, Clock, Activity, X, Check } from 'lucide-react';

const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [user, setUser] = useState(null);
    const appointmentsRef = useRef(null);
    const scheduleManagerRef = useRef(null);
    const topRef = useRef(null);

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

    const handleLogout = async () => {
        try {
            await auth.signOut();
            router.push("/signin");
        } catch (error) {
            console.error("Logout failed", error.message);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const scrollToSection = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (!isClient) {
        return null;
    }

    const upcomingAppointments = [
        { start: "09:00", end: "09:30", name: "John Doe", reason: "Follow-up", status: "Confirmed", interval: 30 },
        { start: "10:30", end: "11:00", name: "Jane Smith", reason: "Annual Check-up", status: "Pending", interval: 30 },
        { start: "11:45", end: "12:15", name: "Robert Johnson", reason: "Consultation", status: "Confirmed", interval: 30 },
        { start: "14:00", end: "14:45", name: "Emily Brown", reason: "New Patient", status: "Accepted", interval: 45 },
        { start: "15:30", end: "16:00", name: "Michael Lee", reason: "Follow-up", status: "Rejected", interval: 30 },
    ];

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
                <Navbar onLogout={handleLogout} toggleSidebar={toggleSidebar} user={user} />
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                                <Calendar className="h-12 w-12 text-blue-500 mr-4" />
                                <div>
                                    <h2 className="text-xl font-semibold">Today's Appointments</h2>
                                    <p className="text-3xl font-bold text-gray-700">8</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                                <Users className="h-12 w-12 text-green-500 mr-4" />
                                <div>
                                    <h2 className="text-xl font-semibold">Total Patients</h2>
                                    <p className="text-3xl font-bold text-gray-700">1,254</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                                <Clock className="h-12 w-12 text-yellow-500 mr-4" />
                                <div>
                                    <h2 className="text-xl font-semibold">Avg. Wait Time</h2>
                                    <p className="text-3xl font-bold text-gray-700">15 min</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                                <Activity className="h-12 w-12 text-red-500 mr-4" />
                                <div>
                                    <h2 className="text-xl font-semibold">Patient Satisfaction</h2>
                                    <p className="text-3xl font-bold text-gray-700">95%</p>
                                </div>
                            </div>
                        </div>
                        <div ref={appointmentsRef} className="bg-white rounded-lg shadow-md p-6 mb-8">
                            <h2 className="text-2xl font-semibold mb-4">Upcoming Appointments</h2>
                            <table className="w-full">
                                <thead>
                                <tr className="bg-gray-100">
                                    <th className="py-2 px-4 text-left">Time</th>
                                    <th className="py-2 px-4 text-left">Patient Name</th>
                                    <th className="py-2 px-4 text-left">Reason</th>
                                    <th className="py-2 px-4 text-left">Status</th>
                                    <th className="py-2 px-4 text-left">Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {upcomingAppointments.map((appointment, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="py-2 px-4">{appointment.start} - {appointment.end} ({appointment.interval} min)</td>
                                        <td className="py-2 px-4">{appointment.name}</td>
                                        <td className="py-2 px-4">{appointment.reason}</td>
                                        <td className="py-2 px-4">
                                            <span className={`px-2 py-1 rounded-full text-sm ${
                                                appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                    appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        appointment.status === 'Accepted' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-red-100 text-red-800'
                                            }`}>
                                                {appointment.status}
                                            </span>
                                        </td>
                                        <td className="py-2 px-4">
                                            {appointment.status === 'Pending' && (
                                                <>
                                                    <button className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded mr-2">
                                                        <Check size={16} />
                                                    </button>
                                                    <button className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            )}
                                            {(appointment.status === 'Confirmed' || appointment.status === 'Accepted') && (
                                                <button className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded">
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <div ref={scheduleManagerRef}>
                            <DoctorScheduleManager />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default withAuth(Dashboard);


import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { auth, db } from "@/firebase/config";
import withAuth from "../utils/withAuth";
import DoctorScheduleManager from "@/components/DoctorScheduleManager";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import {
    Menu, Layout, Calendar, Users, Clock, Activity, X, Check
} from 'lucide-react';
import {
    collection, query, where, getDocs, orderBy, doc, getDoc
} from 'firebase/firestore';



const Dashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const [user, setUser] = useState(null);
    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const appointmentsRef = useRef(null);
    const scheduleManagerRef = useRef(null);
    const topRef = useRef(null);
    // function getName(uid){
    //     const docRef = doc(db, "users", uid)
    //     const docSnap = await getDoc(docRef)
    //     // console.log(docSnap.data().name);
    //     return docSnap.data();
    // }
    useEffect(() => {
        setIsClient(true);
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
                fetchUpcomingAppointments(user.uid);
            } else {
                router.push("/signin");
            }
        });
        return () => unsubscribe();
    }, [router]);

    // const getName = async (uid) => {
    //     const docRef = doc(db, "users", uid)
    //     const docSnap = await getDoc(docRef)
    //     // console.log(docSnap.data().name);
    //     return docSnap.data();
    // }

    const fetchUpcomingAppointments = async (doctorId) => {
        try {
            // Fetch all schedules for the doctor
            const schedulesRef = collection(db, `doctors/${doctorId}/schedules`);
            const schedulesSnapshot = await getDocs(schedulesRef);

            // Collect all booked appointments across all schedules
            const bookedAppointments = [];

            // Loop through each schedule document
            for (const scheduleDoc of schedulesSnapshot.docs) {
                const scheduleData = scheduleDoc.data();
                const timeSlots = scheduleData.timeSlots || [];

                // Loop through each time slot and check if it's booked
                for (const slot of timeSlots) {
                    if (slot.booked) {
                        // Fetch the patient's name from the users collection
                        const patientId = slot.patient; // Assuming 'patient' field contains the UID
                        const userRef = doc(db, "users", patientId);
                        const userSnapshot = await getDoc(userRef);

                        let patientName = "";
                        if (userSnapshot.exists()) {
                            patientName = userSnapshot.data().name;
                        }
                        console.log("name", patientName)

                        // Transform booked slot into appointment object with patient name
                        bookedAppointments.push({
                            date: scheduleData.date,
                            ...slot,
                            scheduleId: scheduleDoc.id,
                            patientName: patientName || "Unknown Patient", // Default if no name is found
                        });
                    }
                }
            }

            // Sort appointments by date and time
            const sortedAppointments = bookedAppointments.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.start}`);
                const dateB = new Date(`${b.date}T${b.start}`);
                return dateA - dateB;
            });

            // Update the state with the sorted appointments
            setUpcomingAppointments(sortedAppointments);
        } catch (error) {
            console.error("Error fetching upcoming appointments:", error);
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
                    <div ref={topRef} className="container mx-auto space-y-6">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-3xl font-semibold text-gray-800">
                                Welcome, Dr. {user?.displayName || 'User'}
                            </h1>
                            <button
                                onClick={toggleSidebar}
                                className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring"
                            >
                                {isSidebarOpen ? <Menu /> : <Layout />}
                            </button>
                        </div>

                        {/* Existing Dashboard Stats Grid */}
                        {/* ... [previous stats grid code remains the same] */}

                        {/* Upcoming Appointments Section */}
                        <div ref={appointmentsRef} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-2xl font-semibold flex items-center">
                                    <Calendar className="mr-2 text-blue-500" />
                                    Upcoming Appointments
                                </h2>
                                <span className="text-sm text-gray-500">
                                    Total: {upcomingAppointments.length} appointments
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                    <tr className="bg-gray-100 border-b">
                                        <th className="py-3 px-4 text-left text-xs uppercase tracking-wider">Date</th>
                                        <th className="py-3 px-4 text-left text-xs uppercase tracking-wider">Time</th>
                                        <th className="py-3 px-4 text-left text-xs uppercase tracking-wider">Patient</th>
                                        <th className="py-3 px-4 text-left text-xs uppercase tracking-wider">Status</th>
                                        <th className="py-3 px-4 text-center text-xs uppercase tracking-wider">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {upcomingAppointments.map((appointment, index) => (
                                        <tr key={index} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                            <td className="py-3 px-4 text-sm">{appointment.date}</td>
                                            <td className="py-3 px-4 text-sm">
                                                {appointment.start} - {appointment.end}
                                            </td>
                                            <td className="py-3 px-4 text-sm">
                                                {/*{appointment.patient?.name || 'N/A'}*/}
                                                {(appointment.patientName) || 'N/A'}
                                            </td>
                                            <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        appointment.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                        {appointment.status || 'Booked'}
                                                    </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full">
                                                    <X size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Schedule Manager Section */}
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

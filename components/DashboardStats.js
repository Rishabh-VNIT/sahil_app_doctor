"use client"
import React, { useState, useEffect } from "react"
import { UserIcon as UserMd, Users, Clock, ClipboardList } from "lucide-react"
import {collection, getDocs} from "firebase/firestore";
import {db} from "@/firebase/config";

const DashboardStats = ({ totalUpcomingAppointments, totalSchedules }) => {
    const [totalDoctors, setTotalDoctors] = useState(6) // You can fetch this from Firestore
    const [totalUsers, setTotalUsers] = useState(300) // You can fetch this from Firestore
    // const [totalSchedules, setTotalSchedules] = useState(50); // You can fetch this from Firestore
    useEffect(() => {
        const fetchTotalCounts = async () => {
            try {
                const doctorsSnapshot = await getDocs(collection(db, "doctors"));
                const usersSnapshot = await getDocs(collection(db, "users"));

                setTotalDoctors(doctorsSnapshot.size);
                setTotalUsers(usersSnapshot.size);
            } catch (error) {
                console.error("Error fetching total counts:", error);
            }
        };

        fetchTotalCounts();
    }, []);
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                <UserMd className="h-12 w-12 text-blue-500 mr-4" />
                <div>
                    <h2 className="text-xl font-semibold">Total Doctors</h2>
                    <p className="text-3xl font-bold text-gray-700">{totalDoctors}</p>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                <Users className="h-12 w-12 text-green-500 mr-4" />
                <div>
                    <h2 className="text-xl font-semibold">Total Users</h2>
                    <p className="text-3xl font-bold text-gray-700">{totalUsers}</p>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                <Clock className="h-12 w-12 text-yellow-500 mr-4" />
                <div>
                    <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
                    <p className="text-3xl font-bold text-gray-700">{totalUpcomingAppointments}</p>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 flex items-center">
                <ClipboardList className="h-12 w-12 text-red-500 mr-4" />
                <div>
                    <h2 className="text-xl font-semibold">Total Schedules</h2>
                    <p className="text-3xl font-bold text-gray-700">{totalSchedules}</p>
                </div>
            </div>
        </div>
    )
}

export default DashboardStats


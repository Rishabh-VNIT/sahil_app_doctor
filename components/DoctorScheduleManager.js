import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Calendar, Clock, ChevronDown, ChevronUp, AlertCircle, Check, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { db } from '@/firebase/config';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const DoctorScheduleManager = () => {
    const [scheduleForm, setScheduleForm] = useState({ startTime: "", endTime: "", interval: "" });
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("idle");
    const [schedules, setSchedules] = useState([]);
    const [expandedSchedule, setExpandedSchedule] = useState(null);
    const [expandedSlot, setExpandedSlot] = useState(null);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth();

    useEffect(() => {
        fetchDoctorSchedules();
    }, [user]);

    const fetchDoctorSchedules = async () => {
        if (!user?.uid) return;

        try {
            setLoading(true);
            // Get schedules from the nested collection
            const schedulesRef = collection(db, `doctors/${user.uid}/schedules`);
            const schedulesSnapshot = await getDocs(schedulesRef);

            const fetchedSchedules = schedulesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setSchedules(fetchedSchedules);
        } catch (error) {
            setMessage("Error fetching schedules: " + error.message);
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user?.uid) {
            setMessage("Please log in to create schedules");
            setStatus("error");
            return;
        }

        try {
            setStatus("loading");

            const newSchedule = {
                startTime: scheduleForm.startTime,
                endTime: scheduleForm.endTime,
                interval: parseInt(scheduleForm.interval),
                createdAt: new Date().toISOString(),
                timeSlots: generateTimeSlots(scheduleForm.startTime, scheduleForm.endTime, parseInt(scheduleForm.interval))
            };

            // Add to the nested schedules collection
            const schedulesRef = collection(db, `doctors/${user.uid}/schedules`);
            const docRef = await addDoc(schedulesRef, newSchedule);

            setSchedules([...schedules, { id: docRef.id, ...newSchedule }]);
            setScheduleForm({ startTime: "", endTime: "", interval: "" });
            setMessage("Schedule created successfully");
            setStatus("success");
        } catch (error) {
            setMessage("Error creating schedule: " + error.message);
            setStatus("error");
        }
    };


    // Rest of the component remains the same
    const handleDelete = async (scheduleId) => {
        try {
            // Delete from the nested collection
            await deleteDoc(doc(db, `doctors/${user.uid}/schedules`, scheduleId));
            setSchedules(schedules.filter(s => s.id !== scheduleId));
            setMessage("Schedule deleted successfully");
            setStatus("success");
        } catch (error) {
            setMessage("Error deleting schedule: " + error.message);
            setStatus("error");
        }
    };

    const handleAppointmentStatusUpdate = async (scheduleId, slotIndex, newStatus) => {
        try {
            // Update in the nested collection
            const scheduleRef = doc(db, `doctors/${user.uid}/schedules`, scheduleId);
            const updatedSchedule = { ...schedules.find(s => s.id === scheduleId) };
            updatedSchedule.timeSlots[slotIndex].status = newStatus;

            await updateDoc(scheduleRef, { timeSlots: updatedSchedule.timeSlots });

            setSchedules(schedules.map(s =>
                s.id === scheduleId ? updatedSchedule : s
            ));

            setMessage(`Appointment ${newStatus.toLowerCase()} successfully`);
            setStatus("success");
        } catch (error) {
            setMessage("Error updating appointment status: " + error.message);
            setStatus("error");
        }
    };

    const generateTimeSlots = (start, end, intervalMinutes) => {
        const slots = [];
        const startDate = new Date(`2000-01-01T${start}`);
        const endDate = new Date(`2000-01-01T${end}`);
        let currentSlot = new Date(startDate);

        while (currentSlot < endDate) {
            const slotStart = currentSlot.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });

            currentSlot = new Date(currentSlot.getTime() + intervalMinutes * 60000);

            const slotEnd = currentSlot > endDate
                ? endDate.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                })
                : currentSlot.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });

            slots.push({
                start: slotStart,
                end: slotEnd,
                status: 'Available',
                booked: false,
                patient: null
            });
        }

        return slots;
    };

    const toggleSchedule = (scheduleId) => {
        setExpandedSchedule(expandedSchedule === scheduleId ? null : scheduleId);
        setExpandedSlot(null);
    };

    const toggleSlot = (scheduleIndex, slotIndex) => {
        setExpandedSlot(expandedSlot && expandedSlot.scheduleIndex === scheduleIndex && expandedSlot.slotIndex === slotIndex
            ? null
            : { scheduleIndex, slotIndex });
    };

    // ... Rest of the JSX remains the same as in your original code ...

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gray-50">
            <h1 className="text-3xl font-semibold mb-8 text-gray-800 flex items-center">
                <Calendar className="mr-2 text-blue-500" />
                Doctor Schedule Manager
            </h1>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3">
                    <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                            <Plus className="mr-2 text-green-500" />
                            Add New Schedule
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <div className="relative">
                                    <Clock className="absolute top-3 left-3 text-gray-400" size={16} />
                                    <input
                                        type="time"
                                        value={scheduleForm.startTime}
                                        onChange={(e) => setScheduleForm(prev => ({ ...prev, startTime: e.target.value }))}
                                        className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <div className="relative">
                                    <Clock className="absolute top-3 left-3 text-gray-400" size={16} />
                                    <input
                                        type="time"
                                        value={scheduleForm.endTime}
                                        onChange={(e) => setScheduleForm(prev => ({ ...prev, endTime: e.target.value }))}
                                        className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Interval (Minutes)</label>
                                <input
                                    type="number"
                                    value={scheduleForm.interval}
                                    onChange={(e) => setScheduleForm(prev => ({ ...prev, interval: e.target.value }))}
                                    min="5"
                                    max="120"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out"
                            >
                                Save Schedule
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:w-2/3">
                    <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                            <Calendar className="mr-2 text-blue-500" />
                            Your Schedules
                        </h2>
                        {schedules.length === 0 ? (
                            <div className="text-gray-500 text-center py-4 flex items-center justify-center">
                                <AlertCircle className="mr-2 text-yellow-500" />
                                <p>No schedules found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {schedules.map((schedule, scheduleIndex) => (
                                    <div key={schedule.id} className="bg-gray-50 p-4 rounded-md border border-gray-200 transition duration-200 ease-in-out hover:shadow-md">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <Clock className="text-blue-500" size={20} />
                                                <div>
                                                    <p className="font-medium text-gray-800">
                                                        {schedule.startTime} - {schedule.endTime}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {schedule.interval} minute intervals
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => toggleSchedule(schedule.id)}
                                                    className="text-gray-500 hover:text-blue-500 focus:outline-none transition duration-200 ease-in-out"
                                                >
                                                    {expandedSchedule === schedule.id ? (
                                                        <ChevronUp size={20} />
                                                    ) : (
                                                        <ChevronDown size={20} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(schedule.id)}
                                                    className="text-red-500 hover:text-red-700 focus:outline-none transition duration-200 ease-in-out"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                        {expandedSchedule === schedule.id && (
                                            <div className="mt-4">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                                                    {schedule.timeSlots.map((slot, slotIndex) => (
                                                        <div
                                                            key={slotIndex}
                                                            className={`p-2 rounded text-sm text-center border cursor-pointer transition duration-200 ease-in-out ${
                                                                slot.booked
                                                                    ? slot.status === 'Accepted' ? 'bg-green-100 border-green-200 text-green-800' : 'bg-red-100 border-red-200 text-red-800'
                                                                    : 'bg-blue-100 border-blue-200 text-blue-800'
                                                            }`}
                                                            onClick={() => toggleSlot(scheduleIndex, slotIndex)}
                                                        >
                                                            {slot.start} - {slot.end}
                                                        </div>
                                                    ))}
                                                </div>
                                                {expandedSlot &&
                                                    expandedSlot.scheduleIndex === scheduleIndex && schedule.timeSlots[expandedSlot.slotIndex].booked && (
                                                        <div className="bg-white p-4 rounded-md border border-gray-200 shadow-md">
                                                            <h3 className="text-lg font-semibold mb-2">Appointment Details</h3>
                                                            {schedule.timeSlots[expandedSlot.slotIndex].patient && (
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <p><strong>Name:</strong> {schedule.timeSlots[expandedSlot.slotIndex].patient.name}</p>
                                                                    <p><strong>Phone:</strong> {schedule.timeSlots[expandedSlot.slotIndex].patient.phone}</p>
                                                                    <p><strong>Gender:</strong> {schedule.timeSlots[expandedSlot.slotIndex].patient.gender}</p>
                                                                    <p><strong>Email:</strong> {schedule.timeSlots[expandedSlot.slotIndex].patient.email}</p>
                                                                    <p><strong>DOB:</strong> {schedule.timeSlots[expandedSlot.slotIndex].patient.dob}</p>
                                                                    <p><strong>Status:</strong> {schedule.timeSlots[expandedSlot.slotIndex].status}</p>
                                                                </div>
                                                            )}
                                                            <div className="mt-4 flex justify-end space-x-2">
                                                                <button
                                                                    onClick={() => handleAppointmentStatusUpdate(schedule.id, expandedSlot.slotIndex, 'Accepted')}
                                                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center"
                                                                >
                                                                    <Check size={16} className="mr-2" />
                                                                    Accept
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAppointmentStatusUpdate(schedule.id, expandedSlot.slotIndex, 'Rejected')}
                                                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center"
                                                                >
                                                                    <X size={16} className="mr-2" />
                                                                    Reject
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {message && (
                <div className={`mt-6 p-4 rounded-md text-center ${
                    status === "success" ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"
                }`}>
                    {status === "success" ? (
                        <div className="flex items-center justify-center">
                            <Check className="mr-2 text-green-500" />
                            {message}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center">
                            <AlertCircle className="mr-2 text-red-500" />
                            {message}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DoctorScheduleManager;

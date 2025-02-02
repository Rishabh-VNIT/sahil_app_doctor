"use client"

import { useState, useEffect } from "react"
import { Trash2, Plus, Calendar, Clock, ChevronDown, ChevronUp, AlertCircle, Check, User } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { db } from "@/firebase/config"
import { collection, query, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import {Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogContent} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import PatientSearch from "@/components/PatientSearch"

const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })
}

const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`)
    return time.toLocaleTimeString("en-GB", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    })
}

const DoctorScheduleManager = ({ schedules, setSchedules }) => {
    const { user } = useAuth()
    const [scheduleForm, setScheduleForm] = useState({
        date: "",
        startTime: "",
        endTime: "",
        interval: 5,
    })
    const [expandedSchedule, setExpandedSchedule] = useState(null)
    const [expandedSlot, setExpandedSlot] = useState(null)
    const [message, setMessage] = useState(null)
    const [status, setStatus] = useState(null)
    const [deleteConfirmation, setDeleteConfirmation] = useState(null)
    const [clashDialog, setClashDialog] = useState(null)

    useEffect(() => {
        const fetchSchedules = async () => {
            if (user) {
                const q = query(collection(db, "doctors", user.uid, "schedules"))
                const querySnapshot = await getDocs(q)
                const fetchedSchedules = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }))
                setSchedules(fetchedSchedules)
            }
        }
        fetchSchedules()
    }, [user, setSchedules])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage(null)
        setStatus(null)

        if (scheduleForm.endTime <= scheduleForm.startTime) {
            setMessage("End time must be after start time.")
            setStatus("error")
            return
        }

        try {
            const scheduleRef = await addDoc(collection(db, "doctors", user.uid, "schedules"), {
                ...scheduleForm,
                timeSlots: generateTimeSlots(scheduleForm),
                createdAt: serverTimestamp(),
            })
            setScheduleForm({
                date: "",
                startTime: "",
                endTime: "",
                interval: 5,
            })
            setMessage("Schedule added successfully!")
            setStatus("success")
        } catch (error) {
            setMessage("Error adding schedule. Please try again later.")
            setStatus("error")
            console.error(error)
        }
    }

    const generateTimeSlots = (schedule) => {
        const startTime = new Date(`2000-01-01T${schedule.startTime}`)
        const endTime = new Date(`2000-01-01T${schedule.endTime}`)
        const interval = schedule.interval * 60 * 1000 // Convert minutes to milliseconds
        const timeSlots = []

        let currentTime = startTime
        while (currentTime < endTime) {
            const start = currentTime.toLocaleTimeString("en-GB", { hour: "numeric", minute: "numeric", hour12: true })
            currentTime = new Date(currentTime.getTime() + interval)
            const end = currentTime.toLocaleTimeString("en-GB", { hour: "numeric", minute: "numeric", hour12: true })
            timeSlots.push({ start, end, booked: false, patient: null, status: null, description: null })
        }
        return timeSlots
    }

    const toggleSchedule = (id) => {
        setExpandedSchedule(expandedSchedule === id ? null : id)
    }

    const toggleSlotDetails = (id) => {
        setExpandedSlot(expandedSlot === id ? null : id)
    }

    const handleDeleteSchedule = async () => {
        if (!deleteConfirmation) return;

        try {
            await deleteDoc(doc(db, "doctors", user.uid, "schedules", deleteConfirmation.scheduleId));

            // Add record to doctor_schedule_cancellations collection
            // await addDoc(collection(db, 'doctor_schedule_cancellations'), {
            //     doctorId: user.uid,
            //     scheduleId: deleteConfirmation.scheduleId,
            //     scheduleDate: deleteConfirmation.date,
            //     cancellationType: 'schedule_deletion',
            //     cancellationReason: 'Doctor cancelled entire schedule',
            //     createdAt: serverTimestamp()
            // });

            setSchedules(schedules.filter((schedule) => schedule.id !== deleteConfirmation.scheduleId));
            setDeleteConfirmation(null);
            setMessage("Schedule deleted successfully!");
            setStatus("success");
        } catch (error) {
            setMessage("Error deleting schedule. Please try again later.");
            setStatus("error");
            console.error(error);
        }
    };

    const handleRejectApplication = async (schedule, slot) => {
        try {
            // Update the schedule document
            const scheduleRef = doc(db, "doctors", user.uid, "schedules", schedule.id);
            const updatedTimeSlots = schedule.timeSlots.map((timeSlot) => {
                if (timeSlot.start === slot.start) {
                    return {
                        ...timeSlot,
                        booked: false,
                        patient: null,
                        status: null,
                        description: null,
                        cancelled: [...(timeSlot.cancelled || []), slot.patient]
                    };
                }
                return timeSlot;
            });

            // Update schedule document
            await updateDoc(scheduleRef, { timeSlots: updatedTimeSlots });

            // Save rejection details to doctor_rejections collection
            await addDoc(collection(db, 'doctor_rejections'), {
                doctorId: user.uid,
                scheduleId: schedule.id,
                slotStart: slot.start,
                slotEnd: slot.end,
                patientId: slot.patient,
                patientName: slot.patientName,
                rejectionTime: serverTimestamp(),
                rejectionReason: 'Doctor Rejected',
                appointmentType: schedule.type || 'Regular',
                originalBookingTime: slot.bookingTime || null,
                specialization: user.specialization || null,
                clinic: user.clinic || null,
                status: 'Rejected'
            });

            // Update local state
            setSchedules(prevSchedules =>
                prevSchedules.map(s => s.id === schedule.id ?
                    { ...s, timeSlots: updatedTimeSlots } : s
                )
            );

            setMessage("Patient application rejected successfully!");
            setStatus("success");

        } catch (error) {
            console.error("Error rejecting patient:", error);
            setMessage("Error rejecting patient application. Please try again later.");
            setStatus("error");
        }
    };

    const handleTreatmentDone = async (schedule, slot) => {
        try {
            // Update the schedule document
            const scheduleRef = doc(db, "doctors", user.uid, "schedules", schedule.id);
            const updatedTimeSlots = schedule.timeSlots.map((timeSlot) => {
                if (timeSlot.start === slot.start) {
                    return {
                        ...timeSlot,
                        status: "Treatment Done"
                    };
                }
                return timeSlot;
            });

            // Update schedule document
            await updateDoc(scheduleRef, { timeSlots: updatedTimeSlots });

            // Save treatment completion details to doctor_treatments collection
            await addDoc(collection(db, 'doctor_treatments'), {
                doctorId: user.uid,
                scheduleId: schedule.id,
                slotStart: slot.start,
                slotEnd: slot.end,
                patientId: slot.patient,
                patientName: slot.patientName,
                completionTime: serverTimestamp(),
                clinic: user.clinic || null,
                status: 'Completed',
                treatmentNotes: slot.description || null,
                prescriptionId: null  // Can be updated if you have prescription functionality
            });

            // Update local state
            setSchedules(prevSchedules =>
                prevSchedules.map(s => s.id === schedule.id ?
                    { ...s, timeSlots: updatedTimeSlots } : s
                )
            );

            setMessage("Treatment marked as done successfully!");
            setStatus("success");

        } catch (error) {
            console.error("Error marking treatment as done:", error);
            setMessage("Error marking treatment as done. Please try again later.");
            setStatus("error");
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-50">
            <Dialog open={!!clashDialog} onOpenChange={() => setClashDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Schedule Clash</DialogTitle>
                        <DialogDescription>
                            There is a clash with your existing schedule. Please choose a different time.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setClashDialog(null)} variant="ghost">
                            Okay
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            <Dialog open={!!deleteConfirmation} onOpenChange={() => setDeleteConfirmation(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Schedule</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the schedule on {formatDate(deleteConfirmation?.date)}? This action cannot
                            be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={() => setDeleteConfirmation(null)} variant="ghost">
                            Cancel
                        </Button>
                        <Button onClick={handleDeleteSchedule} variant="destructive">
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <h1 className="text-4xl font-bold mb-8 text-gray-800 flex items-center">
                <Calendar className="mr-3 text-blue-600" size={36} />
                Doctor Schedule Manager
            </h1>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3">
                    <div className="bg-white shadow-xl rounded-lg p-6 border border-gray-200">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                            <Plus className="mr-2 text-green-500" size={24} />
                            Add New Schedule
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={scheduleForm.date}
                                    onChange={(e) => setScheduleForm((prev) => ({ ...prev, date: e.target.value }))}
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <div className="relative">
                                    <Clock className="absolute top-3 left-3 text-gray-400" size={18} />
                                    <input
                                        type="time"
                                        value={scheduleForm.startTime}
                                        onChange={(e) => setScheduleForm((prev) => ({ ...prev, startTime: e.target.value }))}
                                        className="w-full pl-10 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <div className="relative">
                                    <Clock className="absolute top-3 left-3 text-gray-400" size={18} />
                                    <input
                                        type="time"
                                        value={scheduleForm.endTime}
                                        onChange={(e) => setScheduleForm((prev) => ({ ...prev, endTime: e.target.value }))}
                                        className="w-full pl-10 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Interval (Minutes)</label>
                                <input
                                    type="number"
                                    value={scheduleForm.interval}
                                    onChange={(e) => setScheduleForm((prev) => ({ ...prev, interval: e.target.value }))}
                                    min="5"
                                    max="120"
                                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out text-lg font-semibold"
                            >
                                Save Schedule
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:w-2/3">
                    <div className="bg-white shadow-xl rounded-lg p-6 border border-gray-200">
                        <h2 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center">
                            <Calendar className="mr-2 text-blue-600" size={24} />
                            Your Schedules
                        </h2>
                        {schedules.length === 0 ? (
                            <div className="text-gray-500 text-center py-8 flex items-center justify-center bg-gray-50 rounded-lg">
                                <AlertCircle className="mr-2 text-yellow-500" size={24} />
                                <p className="text-lg">No schedules found</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {schedules.map((schedule) => (
                                    <div
                                        key={schedule.id}
                                        className="bg-gray-50 p-5 rounded-lg border border-gray-200 transition duration-200 ease-in-out hover:shadow-lg"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <Calendar className="text-blue-600" size={24} />
                                                <div>
                                                    <p className="font-bold text-gray-800 text-lg mb-1">{formatDate(schedule.date)}</p>
                                                    <p className="font-medium text-gray-700">
                                                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {schedule.interval} minute consultation intervals
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => toggleSchedule(schedule.id)}
                                                    className="text-gray-500 hover:text-blue-600 focus:outline-none transition duration-200 ease-in-out p-2 rounded-full hover:bg-blue-100"
                                                >
                                                    {expandedSchedule === schedule.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteSchedule()
                                                    }
                                                    className="text-red-500 hover:text-red-700 focus:outline-none transition duration-200 ease-in-out p-2 rounded-full hover:bg-red-100"
                                                >
                                                    <Trash2 size={24} />
                                                </button>
                                            </div>
                                        </div>
                                        {expandedSchedule === schedule.id && (
                                            <div className="mt-6">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                                    {schedule.timeSlots.map((slot, index) => (
                                                        <div
                                                            key={`${schedule.id}-${index}`}
                                                            className={`relative p-3 rounded-lg text-sm text-center border cursor-pointer transition duration-200 ease-in-out ${
                                                                slot.booked
                                                                    ? slot.status === "Accepted"
                                                                        ? "bg-green-100 border-green-300 text-green-800 hover:bg-green-200"
                                                                        : "bg-red-100 border-red-300 text-red-800 hover:bg-red-200"
                                                                    : "bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200"
                                                            }`}
                                                            onClick={() => toggleSlotDetails(`${schedule.id}-${index}`)}
                                                        >
                                                            <p className="font-medium">{slot.start}</p>
                                                            <p className="text-xs mt-1">{slot.end}</p>

                                                            {expandedSlot === `${schedule.id}-${index}` && slot.patient && (
                                                                <div className="absolute z-10 top-full left-0 mt-2 w-96 bg-white shadow-xl rounded-lg p-4 border border-gray-200">
                                                                    <div className="flex items-center space-x-2 mb-3">
                                                                        <User className="text-blue-600" size={20} />
                                                                        <h3 className="font-semibold text-lg">Patient Details</h3>
                                                                    </div>
                                                                    <PatientSearch uid={slot.patient} description={slot.description} patientName={slot.patientName}/>
                                                                    <div className="mt-4 space-y-2">
                                                                        {slot.status === "Accepted" && (
                                                                            <Button
                                                                                className="w-full bg-red-500 hover:bg-red-600 text-white"
                                                                                onClick={() => handleRejectApplication(schedule, slot)}
                                                                            >
                                                                                Reject Patient
                                                                            </Button>
                                                                        )}
                                                                        {slot.status === "Accepted" && (
                                                                            <Button
                                                                                className="w-full bg-green-500 hover:bg-green-600 text-white"
                                                                                onClick={() => handleTreatmentDone(schedule, slot)}
                                                                            >
                                                                                Treatment Done
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {/*{schedules.map((schedule) => (*/}
                                {/*    <div key={schedule.id} className="bg-gray-50 p-5 rounded-lg border border-gray-200 transition duration-200 ease-in-out hover:shadow-lg">*/}
                                {/*        <div className="flex items-center justify-between">*/}
                                {/*            <div className="flex items-center space-x-4">*/}
                                {/*                <Calendar className="text-blue-600" size={24} />*/}
                                {/*                <div>*/}
                                {/*                    <p className="font-bold text-gray-800 text-lg mb-1">{formatDate(schedule.date)}</p>*/}
                                {/*                    <p className="font-medium text-gray-700">*/}
                                {/*                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}*/}
                                {/*                    </p>*/}
                                {/*                    <p className="text-sm text-gray-500 mt-1">*/}
                                {/*                        {schedule.interval} minute consultation intervals*/}
                                {/*                    </p>*/}
                                {/*                </div>*/}
                                {/*            </div>*/}
                                {/*            <div className="flex items-center space-x-3">*/}
                                {/*                <button*/}
                                {/*                    onClick={() => toggleSchedule(schedule.id)}*/}
                                {/*                    className="text-gray-500 hover:text-blue-600 focus:outline-none transition duration-200 ease-in-out p-2 rounded-full hover:bg-blue-100"*/}
                                {/*                >*/}
                                {/*                    {expandedSchedule === schedule.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}*/}
                                {/*                </button>*/}
                                {/*                <button*/}
                                {/*                    onClick={() => setDeleteConfirmation({*/}
                                {/*                        scheduleId: schedule.id,*/}
                                {/*                        date: schedule.date*/}
                                {/*                    })}*/}
                                {/*                    className="text-red-500 hover:text-red-700 focus:outline-none transition duration-200 ease-in-out p-2 rounded-full hover:bg-red-100"*/}
                                {/*                >*/}
                                {/*                    <Trash2 size={24} />*/}
                                {/*                </button>*/}
                                {/*            </div>*/}
                                {/*        </div>*/}
                                {/*        /!* ... rest of the JSX remains the same ... *!/*/}
                                {/*    </div>*/}
                                {/*))}*/}

                            </div>
                        )}
                    </div>
                </div>
            </div>

            {message && (
                <div
                    className={`mt-8 p-4 rounded-lg text-center ${
                        status === "success"
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : status === "error"
                                ? "bg-red-100 text-red-800 border border-red-300"
                                : "bg-blue-100 text-blue-800 border border-blue-300"
                    }`}
                >
                    <div className="flex items-center justify-center">
                        {status === "success" ? (
                            <Check className="mr-2 text-green-500" size={20} />
                        ) : status === "error" ? (
                            <AlertCircle className="mr-2 text-red-500" size={20} />
                        ) : (
                            <Clock className="mr-2 text-blue-500" size={20} />
                        )}
                        <span className="font-medium">{message}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default DoctorScheduleManager


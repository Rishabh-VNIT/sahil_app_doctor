import React, { useState } from 'react'
import { Trash2, Plus, Calendar, Clock, ChevronDown, ChevronUp, AlertCircle, Check, X } from 'lucide-react'

const DoctorScheduleManager = () => {
    const [scheduleForm, setScheduleForm] = useState({ startTime: "", endTime: "", interval: "" })
    const [message, setMessage] = useState("")
    const [status, setStatus] = useState("idle")
    const [schedules, setSchedules] = useState([])
    const [expandedSchedule, setExpandedSchedule] = useState(null)
    const [expandedSlot, setExpandedSlot] = useState(null)

    const handleSubmit = (e) => {
        e.preventDefault()
        // Implement your submit logic here
        const newSchedule = {
            ...scheduleForm,
            createdAt: new Date().toISOString(),
            timeSlots: generateTimeSlots(scheduleForm.startTime, scheduleForm.endTime, parseInt(scheduleForm.interval))
        }
        setSchedules([...schedules, newSchedule])
        setScheduleForm({ startTime: "", endTime: "", interval: "" })
    }

    const generateTimeSlots = (start, end, intervalMinutes) => {
        const slots = []
        const startDate = new Date(`2000-01-01T${start}`)
        const endDate = new Date(`2000-01-01T${end}`)
        let currentSlot = new Date(startDate)

        while (currentSlot < endDate) {
            const slotStart = currentSlot.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })

            currentSlot = new Date(currentSlot.getTime() + intervalMinutes * 60000)

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
                })

            slots.push({
                start: slotStart,
                end: slotEnd,
                booked: Math.random() < 0.3, // 30% chance of being booked for demonstration
                patient: {
                    name: "John Doe",
                    phone: "123-456-7890",
                    gender: "Male",
                    email: "john@example.com",
                    dob: "1990-01-01"
                },
                status: Math.random() < 0.5 ? "Accepted" : "Rejected" // Randomly assign status for demonstration
            })
        }

        return slots
    }

    const toggleSchedule = (createdAt) => {
        setExpandedSchedule(expandedSchedule === createdAt ? null : createdAt)
        setExpandedSlot(null)
    }

    const toggleSlot = (scheduleIndex, slotIndex) => {
        setExpandedSlot(expandedSlot && expandedSlot.scheduleIndex === scheduleIndex && expandedSlot.slotIndex === slotIndex ? null : { scheduleIndex, slotIndex })
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
                                    <div key={schedule.createdAt} className="bg-gray-50 p-4 rounded-md border border-gray-200 transition duration-200 ease-in-out hover:shadow-md">
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
                                                    onClick={() => toggleSchedule(schedule.createdAt)}
                                                    className="text-gray-500 hover:text-blue-500 focus:outline-none transition duration-200 ease-in-out"
                                                >
                                                    {expandedSchedule === schedule.createdAt ? (
                                                        <ChevronUp size={20} />
                                                    ) : (
                                                        <ChevronDown size={20} />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSchedules(schedules.filter(s => s.createdAt !== schedule.createdAt))
                                                    }}
                                                    className="text-red-500 hover:text-red-700 focus:outline-none transition duration-200 ease-in-out"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                        {expandedSchedule === schedule.createdAt && (
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
                                                    expandedSlot.scheduleIndex === scheduleIndex && (
                                                        <div className="bg-white p-4 rounded-md border border-gray-200 shadow-md">
                                                            <h3 className="text-lg font-semibold mb-2">Appointment Details</h3>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <p><strong>Name:</strong> {schedule.timeSlots[expandedSlot.slotIndex].patient.name}</p>
                                                                <p><strong>Phone:</strong> {schedule.timeSlots[expandedSlot.slotIndex].patient.phone}</p>
                                                                <p><strong>Gender:</strong> {schedule.timeSlots[expandedSlot.slotIndex].patient.gender}</p>
                                                                <p><strong>Email:</strong> {schedule.timeSlots[expandedSlot.slotIndex].patient.email}</p>
                                                                <p><strong>DOB:</strong> {schedule.timeSlots[expandedSlot.slotIndex].patient.dob}</p>
                                                                <p><strong>Status:</strong> {schedule.timeSlots[expandedSlot.slotIndex].status}</p>
                                                            </div>
                                                            <div className="mt-4 flex justify-end space-x-2">
                                                                <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
                                                                    <Check size={16} className="mr-2 inline-block" />
                                                                    Accept
                                                                </button>
                                                                <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
                                                                    <X size={16} className="mr-2 inline-block" />
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
                            <Calendar className="mr-2 text-green-500" />
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
    )
}

export default DoctorScheduleManager


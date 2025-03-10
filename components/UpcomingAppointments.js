import React, {useEffect, useState} from "react"
import {auth, db} from "@/firebase/config"
import {collection, doc, getDoc, getDocs, updateDoc, addDoc, serverTimestamp} from "firebase/firestore"

const UpcomingAppointments = ({ setUpcomingAppointmentsCount }) => {
    const [upcomingAppointments, setUpcomingAppointments] = useState([])
    const [user, setUser] = useState(null)

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUser(user)
                fetchUpcomingAppointments(user.hospitalUid)
            }
        })

        return () => unsubscribe()
    }, [])

    const handleAppointmentAction = async (scheduleId, slotStart, action) => {
        try {
            // Reference to the specific doctor's schedule document
            const scheduleRef = doc(db, `hospitals/${hospital.uid}/schedules/${scheduleId}`);

            // Fetch the current schedule document
            const scheduleSnapshot = await getDoc(scheduleRef);
            const scheduleData = scheduleSnapshot.data();

            // Find the specific time slot
            const targetSlot = scheduleData.timeSlots.find(slot => slot.start === slotStart);
            if (!targetSlot) {
                throw new Error("Time slot not found");
            }

            // Find and update the specific time slot
            const updatedTimeSlots = scheduleData.timeSlots.map(slot => {
                if (slot.start === slotStart) {
                    return {
                        ...slot,
                        booked: false,
                        patient: null,
                        status: null,
                        description: null,
                        cancelled: [...(slot.cancelled || []), slot.patient]
                    };
                }
                return slot;
            });

            // Update the schedule document with modified time slots
            await updateDoc(scheduleRef, {
                timeSlots: updatedTimeSlots
            });

            // Save rejection details to doctor_rejections collection
            await addDoc(collection(db, 'doctor_rejections'), {
                doctorId: user.uid,
                scheduleId: scheduleId,
                slotStart: slotStart,
                slotEnd: targetSlot.end,
                patientId: targetSlot.patient,
                patientName: targetSlot.patientName,
                rejectionTime: serverTimestamp(),
                rejectionReason: 'Doctor Cancelled',
                appointmentType: scheduleData.type || 'Regular',
                originalBookingTime: targetSlot.bookingTime || null,
                specialization: user.specialization || null,
                clinic: user.clinic || null,
                status: 'Rejected'
            });

            // Refresh appointments after cancellation
            console.log(user.hospitalUid)
            fetchUpcomingAppointments(user.hospitalUid);
        } catch (error) {
            console.error("Error handling appointment:", error);
        }
    };

    const fetchUpcomingAppointments = async (doctorId) => {
        try {
            console.log("doctorId", doctorId)
            const schedulesRef = collection(db, `hospitals/${doctorId}/schedules`)
            const schedulesSnapshot = await getDocs(schedulesRef)
            const bookedAppointments = []
            console.log(schedulesSnapshot.docs)
            for (const scheduleDoc of schedulesSnapshot.docs) {
                const scheduleData = scheduleDoc.data()
                const timeSlots = scheduleData.timeSlots || []
                for (const slot of timeSlots) {
                    if (slot.booked) {
                        console.log("Hai kuch booked")
                        const patientId = slot.patient
                        const userRef = doc(db, "users", patientId)
                        const userSnapshot = await getDoc(userRef)

                        let patientName = ""
                        if (userSnapshot.exists()) {
                            patientName = userSnapshot.data().name
                        }

                        bookedAppointments.push({
                            id: `${scheduleDoc.id}-${slot.start}`,
                            date: scheduleData.date,
                            ...slot,
                            scheduleId: scheduleDoc.id,
                            patientName: patientName || "Unknown Patient",
                        })
                    }
                }
            }

            const sortedAppointments = bookedAppointments.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.start}`)
                const dateB = new Date(`${b.date}T${b.start}`)
                return dateA - dateB
            })

            setUpcomingAppointments(sortedAppointments)
            setUpcomingAppointmentsCount(sortedAppointments.length)
        } catch (error) {
            console.error("Error fetching upcoming appointments:", error)
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4">Upcoming Appointments</h2>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="py-2 px-4 text-left">Date</th>
                        <th className="py-2 px-4 text-left">Time</th>
                        <th className="py-2 px-4 text-left">Patient Name</th>
                        <th className="py-2 px-4 text-left">Status</th>
                        <th className="py-2 px-4 text-left">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {upcomingAppointments.map((appointment, index) => (
                        <tr key={appointment.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                            <td className="py-2 px-4">{appointment.date}</td>
                            <td className="py-2 px-4">
                                {appointment.start} - {appointment.end}
                            </td>
                            <td className="py-2 px-4">{appointment.patientName}</td>
                            <td className="py-2 px-4">
                                <span
                                    className={`px-2 py-1 rounded-full text-sm ${
                                        appointment.status === "Confirmed"
                                            ? "bg-green-100 text-green-800"
                                            : appointment.status === "Pending"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : appointment.status === "Accepted"
                                                    ? "bg-blue-100 text-blue-800"
                                                    : "bg-red-100 text-red-800"
                                    }`}
                                >
                                    {appointment.status}
                                </span>
                            </td>
                            <td className="py-2 px-4">
                                <button
                                    onClick={() => handleAppointmentAction(appointment.scheduleId, appointment.start, "cancel")}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                                >
                                    Cancel
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default UpcomingAppointments

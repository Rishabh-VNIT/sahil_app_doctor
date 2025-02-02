import { useState, useEffect } from "react"
import { db } from "@/firebase/config"
import { doc, getDoc } from "firebase/firestore"
import { User, Mail, Calendar, Phone, FileText, Loader2, UserPlus } from "lucide-react"
import { motion } from "framer-motion"

const InfoItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start space-x-3 group">
        <div className="bg-gray-100 rounded-full p-2 group-hover:bg-blue-100 transition-colors duration-200">
            <Icon className="w-5 h-5 text-gray-500 group-hover:text-blue-500 transition-colors duration-200" />
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="text-gray-800">{value}</p>
        </div>
    </div>
)

export default function PatientSearch({ uid, description, patientName }) {
    const [patient, setPatient] = useState(null)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!uid) {
            setError("Please provide a valid UID")
            return
        }
        setError(null)
        handleSearch()
    }, [uid])

    const handleSearch = async () => {
        try {
            const docRef = doc(db, "users", uid)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                setPatient(docSnap.data())
            } else {
                setError("No patient found with this UID")
            }
        } catch (err) {
            setError("Error fetching patient data")
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
        >
            {error && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm mb-4 p-2 bg-red-50 rounded-md"
                >
                    {error}
                </motion.div>
            )}

            {!patient && !error && (
                <div className="flex items-center justify-center h-32">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                </div>
            )}

            {patient && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-4">
                    <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                        <div className="bg-blue-100 rounded-full p-3">
                            <User className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800">{patientName}</h2>
                            <p className="text-sm text-gray-500">Patient</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
                        <div className="bg-green-100 rounded-full p-3">
                            <UserPlus className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <h2 className="text-lg font-medium text-gray-800">{patient.name}</h2>
                            <p className="text-sm text-gray-500">Booked by</p>
                        </div>
                    </div>
                    <InfoItem icon={Mail} label="Email" value={patient.email} />
                    <InfoItem icon={Calendar} label="Date of Birth" value={patient.dob} />
                    <InfoItem icon={Phone} label="Phone" value={patient.phone} />
                    {description && <InfoItem icon={FileText} label="Description" value={description} />}
                </motion.div>
            )}
        </motion.div>
    )
}


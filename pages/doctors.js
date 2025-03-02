import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/router"
import { auth, db } from "@/firebase/config"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import withAuth from "../utils/withAuth"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"
import HospitalDetails from "@/components/HospitalDetails"
import HospitalAssociation from "@/components/HospitalAssociation"
import { Menu, Layout } from "lucide-react"

const HospitalManagement = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const router = useRouter()
    const [isClient, setIsClient] = useState(false)
    const [user, setUser] = useState(null)
    const [hospitalUid, setHospitalUid] = useState(null)
    const [doctorUid, setDoctorUid] = useState(null)
    const [doctorDetails, setDoctorDetails] = useState(null)
    const [loading, setLoading] = useState(true)
    const topRef = useRef(null)

    useEffect(() => {
        setIsClient(true)
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                setUser(currentUser)
                fetchDoctorUid(currentUser.uid)
            } else {
                router.push("/signin")
            }
        })
        return () => unsubscribe()
    }, [router])

    const fetchDoctorUid = async (userId) => {
        setLoading(true)
        try {
            const hospitalRef = doc(db, `hospitals/${userId}`)
            const hospitalSnap = await getDoc(hospitalRef)

            if (hospitalSnap.exists() && hospitalSnap.data().doctorUid) {
                const docUid = hospitalSnap.data().doctorUid
                setDoctorUid(docUid)
                fetchDoctorDetails(docUid)
            } else {
                setDoctorUid(null)
            }
        } catch (error) {
            console.error("Error fetching doctorUid:", error)
        }
        setLoading(false)
    }

    const fetchDoctorDetails = async (docUid) => {
        try {
            const doctorRef = doc(db, `doctors/${docUid}`)
            const doctorSnap = await getDoc(doctorRef)

            if (doctorSnap.exists()) {
                setDoctorDetails(doctorSnap.data())
            } else {
                setDoctorDetails(null)
            }
        } catch (error) {
            console.error("Error fetching doctor details:", error)
        }
    }

    const unlinkDoctor = async () => {
        if (!user) return
        try {
            const hospitalRef = doc(db, `hospitals/${user.uid}`)
            await updateDoc(hospitalRef, { doctorUid: null }) // Remove doctor association
            setDoctorUid(null)
            setDoctorDetails(null)
            console.log("Doctor unlinked successfully")
        } catch (error) {
            console.error("Error unlinking doctor:", error)
        }
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    if (!isClient || loading) {
        return <p>Loading...</p>
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                onDashboardClick={() => router.push("/dashboard")}
                onHospitalManagementClick={() => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
            />
            <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
                <Navbar toggleSidebar={toggleSidebar} user={user} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <div ref={topRef} className="container mx-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-3xl font-semibold text-gray-800">Hospital Management</h1>
                            <button
                                onClick={toggleSidebar}
                                className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring"
                            >
                                {isSidebarOpen ? <Menu /> : <Layout />}
                            </button>
                        </div>

                        {/* Doctor Info Section */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            {doctorUid ? (
                                doctorDetails ? (
                                    <div>
                                        <h2 className="text-xl font-semibold">Editing fields of this doctor</h2>
                                        <p className="text-lg font-bold">{doctorDetails.fullName || "N/A"}</p>
                                        <p className="text-gray-600">{doctorDetails.email || "N/A"}</p>
                                        <p className="text-gray-600">{doctorDetails.specialization || "N/A"}</p>
                                        <button
                                            onClick={unlinkDoctor}
                                            className="mt-4 px-4 py-2 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600"
                                        >
                                            Unlink Doctor
                                        </button>
                                    </div>
                                ) : (
                                    <p>Loading doctor details...</p>
                                )
                            ) : (
                                <p className="text-red-500 font-semibold">Please select a doctor first before making schedules.</p>
                            )}
                        </div>

                        {/* Hospital Details or Association */}
                        {hospitalUid ? (
                            <HospitalDetails
                                user={user}
                                hospitalUid={hospitalUid}
                                userId={user?.uid}
                                refreshHospitalData={() => setHospitalUid(null)}
                            />
                        ) : (
                            <HospitalAssociation user={user} setDoctorUid={setHospitalUid} hospitalUid={hospitalUid}/>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default withAuth(HospitalManagement)

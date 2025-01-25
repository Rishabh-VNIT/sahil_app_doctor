import React, { useState, useEffect, useRef } from "react"
import { useRouter } from "next/router"
import { auth } from "@/firebase/config"
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
    const topRef = useRef(null)

    useEffect(() => {
        setIsClient(true)
        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser)
            } else {
                router.push("/signin")
            }
        })
        return () => unsubscribe()
    }, [router])

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    if (!isClient) {
        return null
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
                        {hospitalUid ? (
                            <HospitalDetails
                                hospitalUid={hospitalUid}
                                userId={user?.uid}
                                refreshHospitalData={() => setHospitalUid(null)}
                            />
                        ) : (
                            <HospitalAssociation user={user} setHospitalUid={setHospitalUid} />
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default withAuth(HospitalManagement)


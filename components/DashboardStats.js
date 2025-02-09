"use client"

import { useState, useEffect } from "react"
import { UserIcon, Users, ClipboardList, Loader2 } from "lucide-react"
import { collection, doc, getDoc, getDocs } from "firebase/firestore"
import { db, auth } from "@/firebase/config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

const DashboardStats = ({ user, totalSchedules }) => {
    const [totalDoctors, setTotalDoctors] = useState(0)
    const [totalUsers, setTotalUsers] = useState(0)
    const [doctorDetails, setDoctorDetails] = useState(null)
    const [doctorUid, setDoctorUid] = useState(null)
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setCurrentUser(user)
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    useEffect(() => {
        const fetchTotalCounts = async () => {
            try {
                const doctorsSnapshot = await getDocs(collection(db, "doctors"))
                const usersSnapshot = await getDocs(collection(db, "users"))
                setTotalDoctors(doctorsSnapshot.size)
                setTotalUsers(usersSnapshot.size)
            } catch (error) {
                console.error("Error fetching total counts:", error)
            }
        }

        const fetchDoctorDetails = async () => {
            if (!currentUser) return

            try {
                const hospitalRef = doc(db, "hospitals", currentUser.uid)
                const hospitalSnap = await getDoc(hospitalRef)

                if (hospitalSnap.exists() && hospitalSnap.data().doctorUid) {
                    const doctorId = hospitalSnap.data().doctorUid
                    setDoctorUid(doctorId)

                    const doctorRef = doc(db, "doctors", doctorId)
                    const doctorSnap = await getDoc(doctorRef)

                    if (doctorSnap.exists()) {
                        setDoctorDetails(doctorSnap.data())
                    }
                } else {
                    setDoctorUid(null)
                    setDoctorDetails(null)
                }
            } catch (error) {
                console.error("Error fetching doctor details:", error)
            }
        }

        if (!loading) {
            fetchTotalCounts()
            fetchDoctorDetails()
        }
    }, [currentUser, loading])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard icon={UserIcon} title="Total Doctors" value={totalDoctors} color="text-blue-500" />
            <StatCard icon={Users} title="Total Users" value={totalUsers} color="text-green-500" />
            <StatCard icon={ClipboardList} title="Total Schedules" value={totalSchedules} color="text-red-500" />
            <DoctorDetailsCard doctorUid={doctorUid} doctorDetails={doctorDetails} />
        </div>
    )
}

const StatCard = ({ icon: Icon, title, value, color }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-4 w-4 ${color}`} />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
        </CardContent>
    </Card>
)

const DoctorDetailsCard = ({ doctorUid, doctorDetails }) => (
    <Card className="col-span-full lg:col-span-2">
        <CardHeader>
            <CardTitle>Doctor Details</CardTitle>
        </CardHeader>
        <CardContent>
            {doctorUid ? (
                doctorDetails ? (
                    <div className="flex items-center space-x-4">
                        <Avatar className="h-20 w-20">
                            <AvatarImage src={doctorDetails.photoURL} alt={doctorDetails.fullName} />
                            <AvatarFallback>{doctorDetails.fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-lg font-semibold">{doctorDetails.fullName}</h3>
                            <p className="text-sm text-muted-foreground">{doctorDetails.email}</p>
                            <p className="text-sm text-muted-foreground">{doctorDetails.specialty}</p>
                            <p className="text-sm text-muted-foreground">{doctorDetails.experienceInYears} years experience</p>
                        </div>
                    </div>
                ) : (
                    <DoctorDetailsSkeleton />
                )
            ) : (
                <p className="text-red-500 font-semibold">Please select a doctor first before making schedules.</p>
            )}
        </CardContent>
    </Card>
)

const DoctorDetailsSkeleton = () => (
    <div className="flex items-center space-x-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[100px]" />
        </div>
    </div>
)

export default DashboardStats


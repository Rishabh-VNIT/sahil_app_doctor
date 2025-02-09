import React, { useState, useEffect } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/firebase/config"
import HospitalImageUploadModal from "@/components/HospitalImageUploadModal"
import { Camera, Edit, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {states} from "@/lib/constants"

const HospitalDetails = ({ hospitalUid, userId, refreshHospitalData, user }) => {
    const [hospital, setHospital] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editedHospital, setEditedHospital] = useState({})
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [availableCities, setAvailableCities] = useState([])
    const [doctorDetails, setDoctorDetails] = useState("default")

    useEffect(() => {
        const fetchHospitalDetails = async () => {
            try {
                const hospitalRef = doc(db, "doctors", hospitalUid)
                const hospitalSnapshot = await getDoc(hospitalRef)

                if (hospitalSnapshot.exists()) {
                    // const hospitalData = hospitalSnapshot.data()
                    // setHospital(hospitalData)
                    const hospitalData = hospitalSnapshot.data();
                    const hospitalId = hospitalSnapshot.id; // Extract UID

                    setHospital({ ...hospitalData, uid: hospitalId });
                    setEditedHospital(hospitalData)
                    updateAvailableCities(hospitalData.state)
                }
            } catch (error) {
                console.error("Error fetching hospital details:", error)
            }
        }

        fetchHospitalDetails()


        const fetchDoctorDetails = async () => {
            if (user?.uid) {
                const docRef = doc(db, "doctors", user.uid)
                const docSnap = await getDoc(docRef)
                console.log(docSnap.data())
                if (docSnap.exists()) {
                    setDoctorDetails(docSnap.data())
                }
            }
        }
        fetchDoctorDetails()
    }, [hospitalUid])

    const updateAvailableCities = (stateName) => {
        const selectedState = states.find((state) => state.name === stateName)
        setAvailableCities(selectedState ? selectedState.cities : [])
    }

    const handleEditToggle = () => {
        if (!isEditing) {
            setEditedHospital({ ...hospital })
        }
        setIsEditing(!isEditing)
    }

    const handleUnlinkHospital = async () => {
        try {
            if (!user?.uid) {
                console.error("User ID not found!")
                return
            }
            console.log(user.uid)
            const hospitalRef = doc(db, "doctors", user.uid)

            // Step 1: Remove the field completely
            await updateDoc(hospitalRef, {
                doctorUid: null,
            })

            console.log("Doctor unlinked from hospital successfully!")
            refreshHospitalData()
        } catch (error) {
            console.error("Error unlinking hospital:", error)
        }
    }


    const handleLinkHospital = async () => {
        try {
            console.log(userId  )
            const userRef = doc(db, "hospitals", userId)
            await updateDoc(userRef, {
                doctorUid : hospitalUid
            })

            refreshHospitalData()
        } catch (error) {
            console.error("Error linking hospital:", error)
        }
    }

    const handleSaveHospital = async (e) => {
        e.preventDefault()
        try {
            const hospitalRef = doc(db, "doctors", hospitalUid)
            await updateDoc(hospitalRef, editedHospital)

            setHospital(editedHospital)
            setIsEditing(false)
        } catch (error) {
            console.error("Error updating hospital:", error)
        }
    }

    const handleImageUpload = async (file) => {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("upload_preset", "unsigned_preset")
        formData.append("cloud_name", "dkqzg1ouo")

        try {
            const response = await fetch("https://api.cloudinary.com/v1_1/dkqzg1ouo/image/upload", {
                method: "POST",
                body: formData,
            })
            const data = await response.json()
            if (data.secure_url) {
                const updatedHospital = {
                    ...editedHospital,
                    profileImage: data.secure_url,
                }
                setEditedHospital(updatedHospital)
                setHospital(updatedHospital)
                await updateDoc(doc(db, "doctors", hospitalUid), { profileImage: data.secure_url })
            }
        } catch (error) {
            console.error("Error uploading image to Cloudinary:", error)
        }
    }

    const handleInputChange = (field, value) => {
        let updatedValue = value;

        // Convert specific fields to numbers
        if (["experienceInYears", "consultationFees", "medicalLicenseNumber"].includes(field)) {
            updatedValue = value === "" ? "" : Number(value);
            if (isNaN(updatedValue)) return; // Prevent invalid number inputs
        }

        setEditedHospital((prev) => ({ ...prev, [field]: updatedValue }));

        if (field === "state") {
            updateAvailableCities(value);
            setEditedHospital((prev) => ({ ...prev, city: "" }));
        }
    };


    if (!hospital) return <div className="flex items-center justify-center h-screen">Loading...</div>

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Doctor Details</h2>
                    <div>
                        <Button onClick={handleEditToggle} variant={isEditing ? "destructive" : "default"} className="mr-2">
                            {isEditing ? <X className="mr-2" /> : <Edit className="mr-2" />}
                            {isEditing ? "Cancel" : "Edit"}
                        </Button>
                        {!isEditing && (
                            doctorDetails.doctorUid === hospital.uid ?
                            <Button onClick={handleUnlinkHospital} variant="outline">
                                Unlink Doctor
                            </Button> :
                                <Button onClick={handleLinkHospital} variant="outline">
                                    Link Doctor
                                </Button>

                        )}
                    </div>
                </div>

                <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer mb-4">
                        <img
                            src={editedHospital?.profileImage || "/default-hospital.png"}
                            alt="Hospital"
                            className="w-48 h-48 rounded-lg shadow-md object-cover"
                        />
                        <div
                            className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                            onClick={() => setIsImageModalOpen(true)}
                        >
                            <div className="text-center">
                                <Camera className="w-8 h-8 mx-auto mb-2" />
                                <span className="text-sm">Change Image</span>
                            </div>
                        </div>
                    </div>
                </div>

                {isEditing ? (
                    <form onSubmit={handleSaveHospital} className="space-y-6">
                        <div>
                            <Label htmlFor="name">Hospital Name</Label>
                            <Input
                                id="fullName"
                                value={editedHospital.fullName}
                                onChange={(e) => handleInputChange("fullName", e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={editedHospital.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="specialty">Speciality</Label>
                            <Input
                                id="specialty"
                                value={editedHospital.specialty}
                                onChange={(e) => handleInputChange("specialty", e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="experienceInYears">Experience In Years</Label>
                            <Input
                                id="experienceInYears"
                                value={editedHospital.experienceInYears}
                                onChange={(e) => handleInputChange("experienceInYears", e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="consultationFees">Consultation Fees</Label>
                            <Input
                                id="consultationFees"
                                value={editedHospital.consultationFees}
                                onChange={(e) => handleInputChange("consultationFees", e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="medicalLicenseNumber">Medical License Number</Label>
                            <Input
                                id="medicalLicenseNumber"
                                value={editedHospital.medicalLicenseNumber}
                                onChange={(e) => handleInputChange("medicalLicenseNumber", e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="about">About</Label>
                            <Input
                                id="about"
                                value={editedHospital.about}
                                onChange={(e) => handleInputChange("about", e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                value={editedHospital.address}
                                onChange={(e) => handleInputChange("address", e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="state">State</Label>
                            <Select value={editedHospital.state}
                                    onValueChange={(value) => handleInputChange("state", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select State"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {states.map((state) => (
                                        <SelectItem key={state.name} value={state.name}>
                                            {state.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="city">City</Label>
                            <Select
                                value={editedHospital.city}
                                onValueChange={(value) => handleInputChange("city", value)}
                                disabled={!editedHospital.state}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select City"/>
                                </SelectTrigger>
                                <SelectContent>
                                    {availableCities.map((city) => (
                                        <SelectItem key={city} value={city}>
                                            {city}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button type="submit" className="w-full">
                            <Save className="mr-2"/>
                            Save Changes
                        </Button>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <Label className="text-gray-600">Doctor Name</Label>
                            <p className="text-xl font-medium">{hospital.fullName}</p>
                        </div>
                        <div>
                            <Label className="text-gray-600">Email</Label>
                            <p className="text-xl font-medium">{hospital.email}</p>
                        </div>
                        <div>
                            <Label className="text-gray-600">Specialty</Label>
                            <p className="text-xl font-medium">{hospital.specialty}</p>
                        </div>
                        <div>
                            <Label className="text-gray-600">Experience (Years)</Label>
                            <p className="text-xl font-medium">{hospital.experienceInYears}</p>
                        </div>
                        <div>
                            <Label className="text-gray-600">Consultation Fees (₹)</Label>
                            <p className="text-xl font-medium">{hospital.consultationFees}</p>
                        </div>
                        <div>
                            <Label className="text-gray-600">Medical License Number</Label>
                            <p className="text-xl font-medium">{hospital.medicalLicenseNumber}</p>
                        </div>
                        <div>
                            <Label className="text-gray-600">About</Label>
                            <p className="text-xl font-medium">{hospital.about}</p>
                        </div>

                        <div>
                            <Label className="text-gray-600">Address</Label>
                            <p className="text-xl font-medium">{hospital.address}</p>
                        </div>
                        <div>
                            <Label className="text-gray-600">State</Label>
                            <p className="text-xl font-medium">{hospital.state}</p>
                        </div>
                        <div>
                            <Label className="text-gray-600">City</Label>
                            <p className="text-xl font-medium">{hospital.city}</p>
                        </div>
                    </div>
                )}
            </div>

            <HospitalImageUploadModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                onUpload={handleImageUpload}
            />
        </div>
    )
}

export default HospitalDetails


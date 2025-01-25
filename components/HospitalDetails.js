import React, { useState, useEffect } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/firebase/config"
import HospitalImageUploadModal from "@/components/HospitalImageUploadModal"
import { Camera, Edit, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const states = [
    { name: "Andhra Pradesh", cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati", "Kakinada", "Rajahmundry", "Eluru"] },
    { name: "Arunachal Pradesh", cities: ["Itanagar", "Naharlagun", "Tawang", "Ziro", "Aalo", "Bomdila", "Tezu"] },
    { name: "Assam", cities: ["Guwahati", "Jorhat", "Silchar", "Dibrugarh", "Tinsukia", "Nagaon", "Bongaigaon", "Tezpur"] },
    { name: "Bihar", cities: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Munger", "Darbhanga", "Saharsa", "Purnia"] },
    { name: "Chhattisgarh", cities: ["Raipur", "Bilaspur", "Durg", "Korba", "Raigarh", "Jagdalpur", "Ambikapur", "Rajim"] },
    { name: "Goa", cities: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Quepem", "Cortalim", "Canacona"] },
    { name: "Gujarat", cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Gandhinagar", "Anand", "Junagadh"] },
    { name: "Haryana", cities: ["Chandigarh", "Faridabad", "Gurugram", "Ambala", "Panipat", "Karnal", "Hisar", "Rohtak"] },
    { name: "Himachal Pradesh", cities: ["Shimla", "Manali", "Kullu", "Dharamsala", "Kangra", "Mandi", "Solan", "Bilaspur"] },
    { name: "Jharkhand", cities: ["Ranchi", "Jamshedpur", "Dhanbad", "Hazaribagh", "Bokaro", "Giridih", "Chaibasa", "Deoghar"] },
    { name: "Karnataka", cities: ["Bangalore", "Mysore", "Mangalore", "Hubli", "Belgaum", "Bijapur", "Gulbarga", "Shimoga"] },
    { name: "Kerala", cities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur", "Kannur", "Palakkad", "Alappuzha"] },
    { name: "Madhya Pradesh", cities: ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Ratlam", "Satna"] },
    { name: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Kolhapur", "Solapur"] },
    { name: "Manipur", cities: ["Imphal", "Thoubal", "Churachandpur", "Bishnupur", "Ukhrul", "Senapati", "Chandel"] },
    { name: "Meghalaya", cities: ["Shillong", "Tura", "Jowai", "Nongstoin", "Williamnagar", "Nartiang"] },
    { name: "Mizoram", cities: ["Aizawl", "Lunglei", "Champhai", "Siaha", "Serchhip", "Lawngtlai"] },
    { name: "Nagaland", cities: ["Kohima", "Dimapur", "Mokokchung", "Wokha", "Zunheboto", "Phek"] },
    { name: "Odisha", cities: ["Bhubaneswar", "Cuttack", "Berhampur", "Rourkela", "Sambalpur", "Balasore", "Bargarh", "Jeypore"] },
    { name: "Punjab", cities: ["Chandigarh", "Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda", "Moga", "Hoshiarpur"] },
    { name: "Rajasthan", cities: ["Jaipur", "Udaipur", "Jodhpur", "Kota", "Ajmer", "Bikaner", "Alwar", "Bhilwara"] },
    { name: "Sikkim", cities: ["Gangtok", "Namchi", "Mangan", "Pakyong", "Rangpo"] },
    { name: "Tamil Nadu", cities: ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Tirunelveli", "Erode", "Vellore"] },
    { name: "Telangana", cities: ["Hyderabad", "Warangal", "Khammam", "Karimnagar", "Nizamabad", "Mahabubnagar", "Nalgonda"] },
    { name: "Tripura", cities: ["Agartala", "Udaipur", "Dharmanagar", "Sabroom", "Kailasahar"] },
    { name: "Uttar Pradesh", cities: ["Lucknow", "Kanpur", "Agra", "Varanasi", "Allahabad", "Meerut", "Ghaziabad", "Bareilly"] },
    { name: "Uttarakhand", cities: ["Dehradun", "Haridwar", "Nainital", "Rishikesh", "Haldwani", "Roorkee"] },
    { name: "West Bengal", cities: ["Kolkata", "Siliguri", "Durgapur", "Asansol", "Kharagpur", "Howrah", "Burdwan", "Jalpaiguri"] },
];

const HospitalDetails = ({ hospitalUid, userId, refreshHospitalData }) => {
    const [hospital, setHospital] = useState(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editedHospital, setEditedHospital] = useState({})
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const [availableCities, setAvailableCities] = useState([])

    useEffect(() => {
        const fetchHospitalDetails = async () => {
            try {
                const hospitalRef = doc(db, "hospitals", hospitalUid)
                const hospitalSnapshot = await getDoc(hospitalRef)

                if (hospitalSnapshot.exists()) {
                    const hospitalData = hospitalSnapshot.data()
                    setHospital(hospitalData)
                    setEditedHospital(hospitalData)
                    updateAvailableCities(hospitalData.state)
                }
            } catch (error) {
                console.error("Error fetching hospital details:", error)
            }
        }

        fetchHospitalDetails()
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
            const userRef = doc(db, "doctors", userId)
            await updateDoc(userRef, {
                hospitalUid: null,
            })

            refreshHospitalData()
        } catch (error) {
            console.error("Error unlinking hospital:", error)
        }
    }

    const handleSaveHospital = async (e) => {
        e.preventDefault()
        try {
            const hospitalRef = doc(db, "hospitals", hospitalUid)
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
                await updateDoc(doc(db, "hospitals", hospitalUid), { profileImage: data.secure_url })
            }
        } catch (error) {
            console.error("Error uploading image to Cloudinary:", error)
        }
    }

    const handleInputChange = (field, value) => {
        setEditedHospital((prev) => ({ ...prev, [field]: value }))
        if (field === "state") {
            updateAvailableCities(value)
            setEditedHospital((prev) => ({ ...prev, city: "" }))
        }
    }

    if (!hospital) return <div className="flex items-center justify-center h-screen">Loading...</div>

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Hospital Details</h2>
                    <div>
                        <Button onClick={handleEditToggle} variant={isEditing ? "destructive" : "default"} className="mr-2">
                            {isEditing ? <X className="mr-2" /> : <Edit className="mr-2" />}
                            {isEditing ? "Cancel" : "Edit"}
                        </Button>
                        {!isEditing && (
                            <Button onClick={handleUnlinkHospital} variant="outline">
                                Unlink Hospital
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
                                id="name"
                                value={editedHospital.name}
                                onChange={(e) => handleInputChange("name", e.target.value)}
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
                            <Select value={editedHospital.state} onValueChange={(value) => handleInputChange("state", value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select State" />
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
                                    <SelectValue placeholder="Select City" />
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
                            <Save className="mr-2" />
                            Save Changes
                        </Button>
                    </form>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <Label className="text-gray-600">Hospital Name</Label>
                            <p className="text-xl font-medium">{hospital.name}</p>
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


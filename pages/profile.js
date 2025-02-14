import React, { useState, useEffect } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/firebase/config"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/router"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"
import ImageUploadModal from "@/components/ImageUploadModal"
import { User, Mail, MapPin, IndianRupee, Clipboard, Briefcase, Edit2, Save, X, Camera } from "lucide-react"

const states = [
    {
        name: "Andhra Pradesh",
        cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati", "Kakinada", "Rajahmundry", "Eluru"],
    },
    { name: "Arunachal Pradesh", cities: ["Itanagar", "Naharlagun", "Tawang", "Ziro", "Aalo", "Bomdila", "Tezu"] },
    {
        name: "Assam",
        cities: ["Guwahati", "Jorhat", "Silchar", "Dibrugarh", "Tinsukia", "Nagaon", "Bongaigaon", "Tezpur"],
    },
    { name: "Bihar", cities: ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Munger", "Darbhanga", "Saharsa", "Purnia"] },
    {
        name: "Chhattisgarh",
        cities: ["Raipur", "Bilaspur", "Durg", "Korba", "Raigarh", "Jagdalpur", "Ambikapur", "Rajim"],
    },
    { name: "Goa", cities: ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Quepem", "Cortalim", "Canacona"] },
    {
        name: "Gujarat",
        cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Gandhinagar", "Anand", "Junagadh"],
    },
    {
        name: "Haryana",
        cities: ["Chandigarh", "Faridabad", "Gurugram", "Ambala", "Panipat", "Karnal", "Hisar", "Rohtak"],
    },
    {
        name: "Himachal Pradesh",
        cities: ["Shimla", "Manali", "Kullu", "Dharamsala", "Kangra", "Mandi", "Solan", "Bilaspur"],
    },
    {
        name: "Jharkhand",
        cities: ["Ranchi", "Jamshedpur", "Dhanbad", "Hazaribagh", "Bokaro", "Giridih", "Chaibasa", "Deoghar"],
    },
    {
        name: "Karnataka",
        cities: ["Bangalore", "Mysore", "Mangalore", "Hubli", "Belgaum", "Bijapur", "Gulbarga", "Shimoga"],
    },
    {
        name: "Kerala",
        cities: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Kollam", "Thrissur", "Kannur", "Palakkad", "Alappuzha"],
    },
    { name: "Madhya Pradesh", cities: ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Ratlam", "Satna"] },
    { name: "Maharashtra", cities: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Thane", "Kolhapur", "Solapur"] },
    { name: "Manipur", cities: ["Imphal", "Thoubal", "Churachandpur", "Bishnupur", "Ukhrul", "Senapati", "Chandel"] },
    { name: "Meghalaya", cities: ["Shillong", "Tura", "Jowai", "Nongstoin", "Williamnagar", "Nartiang"] },
    { name: "Mizoram", cities: ["Aizawl", "Lunglei", "Champhai", "Siaha", "Serchhip", "Lawngtlai"] },
    { name: "Nagaland", cities: ["Kohima", "Dimapur", "Mokokchung", "Wokha", "Zunheboto", "Phek"] },
    {
        name: "Odisha",
        cities: ["Bhubaneswar", "Cuttack", "Berhampur", "Rourkela", "Sambalpur", "Balasore", "Bargarh", "Jeypore"],
    },
    {
        name: "Punjab",
        cities: ["Chandigarh", "Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda", "Moga", "Hoshiarpur"],
    },
    { name: "Rajasthan", cities: ["Jaipur", "Udaipur", "Jodhpur", "Kota", "Ajmer", "Bikaner", "Alwar", "Bhilwara"] },
    { name: "Sikkim", cities: ["Gangtok", "Namchi", "Mangan", "Pakyong", "Rangpo"] },
    {
        name: "Tamil Nadu",
        cities: ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Tirunelveli", "Erode", "Vellore"],
    },
    {
        name: "Telangana",
        cities: ["Hyderabad", "Warangal", "Khammam", "Karimnagar", "Nizamabad", "Mahabubnagar", "Nalgonda"],
    },
    { name: "Tripura", cities: ["Agartala", "Udaipur", "Harmanna", "Sabroom", "Kailasahar"] },
    {
        name: "Uttar Pradesh",
        cities: ["Lucknow", "Kanpur", "Agra", "Varanasi", "Allahabad", "Meerut", "Ghaziabad", "Bareilly"],
    },
    { name: "Uttarakhand", cities: ["Dehradun", "Haridwar", "Nainital", "Rishikesh", "Haldwani", "Roorkee"] },
    {
        name: "West Bengal",
        cities: ["Kolkata", "Siliguri", "Durgapur", "Asansol", "Kharagpur", "Howrah", "Burdwan", "Jalpaiguri"],
    },
]

const DoctorProfilePage = () => {
    const { user, auth } = useAuth()
    const [doctorDetails, setDoctorDetails] = useState(null)
    const [editMode, setEditMode] = useState(false)
    const [updatedDetails, setUpdatedDetails] = useState(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isImageModalOpen, setIsImageModalOpen] = useState(false)
    const router = useRouter()
    const [formData, setFormData] = useState();

    useEffect(() => {
        const fetchDoctorDetails = async () => {
            if (user?.uid) {
                const docRef = doc(db, "hospitals", user.uid)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    setDoctorDetails(docSnap.data())
                    setUpdatedDetails(docSnap.data())
                }
            }
        }
        fetchDoctorDetails()
    }, [user?.uid])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        if ((name === "consultationFees" || name === "medicalLicenseNumber") && isNaN(value)) {
            return
        }
        setUpdatedDetails((prev) => {
            if (name === "consultationFees") {
                // Convert consultationFees to a number if it's a valid value
                return {
                    ...prev,
                    [name]: value ? Number(value) : 0, // Default to 0 if value is empty
                };
            }
            if (name === "state" || name === "city") {
                return {
                    ...prev,
                    location: {
                        ...prev.location,
                        [name]: value,
                    },
                }
            }
            return {
                ...prev,
                [name]: value,
            }
        })
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
                const updatedProfile = {
                    ...updatedDetails,
                    profileImage: data.secure_url,
                }
                setFormData(updatedProfile);

                setUpdatedDetails(updatedProfile)
                setDoctorDetails(updatedProfile)
                await updateDoc(doc(db, "doctors", user.uid), { profileImage: data.secure_url })
            }
        } catch (error) {
            console.error("Error uploading image to Cloudinary:", error)
        }
    }

    const handleSaveChanges = async () => {
        try {
            await updateDoc(doc(db, "doctors", user.uid), updatedDetails)
            setDoctorDetails(updatedDetails)
            setEditMode(false)
        } catch (error) {
            console.error("Error updating doctor details:", error)
        }
    }

    const handleLogout = async () => {
        try {
            await auth.signOut()
            router.push("/signin")
        } catch (error) {
            console.error("Logout failed", error.message)
        }
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen)
    }

    if (!doctorDetails) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="text-2xl font-semibold text-gray-600">Loading...</div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onDashboardClick={() => router.push("/dashboard")} />
            <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
                <Navbar onLogout={handleLogout} toggleSidebar={toggleSidebar} user={user} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <div className="container mx-auto h-full flex flex-col">
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex-grow">
                            <div className="flex items-center justify-between mb-6">
                                <h1 className="text-3xl font-semibold text-gray-800">Doctor Profile</h1>
                                <button
                                    onClick={() => setEditMode(!editMode)}
                                    className={`flex items-center px-4 py-2 rounded-md transition-colors duration-300 ${
                                        editMode ? "bg-red-500 hover:bg-red-600 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
                                    }`}
                                >
                                    {editMode ? <X className="mr-2" /> : <Edit2 className="mr-2" />}
                                    {editMode ? "Cancel" : "Edit Profile"}
                                </button>
                            </div>
                            <div className="flex flex-col items-center mb-8">
                                <div className="relative group cursor-pointer mb-4">
                                    <img
                                        src={updatedDetails?.profileImage || "/default-avatar.png"}
                                        alt="Profile"
                                        className="w-32 h-32 rounded-full shadow-md"
                                    />
                                    <div
                                        className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                                        onClick={() => setIsImageModalOpen(true)}
                                    >
                                        <div className="text-center">
                                            <Camera className="w-6 h-6 mx-auto mb-1" />
                                            <span className="text-sm">Change Image</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { icon: User, label: "Full Name", name: "fullName" },
                                    { icon: Mail, label: "Email", name: "email" },
                                    { icon: MapPin, label: "Address", name: "address" },
                                    { icon: IndianRupee, label: "Consultation Fees", name: "consultationFees" },
                                    { icon: Clipboard, label: "Medical License Number", name: "medicalLicenseNumber" },
                                    { icon: Briefcase, label: "Practice Type", name: "practiceType" },
                                    { icon: MapPin, label: "City", name: "city" },
                                    { icon: MapPin, label: "State", name: "state" },
                                ].map((field) => (
                                    <div key={field.name} className="flex items-start">
                                        <field.icon className="h-6 w-6 text-gray-500 mr-4 mt-1" />
                                        <div className="flex-1">
                                            <h2 className="text-sm font-medium text-gray-500 mb-1">{field.label}</h2>
                                            {editMode ? (
                                                <input
                                                    name={field.name}
                                                    value={
                                                        field.name === "city" || field.name === "state"
                                                            ? updatedDetails.location[field.name]
                                                            : updatedDetails[field.name] || ""
                                                    }
                                                    onChange={handleInputChange}
                                                    className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
                                                />
                                            ) : (
                                                <p className="text-lg font-medium text-gray-800">
                                                    {field.name === "consultationFees" && "₹"}
                                                    {field.name === "city" || field.name === "state"
                                                        ? doctorDetails.location[field.name]
                                                        : doctorDetails[field.name]}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div className="flex items-start">
                                    <MapPin className="h-6 w-6 text-gray-500 mr-4 mt-1" />
                                    <div className="flex-1">
                                        <h2 className="text-sm font-medium text-gray-500 mb-1">State</h2>
                                        {editMode ? (
                                            <select
                                                name="state"
                                                value={updatedDetails.location.state || ""}
                                                onChange={(e) => handleInputChange({ target: { name: "state", value: e.target.value } })}
                                                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
                                            >
                                                <option value="">Select a state</option>
                                                {states.map((state) => (
                                                    <option key={state.name} value={state.name}>
                                                        {state.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <p className="text-lg font-medium text-gray-800">{doctorDetails.location.state}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-start">
                                    <MapPin className="h-6 w-6 text-gray-500 mr-4 mt-1" />
                                    <div className="flex-1">
                                        <h2 className="text-sm font-medium text-gray-500 mb-1">City</h2>
                                        {editMode ? (
                                            <select
                                                name="city"
                                                value={updatedDetails.location.city || ""}
                                                onChange={(e) => handleInputChange({ target: { name: "city", value: e.target.value } })}
                                                className="w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-2"
                                                disabled={!updatedDetails.location.state}
                                            >
                                                <option value="">Select a city</option>
                                                {updatedDetails.location.state &&
                                                    states
                                                        .find((s) => s.name === updatedDetails.location.state)
                                                        ?.cities.map((city) => (
                                                        <option key={city} value={city}>
                                                            {city}
                                                        </option>
                                                    ))}
                                            </select>
                                        ) : (
                                            <p className="text-lg font-medium text-gray-800">{doctorDetails.location.city}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {editMode && (
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={handleSaveChanges}
                                        className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-300"
                                    >
                                        <Save className="inline-block mr-2" />
                                        Save Changes
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
            <ImageUploadModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                onUpload={handleImageUpload}
            />
        </div>
    )
}

export default DoctorProfilePage


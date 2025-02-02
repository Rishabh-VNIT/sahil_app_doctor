import React, { useState, useEffect } from "react"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/firebase/config"
import { useAuth } from "@/lib/auth"
import { useRouter } from "next/router"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"
import { User, Mail, MapPin, IndianRupee, Clipboard, Briefcase, Edit2, Save, X, Camera } from "lucide-react"

// New Profile Image Upload Component
const ProfileImageUpload = ({ currentImage, onUpload, className = "" }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const { auth } = useAuth();

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload to Google Drive
        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const accessToken = await auth.currentUser.getIdToken();
            formData.append("access_token", accessToken);

            const response = await fetch("/api/upload-profile-image", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.fileLink) {
                onUpload(data.fileLink);
                setError(null);
            } else {
                setError('Upload failed');
            }
        } catch (error) {
            setError('Upload failed: ' + error.message);
            console.error("Error uploading to Google Drive:", error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={`relative group ${className}`}>
            <img
                src={previewUrl || currentImage || "/default-avatar.png"}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover shadow-md"
            />
            <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full cursor-pointer
                            flex items-center justify-center text-white opacity-0 group-hover:opacity-100
                            transition-opacity duration-200">
                <div className="text-center">
                    {isUploading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-1" />
                    ) : (
                        <>
                            <Camera className="w-6 h-6 mx-auto mb-1" />
                            <span className="text-sm">Change Photo</span>
                        </>
                    )}
                </div>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                />
            </label>
            {error && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2
                               bg-red-500 text-white text-xs px-2 py-1 rounded">
                    {error}
                </div>
            )}
        </div>
    );
};

const DoctorProfilePage = () => {
    const { user, auth } = useAuth()
    const [doctorDetails, setDoctorDetails] = useState(null)
    const [editMode, setEditMode] = useState(false)
    const [updatedDetails, setUpdatedDetails] = useState(null)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchDoctorDetails = async () => {
            if (user?.uid) {
                const docRef = doc(db, "doctors", user.uid)
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

    // Rest of your existing code...

    // Replace the image section in your return statement with:
    const handleProfileImageUpdate = async (imageUrl) => {
        try {
            const updatedProfile = {
                ...updatedDetails,
                profileImage: imageUrl,
            };
            setUpdatedDetails(updatedProfile);
            setDoctorDetails(updatedProfile);
            await updateDoc(doc(db, "doctors", user.uid), { profileImage: imageUrl });
        } catch (error) {
            console.error("Error updating profile image:", error);
        }
    };
    if (!doctorDetails) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100">
                <div className="text-2xl font-semibold text-gray-600">Loading...</div>
            </div>
        )
    }
    // Your existing return statement, but replace the image section:
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onDashboardClick={() => router.push("/dashboard")} />
            <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
                <Navbar onLogout={handleLogout} toggleSidebar={toggleSidebar} user={user} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    <div className="container mx-auto h-full flex flex-col">
                        <div className="bg-white rounded-lg shadow-md p-6 mb-8 flex-grow">
                            {/* ... your existing header ... */}
                            <div className="flex flex-col items-center mb-8">
                                <ProfileImageUpload
                                    currentImage={updatedDetails?.profileImage}
                                    onUpload={handleProfileImageUpdate}
                                    className="mb-4"
                                />
                            </div>
                            {/* ... rest of your existing JSX ... */}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DoctorProfilePage;

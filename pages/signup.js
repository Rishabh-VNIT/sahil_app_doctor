'use client'

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth"
import { setDoc, doc } from "firebase/firestore"
import { auth, firestore } from "../firebase/config"
import { Eye, EyeOff, UserPlus, Mail } from 'lucide-react'

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

const SignUp = () => {
    const specialties = [
        "Cardiology",
        "Dermatology",
        "Neurology",
        "Pediatrics",
        "Psychiatry",
        "Radiology",
        "Surgery",
        "Orthopedics",
        "General Medicine",
        "Ophthalmology",
        "Gastroenterology",
        "Anesthesia",
        "Pathology",
        "Obstetrics and Gynecology",
        "ENT (Ear, Nose, and Throat)",
    ];

    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
        specialty: "",
        practiceType: "",
        medicalLicenseNumber: "",
        address: "",
        state: "",
        city: "",
        consultationFees: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [verificationStep, setVerificationStep] = useState("initial") // initial, emailSent
    const [verificationEmail, setVerificationEmail] = useState("")
    const router = useRouter()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleVerifyEmail = async (e) => {
        e.preventDefault()
        setError("")

        if (!formData.email) {
            setError("Please enter an email address")
            return
        }

        try {
            // Only send verification email without creating account
            setVerificationEmail(formData.email)
            setVerificationStep("emailSent")
        } catch (error) {
            setError("Failed to process email verification. Please try again.")
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        try {
            // Create user account after all details are collected
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            )

            // Send verification email
            await sendEmailVerification(userCredential.user)

            // Create user document in Firestore
            const { email, password, state, city, ...doctorData } = formData
            await setDoc(doc(firestore, "doctors", userCredential.user.uid), {
                ...doctorData,
                email: formData.email, // Store email in Firestore
                location: {
                    state,
                    city,
                },
                timestamp: new Date(),
                emailVerified: false, // Track verification status
            })

            // Show success message and instruction to verify email
            setVerificationStep("emailSent")
        } catch (error) {
            if (error.code === "auth/email-already-in-use") {
                setError("The email address is already in use. Please try with a different email.")
            } else {
                setError("Failed to create account. Please try again.")
            }
        }
    }

    // Check email verification status
    const checkVerification = async () => {
        try {
            // Reload the user to get current verification status
            await auth.currentUser?.reload()

            if (auth.currentUser?.emailVerified) {
                // Update Firestore document to mark email as verified
                await setDoc(doc(firestore, "doctors", auth.currentUser.uid),
                    { emailVerified: true },
                    { merge: true }
                )
                router.push("/dashboard")
            } else {
                setError("Please verify your email before proceeding.")
            }
        } catch (error) {
            setError("Failed to verify email status. Please try again.")
        }
    }

    // Render verification message and instructions
    if (verificationStep === "emailSent") {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-teal-100">
                <div className="bg-white shadow-2xl rounded-lg px-12 pt-10 pb-8 mb-4 max-w-md w-full">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
                        Verify Your Email
                    </h2>
                    <div className="text-center mb-6">
                        <Mail className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                        <p className="text-gray-600 mb-4">
                            Please check your email at {formData.email} and click the verification link.
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                            After verifying your email, click the button below to proceed to the dashboard.
                        </p>
                        {error && (
                            <p className="text-sm text-red-600 mb-4">
                                {error}
                            </p>
                        )}
                    </div>
                    <button
                        onClick={checkVerification}
                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        I've Verified My Email
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 py-12">
            <div className="w-full max-w-md">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-2xl rounded-lg px-12 pt-10 pb-8 mb-4"
                >
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
                        Doctor Sign-Up
                    </h2>
                    {error && (
                        <div className="mb-4 text-sm text-red-600 bg-red-100 border border-red-400 rounded p-3">
                            {error}
                        </div>
                    )}

                    {/* All form fields shown at once */}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-700"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5"/>
                                ) : (
                                    <Eye className="h-5 w-5"/>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="fullName" className="block text-gray-700 text-sm font-bold mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {/*<div className="mb-4">*/}
                    {/*    <label htmlFor="specialty" className="block text-gray-700 text-sm font-bold mb-2">*/}
                    {/*        Specialty*/}
                    {/*    </label>*/}
                    {/*    <input*/}
                    {/*        type="text"*/}
                    {/*        id="specialty"*/}
                    {/*        name="specialty"*/}
                    {/*        value={formData.specialty}*/}
                    {/*        onChange={handleChange}*/}
                    {/*        className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"*/}
                    {/*        required*/}
                    {/*    />*/}
                    {/*</div>*/}

                    <div className="mb-4">
                        <label htmlFor="specialty" className="block text-gray-700 text-sm font-bold mb-2">
                            Specialty
                        </label>
                        <select
                            id="specialty"
                            name="specialty"
                            value={formData.specialty}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            <option value="">Select a specialty</option>
                            {specialties.map((specialty, index) => (
                                <option key={index} value={specialty}>
                                    {specialty}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="practiceType" className="block text-gray-700 text-sm font-bold mb-2">
                            Practice Type
                        </label>
                        <input
                            type="text"
                            id="practiceType"
                            name="practiceType"
                            value={formData.practiceType}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="consultationFees" className="block text-gray-700 text-sm font-bold mb-2">
                            Consultation Fees (₹)
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">₹</span>
                            <input
                                type="number"
                                id="consultationFees"
                                name="consultationFees"
                                value={formData.consultationFees}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-3 px-10 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="medicalLicenseNumber" className="block text-gray-700 text-sm font-bold mb-2">
                            Medical License Number
                        </label>
                        <input
                            type="text"
                            id="medicalLicenseNumber"
                            name="medicalLicenseNumber"
                            value={formData.medicalLicenseNumber}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">
                            Address
                        </label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="state" className="block text-gray-700 text-sm font-bold mb-2">
                            State
                        </label>
                        <select
                            id="state"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        >
                            <option value="">Select a state</option>
                            {states.map((state) => (
                                <option key={state.name} value={state.name}>
                                    {state.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="city" className="block text-gray-700 text-sm font-bold mb-2">
                            City
                        </label>
                        <select
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                            disabled={!formData.state}
                        >
                            <option value="">Select a city</option>
                            {formData.state &&
                                states
                                    .find((s) => s.name === formData.state)
                                    ?.cities.map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                        </select>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                <UserPlus className="h-5 w-5 text-blue-500 group-hover:text-blue-400"/>
                            </span>
                            Sign Up
                        </button>
                    </div>
                </form>
                <p className="text-center text-gray-600 text-sm">
                    Already have an account?{" "}
                    <a href="/signin" className="font-medium text-blue-600 hover:text-blue-500">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    )
}

export default SignUp

import React, { useState, useEffect } from "react"
import { collection, query, getDocs, addDoc, doc, updateDoc } from "firebase/firestore"
import { db } from "@/firebase/config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const HospitalAssociation = ({ user, setHospitalUid }) => {
    const [existingHospitals, setExistingHospitals] = useState([])
    const [showHospitalForm, setShowHospitalForm] = useState(false)
    const [hospitalData, setHospitalData] = useState({
        name: "",
        address: "",
        state: "",
        city: "",
    })
    const [availableCities, setAvailableCities] = useState([])

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

    useEffect(() => {
        fetchExistingHospitals()
    }, [])

    const fetchExistingHospitals = async () => {
        try {
            const hospitalsQuery = query(collection(db, "hospitals"))
            const hospitalsSnapshot = await getDocs(hospitalsQuery)
            const hospitals = hospitalsSnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }))
            setExistingHospitals(hospitals)
        } catch (error) {
            console.error("Error fetching existing hospitals:", error)
        }
    }

    const handleStateChange = (selectedState) => {
        const state = states.find((s) => s.name === selectedState)
        setAvailableCities(state ? state.cities : [])
        setHospitalData((prev) => ({ ...prev, state: selectedState, city: "" }))
    }

    const handleCreateHospital = async (e) => {
        e.preventDefault()
        try {
            const hospitalRef = await addDoc(collection(db, "hospitals"), {
                ...hospitalData,
                createdBy: user.uid,
            })

            const userRef = doc(db, "doctors", user.uid)
            await updateDoc(userRef, {
                hospitalUid: hospitalRef.id,
            })

            setHospitalUid(hospitalRef.id)
        } catch (error) {
            console.error("Error creating hospital:", error)
        }
    }

    const handleSelectHospital = async (hospitalId) => {
        try {
            const userRef = doc(db, "doctors", user.uid)
            await updateDoc(userRef, {
                hospitalUid: hospitalId,
            })

            setHospitalUid(hospitalId)
        } catch (error) {
            console.error("Error selecting hospital:", error)
        }
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Hospital Association</h2>

            {!showHospitalForm ? (
                <div>
                    <p className="mb-4">You are not linked to any hospital.</p>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Existing Hospitals:</h3>
                        {existingHospitals.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {existingHospitals.map((hospital) => (
                                    <div
                                        key={hospital.id}
                                        className="border p-4 rounded-lg hover:bg-gray-100 cursor-pointer transition duration-300 ease-in-out"
                                        onClick={() => handleSelectHospital(hospital.id)}
                                    >
                                        <div className="flex items-center mb-2">
                                            <img
                                                src={hospital.profileImage || "/default-hospital.png"}
                                                alt={hospital.name}
                                                className="w-16 h-16 rounded-full object-cover mr-4"
                                            />
                                            <h4 className="font-bold text-lg">{hospital.name}</h4>
                                        </div>
                                        <p className="text-sm text-gray-600">{hospital.address}</p>
                                        <p className="text-sm text-gray-600">
                                            {hospital.city}, {hospital.state}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>No hospitals available.</p>
                        )}
                    </div>

                    <Button onClick={() => setShowHospitalForm(true)} className="w-full md:w-auto">
                        Create New Hospital
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleCreateHospital} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Hospital Name</Label>
                        <Input
                            id="name"
                            value={hospitalData.name}
                            onChange={(e) => setHospitalData((prev) => ({ ...prev, name: e.target.value }))}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            value={hospitalData.address}
                            onChange={(e) => setHospitalData((prev) => ({ ...prev, address: e.target.value }))}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="state">State</Label>
                        <Select value={hospitalData.state} onValueChange={(value) => handleStateChange(value)}>
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
                            value={hospitalData.city}
                            onValueChange={(value) => setHospitalData((prev) => ({ ...prev, city: value }))}
                            disabled={!hospitalData.state}
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

                    <div className="flex space-x-4">
                        <Button type="submit" className="flex-1">
                            Create Hospital
                        </Button>
                        <Button type="button" onClick={() => setShowHospitalForm(false)} variant="outline" className="flex-1">
                            Cancel
                        </Button>
                    </div>
                </form>
            )}
        </div>
    )
}

export default HospitalAssociation


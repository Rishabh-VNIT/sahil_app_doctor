import React, { useState, useEffect } from "react";
import { collection, query, getDocs, addDoc, doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import { auth } from "@/firebase/config";
import { db } from "@/firebase/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {specialties, states} from "@/lib/constants";

const DoctorAssociation = ({ user, setDoctorUid, doctorUid }) => {
    const [existingDoctors, setExistingDoctors] = useState([]);
    const [showDoctorForm, setShowDoctorForm] = useState(false);
    const [doctorData, setDoctorData] = useState({ fullName: "", specialty: "", experienceInYears: "" });
    const [linkedDoctor, setLinkedDoctor] = useState(null);
    // const [DoctorUid, setDoctorUid] = useState()

    useEffect(() => {
        fetchExistingDoctors();
    }, []);

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (user?.uid) {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setDoctorUid(docSnap.data().doctorUid || null);
                }
            }
        };
        fetchUserDetails();
    }, [user?.uid]);

    useEffect(() => {
        if (doctorUid) {
            const doctor = existingDoctors.find(d => d.id === doctorUid);
            setLinkedDoctor(doctor || null);
        }
    }, [doctorUid, existingDoctors]);

    const fetchExistingDoctors = async () => {
        try {
            const doctorsQuery = query(collection(db, "doctors"));
            const doctorsSnapshot = await getDocs(doctorsQuery);
            const doctors = doctorsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            console.log(doctors)
            setExistingDoctors(doctors);
        } catch (error) {
            console.error("Error fetching existing doctors:", error);
        }
    };

    const handleCreateDoctor = async (e) => {
        e.preventDefault();
        try {
            const doctorRef = await addDoc(collection(db, "doctors"), {
                ...doctorData,
                createdBy: user.uid
            });
            const userRef = doc(db, "hospitals", user.uid);
            await updateDoc(userRef, { doctorUid: doctorRef.id });
            console.log(doctorRef.id)
            setDoctorUid(doctorRef.id);
        } catch (error) {
            console.error("Error creating doctor:", error);
        }
    };

    const handleSelectDoctor = async (doctorId) => {
        try {
            const userRef = doc(db, "hospitals", user.uid);
            // await updateDoc(userRef, { doctorUid: doctorId });
            setDoctorUid(doctorId);
        } catch (error) {
            console.error("Error selecting doctor:", error);
        }
    };

    const handleDeleteDoctor = async (doctorId) => {
        try {
            // Delete doctor from Firestore
            await deleteDoc(doc(db, "doctors", doctorId));

            // If the deleted doctor was linked, remove the association
            if (doctorUid === doctorId) {
                const userRef = doc(db, "hospitals", user.uid);
                await updateDoc(userRef, { doctorUid: null });
                setDoctorUid(null);
            }

            // Remove deleted doctor from the local state
            setExistingDoctors((prevDoctors) => prevDoctors.filter((doc) => doc.id !== doctorId));

            console.log("Doctor deleted successfully!");
        } catch (error) {
            console.error("Error deleting doctor:", error);
        }
    };

    const handleLinkDoctor = async () => {
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { doctorUid: null });
            setDoctorUid(null);
            setLinkedDoctor(null);
        } catch (error) {
            console.error("Error unlinking doctor:", error);
        }
    };

    const handleUnlinkDoctor = async () => {
        try {
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { doctorUid: null });
            setDoctorUid(null);
            setLinkedDoctor(null);
        } catch (error) {
            console.error("Error unlinking doctor:", error);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Doctor Association</h2>
            {doctorUid && linkedDoctor ? (
                <div className="border p-4 rounded-lg bg-gray-100">
                    <h3 className="text-lg font-semibold">Linked Doctor</h3>
                    <p className="font-bold text-lg">{linkedDoctor.fullName}</p>
                    <p className="text-sm text-gray-600">{linkedDoctor.specialty}</p>
                    <p className="text-sm text-gray-600">{linkedDoctor.experienceInYears} years experience</p>
                    <Button onClick={handleUnlinkDoctor} variant="destructive" className="mt-4">Unlink Doctor</Button>
                </div>
            ) : (
                <div>
                    <p className="mb-4">You are not linked to any doctor.</p>
                    <Button onClick={() => setShowDoctorForm(true)} className="w-full md:w-auto">Create New Doctor</Button>
                </div>
            )}
            {!doctorUid && existingDoctors.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Select an Existing Doctor</h3>
                    <div className="space-y-2">
                        {existingDoctors.map((doctor) => (
                            <div key={doctor.id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                                <div>
                                    <p className="font-bold">{doctor.fullName}</p>
                                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                                    <p className="text-sm text-gray-600">{doctor.experienceInYears} years experience</p>
                                </div>
                                <div>
                                    <Button onClick={() => handleSelectDoctor(doctor.id)}>Select</Button>
                                    <Button onClick={() => handleDeleteDoctor(doctor.id)}>Delete</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showDoctorForm && (
                <form onSubmit={handleCreateDoctor} className="space-y-4 mt-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={doctorData.email}
                               onChange={(e) => setDoctorData({ ...doctorData, email: e.target.value })} required />
                    </div>
                    <div>
                        <Label htmlFor="fullName">Doctor Name</Label>
                        <Input id="fullName" value={doctorData.fullName}
                               onChange={(e) => setDoctorData({ ...doctorData, fullName: e.target.value })} required />
                    </div>
                    <div>
                        <Label htmlFor="specialty">Specialty</Label>
                        <Select onValueChange={(value) => setDoctorData({ ...doctorData, specialty: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a specialty" />
                            </SelectTrigger>
                            <SelectContent>
                                {specialties.map((specialty, index) => (
                                    <SelectItem key={index} value={specialty}>{specialty}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="experienceInYears">Experience (Years)</Label>
                        <Input id="experienceInYears" type="number" value={doctorData.experienceInYears}
                               onChange={(e) => setDoctorData({ ...doctorData, experienceInYears: Number(e.target.value) })} required />
                    </div>
                    <div>
                        <Label htmlFor="consultationFees">Consultation Fees (₹)</Label>
                        <Input id="consultationFees" type="number" value={doctorData.consultationFees}
                               onChange={(e) => setDoctorData({ ...doctorData, consultationFees: Number(e.target.value) })} required />
                    </div>
                    <div>
                        <Label htmlFor="medicalLicenseNumber">Medical License Number</Label>
                        <Input id="medicalLicenseNumber" value={doctorData.medicalLicenseNumber}
                               onChange={(e) => setDoctorData({ ...doctorData, medicalLicenseNumber: Number(e.target.value) })} required />
                    </div>
                    <div>
                        <Label htmlFor="about">About</Label>
                        <Input id="about" value={doctorData.about}
                               onChange={(e) => setDoctorData({ ...doctorData, about: e.target.value })} required />
                    </div>
                    <div>
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" value={doctorData.address}
                               onChange={(e) => setDoctorData({ ...doctorData, address: e.target.value })} required />
                    </div>
                    <div>
                        <Label htmlFor="state">State</Label>
                        <Select onValueChange={(value) => setDoctorData({ ...doctorData, state: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a state" />
                            </SelectTrigger>
                            <SelectContent>
                                {states.map((state) => (
                                    <SelectItem key={state.name} value={state.name}>{state.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="city">City</Label>
                        <Select onValueChange={(value) => setDoctorData({ ...doctorData, city: value })} disabled={!doctorData.state}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a city" />
                            </SelectTrigger>
                            <SelectContent>
                                {states.find((s) => s.name === doctorData.state)?.cities.map((city) => (
                                    <SelectItem key={city} value={city}>{city}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex space-x-4">
                        <Button type="submit" className="flex-1">Create Doctor</Button>
                        <Button type="button" onClick={() => setShowDoctorForm(false)} variant="outline" className="flex-1">Cancel</Button>
                    </div>
                </form>
            )}

        </div>
    );
};

export default DoctorAssociation;

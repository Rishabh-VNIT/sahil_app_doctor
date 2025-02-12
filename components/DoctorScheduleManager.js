import React, { useState, useEffect } from 'react';
import {
    Trash2, Plus, Calendar, Clock, ChevronDown, ChevronUp,
    AlertCircle, Check, X, AlertTriangle, User, Upload, Loader2, CheckCircle, XCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { db } from '@/firebase/config';
import {
    collection, query, where, getDocs, addDoc, deleteDoc,
    doc, updateDoc, getDoc, setDoc, serverTimestamp
} from 'firebase/firestore';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PatientSearch from "@/components/PatientSearch";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

const DoctorScheduleManager = ({schedules, setSchedules}) => {
    const [currentSchedule, setCurrentSchedule] = useState(null);
    const [scheduleForm, setScheduleForm] = useState({
        date: "",
        startTime: "",
        endTime: "",
        interval: ""
    });
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("idle");
    const [expandedSchedule, setExpandedSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [clashDialog, setClashDialog] = useState(null);
    const [expandedSlot, setExpandedSlot] = useState(null);
    const [rejectionDialog, setRejectionDialog] = useState(false);
    const [slotToReject, setSlotToReject] = useState(null);
    const [hospital, setHospital] = useState(null)
    const [doctorDetails, setDoctorDetails] = useState("default")

    const { user } = useAuth();

    useEffect(() => {

        const fetchDoctorAndHospitalDetails = async () => {
            // if (!user?.uid) return;

            try {
                const doctorRef = doc(db, "hospitals", user.uid);
                const doctorSnap = await getDoc(doctorRef);

                if (doctorSnap.exists()) {
                    const doctorData = doctorSnap.data();
                    setDoctorDetails(doctorData);
                    console.log(doctorData)
                    if (doctorData.doctorUid) {
                console.log("wow")
                        const hospitalRef = doc(db, "doctors", doctorData.doctorUid);
                        const hospitalSnap = await getDoc(hospitalRef);

                        if (hospitalSnap.exists()) {
                            const hospitalData = hospitalSnap.data();
                            const hospitalId = hospitalSnap.id;

                            setHospital({ ...hospitalData, uid: hospitalId });
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching doctor and hospital details:", error);
            }
        };

// Call the function
        fetchDoctorAndHospitalDetails();


    }, [user]);

    useEffect(() => {
        if (hospital?.uid) {
            fetchDoctorSchedules();
        }
    }, [hospital?.uid]);

    const fetchDoctorSchedules = async () => {
        console.log("mera user", user);
        if (!user?.uid) return;

        try {
            setLoading(true);
            console.log(hospital.uid)
            const schedulesRef = collection(db, `doctors/${hospital.uid}/schedules`);
            const schedulesSnapshot = await getDocs(schedulesRef);

            const fetchedSchedules = schedulesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setSchedules(fetchedSchedules);
        } catch (error) {
            setMessage("Error fetching schedules: " + error.message);
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

    const checkScheduleClash = async (newSchedule) => {
        const sameDateSchedules = schedules.filter(
            schedule => schedule.date === newSchedule.date
        );

        return sameDateSchedules.some(existingSchedule =>
            newSchedule.startTime < existingSchedule.endTime &&
            newSchedule.endTime > existingSchedule.startTime
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user?.uid) {
            setMessage("Please log in to create schedules");
            setStatus("error");
            return;
        }

        try {
            setStatus("loading");

            const newSchedule = {
                date: scheduleForm.date,
                startTime: scheduleForm.startTime,
                endTime: scheduleForm.endTime,
                interval: parseInt(scheduleForm.interval),
                createdAt: serverTimestamp(),
                timeSlots: generateTimeSlots(
                    scheduleForm.startTime,
                    scheduleForm.endTime,
                    parseInt(scheduleForm.interval)
                )
            };

            const hasClash = await checkScheduleClash(newSchedule);

            if (hasClash) {
                setClashDialog(newSchedule);
                return;
            }
console.log(hospital)
            const dateDocRef = doc(db, `doctors/${hospital.uid}/schedules/${scheduleForm.date}`);
            await setDoc(dateDocRef, newSchedule);

            // await addDoc(collection(db, 'doctor_schedule_cancellations'), {
            //     doctorId: user.uid,
            //     scheduleDate: scheduleForm.date,
            //     createdAt: serverTimestamp()
            // });

            setSchedules([...schedules, { id: dateDocRef.id, ...newSchedule }]);
            setScheduleForm({ date: "", startTime: "", endTime: "", interval: "" });
            setMessage("Schedule created successfully");
            setStatus("success");
        } catch (error) {
            setMessage("Error creating schedule: " + error.message);
            setStatus("error");
        }
    };

    const handleScheduleDelete = async (scheduleId, date) => {
        try {
            await addDoc(collection(db, 'doctor_schedule_cancellations'), {
                doctorId: user.uid,
                scheduleDate: date,
                scheduleId: scheduleId,
                cancellationType: 'manual_deletion',
                createdAt: serverTimestamp()
            });

            await deleteDoc(doc(db, `hospitals/${hospital.uid}/schedules/${scheduleId}`));

            setSchedules(schedules.filter(s => s.id !== scheduleId));
            setMessage("Schedule deleted successfully");
            setStatus("success");
            setDeleteConfirmation(null);
        } catch (error) {
            setMessage("Error deleting schedule: " + error.message);
            setStatus("error");
        }
    };

    const generateTimeSlots = (start, end, intervalMinutes) => {
        const slots = [];
        const startDate = new Date(`2000-01-01T${start}`);
        const endDate = new Date(`2000-01-01T${end}`);
        let currentSlot = new Date(startDate);

        while (currentSlot < endDate) {
            const slotStart = currentSlot.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            const slotEnd = new Date(currentSlot.getTime() + intervalMinutes * 60000);
            if (slotEnd > endDate) break;

            const formattedSlotEnd = slotEnd.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });

            slots.push({
                start: slotStart,
                end: formattedSlotEnd,
                status: 'Available',
                booked: false,
                patient: null,
                cancelled: []
            });

            currentSlot = slotEnd;
        }

        return slots;
    };

    const toggleSchedule = (scheduleId) => {
        setExpandedSchedule(expandedSchedule === scheduleId ? null : scheduleId);
    };

    const toggleSlotDetails = (slotKey) => {
        setExpandedSlot(expandedSlot === slotKey ? null : slotKey);
    };

    const handleAcceptPatient = async (schedule, slot) => {
        try {
            const updatedSchedules = schedules.map(s => {
                if (s.id === schedule.id) {
                    const updatedTimeSlots = s.timeSlots.map(timeSlot => {
                        if (timeSlot.start === slot.start && timeSlot.end === slot.end) {
                            return {
                                ...timeSlot,
                                status: 'Accepted',
                                booked: true
                            };
                        }
                        return timeSlot;
                    });

                    return {
                        ...s,
                        timeSlots: updatedTimeSlots
                    };
                }
                return s;
            });

            setSchedules(updatedSchedules);
        } catch (error) {
            console.error("Error accepting patient:", error);
        }
    };

    const handleRejectApplication = async (schedule, slot, rejectionReason) => {
        try {
            const scheduleRef = doc(db, `doctors/${hospital.uid}/schedules/${schedule.id}`);

            // Update the timeSlots in Firestore
            const updatedTimeSlots = schedule.timeSlots.map((timeSlot) => {
                if (timeSlot.start === slot.start && timeSlot.end === slot.end) {
                    return {
                        ...timeSlot,
                        status: 'Available',
                        booked: false,
                        patient: null,
                        cancelled: [...(timeSlot.cancelled || []), slot.patient]
                    };
                }
                return timeSlot;
            });

            // Update the Firestore document with the updated timeSlots
            await updateDoc(scheduleRef, { timeSlots: updatedTimeSlots });
            console.log(rejectionReason);
            // Optional: Add a cancellation record to Firestore
            await addDoc(collection(db, 'doctor_rejections'), {
                doctorId: user.uid,
                scheduleId: schedule.id,
                slotStart: slot.start,
                slotEnd: slot.end,
                patientId: slot.patient,
                cancellationReason: rejectionReason,
                createdAt: serverTimestamp()
            });

            setRejectionDialog(false);

            // Optional: Update local state (if needed for UI purposes)
            setSchedules(prevSchedules => prevSchedules.map(s =>
                s.id === schedule.id ? { ...s, timeSlots: updatedTimeSlots } : s
            ));

        } catch (error) {
            console.error("Error rejecting patient:", error);
        }
    };

    const handleRejectApplicationBuggyCode = async (schedule, slot, rejectionReason) => {
        try {
            const scheduleRef = doc(db, `doctors/${user.uid}/schedules/${schedule.id}`);

            const updatedTimeSlots = schedule.timeSlots.map((timeSlot) => {
                if (timeSlot.start === slot.start && timeSlot.end === slot.end) {
                    return {
                        ...timeSlot,
                        status: 'Available',
                        booked: false,
                        patient: null,
                        cancelled: [...(timeSlot.cancelled || []), slot.patient]
                    };
                }
                return timeSlot;
            });

            await updateDoc(scheduleRef, { timeSlots: updatedTimeSlots });

            await addDoc(collection(db, 'lab_rejections'), {
                doctorId: user.uid,
                scheduleId: schedule.id,
                slotStart: slot.start,
                slotEnd: slot.end,
                patientId: slot.patient,
                patientName: slot.patientName,
                cancellationReason: rejectionReason,
                createdAt: serverTimestamp()
            });

            setSchedules(prevSchedules => prevSchedules.map(s =>
                s.id === schedule.id ? { ...s, timeSlots: updatedTimeSlots } : s
            ));

            setMessage("Patient application rejected successfully");
            setStatus("success");
            setRejectionDialog(false);
            setSlotToReject(null);

        } catch (error) {
            console.error("Error rejecting patient:", error);
            setMessage("Error rejecting patient application");
            setStatus("error");
        }
    };


    // const handleTreatmentDone = async (schedule, slot) => {
    //     try {
    //         // Update the schedule document
    //         const scheduleRef = doc(db, "doctors", user.uid, "schedules", schedule.id);
    //         const updatedTimeSlots = schedule.timeSlots.map((timeSlot) => {
    //             if (timeSlot.start === slot.start) {
    //                 return {
    //                     ...timeSlot,
    //                     status: "Treatment Done"
    //                 };
    //             }
    //             return timeSlot;
    //         });
    //
    //         // Update schedule document
    //         await updateDoc(scheduleRef, { timeSlots: updatedTimeSlots });
    //
    //         // Save treatment completion details to doctor_treatments collection
    //         await addDoc(collection(db, 'doctor_treatments'), {
    //             doctorId: user.uid,
    //             scheduleId: schedule.id,
    //             slotStart: slot.start,
    //             slotEnd: slot.end,
    //             patientId: slot.patient,
    //             patientName: slot.patientName,
    //             completionTime: serverTimestamp(),
    //             clinic: user.clinic || null,
    //             status: 'Completed',
    //             treatmentNotes: slot.description || null,
    //             prescriptionId: null  // Can be updated if you have prescription functionality
    //         });
    //
    //         // Update local state
    //         setSchedules(prevSchedules =>
    //             prevSchedules.map(s => s.id === schedule.id ?
    //                 { ...s, timeSlots: updatedTimeSlots } : s
    //             )
    //         );
    //
    //         setMessage("Treatment marked as done successfully!");
    //         setStatus("success");
    //
    //     } catch (error) {
    //         console.error("Error marking treatment as done:", error);
    //         setMessage("Error marking treatment as done. Please try again later.");
    //         setStatus("error");
    //     }
    // };


    const [uploadDialog, setUploadDialog] = useState(false);
    const [currentSlot, setCurrentSlot] = useState(null);
    const handleTreatmentDone = async (schedule, slot) => {

        try {
            setCurrentSchedule(schedule);
            setCurrentSlot(slot);
            setUploadDialog(true);
        } catch (error) {
            console.error("Error initiating lab completion:", error);
            setMessage("Error completing lab test. Please try again later.");
            setStatus("error");
        }
    };

    const handleLabReportUploaded = async (fileData, schedule, slot) => {
        try {
            // Update the schedule document
            const scheduleRef = doc(db, "doctors", hospital.uid, "schedules", schedule.id);
            const updatedTimeSlots = schedule.timeSlots.map((timeSlot) => {
                if (timeSlot.start === slot.start) {
                    return {
                        ...timeSlot,
                        status: "Completed",
                        reportFileId: fileData.fileId,
                        reportFileName: fileData.fileName
                    };
                }
                return timeSlot;
            });

            // Update schedule document
            await updateDoc(scheduleRef, { timeSlots: updatedTimeSlots });

            // Save completion details to lab_form_completion collection
            await addDoc(collection(db, 'doctors_completion'), {
                completionTime: serverTimestamp(),
                labId: user.uid,
                patientId: slot.patient,
                patientName: slot.patientName,
                scheduleId: schedule.id,
                slotStart: slot.start,
                slotEnd: slot.end,
                status: 'Completed',
                treatmentNotes: slot.description || null,
                reportFileId: `${fileData.fileId}`,
                reportFileName: fileData.fileName,
                reportOriginalName: fileData.originalName
            });

            // Update local state
            setSchedules(prevSchedules =>
                prevSchedules.map(s => s.id === schedule.id ?
                    { ...s, timeSlots: updatedTimeSlots } : s
                )
            );

            setMessage("Doctor report uploaded and completion recorded successfully!");
            setStatus("success");
            setUploadDialog(false);

        } catch (error) {
            console.error("Error completing Doctor test:", error);
            setMessage("Error completing Doctor test. Please try again later.");
            setStatus("error");
        }
    };

    const LabReportUploadDialog = ({ isOpen, onClose, onUpload, slot }) => {
        const [file, setFile] = useState(null);
        const [uploading, setUploading] = useState(false);
        const [error, setError] = useState(null);
        const [success, setSuccess] = useState(false);

        const handleFileChange = (e) => {
            setFile(e.target.files[0]);
            setError(null);
            setSuccess(false);
        };

        const handleUpload = async () => {
            if (!file) {
                setError("Please select a file first");
                return;
            }

            setUploading(true);
            setError(null);
            setSuccess(false);
            console.log(slot)
            const getFileExtension = (fileName) => fileName.slice(fileName.lastIndexOf('.') + 1);

            const newFileName = `Patient Treatment report for ${slot.patientName} ${Date.now()} .${getFileExtension(file.name)}`;
            const orignalName = file.name;
            const renamedFile = new File([file], newFileName, { type: file.type });
            const formData = new FormData();
            formData.append("file", renamedFile);

            try {
                const response = await fetch("https://gdfileupload.onrender.com/upload", {
                    method: "POST",
                    body: formData,
                });
                // const response = await fetch(`http://localhost:5000/upload`, {
                //     method: "POST",
                //     body: formData,
                // });

                const data = await response.json();
                console.log(data);
                if (data.success) {
                    setSuccess(true);
                    setTimeout(() => {
                        onUpload({
                            fileId: data.fileId,
                            fileName: `${file.name}`,
                            originalName: orignalName
                        });
                    }, 1500); // Give time to show success message
                } else {
                    setError("Upload failed. Please try again.");
                }
            } catch (error) {
                setError("Error uploading file: " + error.message);
            } finally {
                setUploading(false);
            }
        };

        const resetState = () => {
            setFile(null);
            setError(null);
            setSuccess(false);
            setUploading(false);
        };

        const handleClose = () => {
            resetState();
            onClose();
        };

        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Upload Lab Report</DialogTitle>
                        <DialogDescription>
                            Please upload the completed lab report for patient {slot?.patientName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex items-center justify-center w-full">
                            <label className={`w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg shadow-lg tracking-wide border border-blue-200 cursor-pointer hover:bg-blue-50 transition-colors duration-200 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                <Upload className="w-8 h-8 text-blue-500 mb-2" />
                                <span className="text-base text-gray-700">
                                {uploading ? 'Uploading...' : 'Select a file'}
                            </span>
                                <input
                                    type='file'
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                            </label>
                        </div>

                        {file && !uploading && !success && (
                            <Alert className="bg-blue-50 text-blue-800 border-blue-200">
                                <AlertDescription className="flex items-center">
                                    <Upload className="w-4 h-4 mr-2" />
                                    Selected file: {file.name}
                                </AlertDescription>
                            </Alert>
                        )}

                        {uploading && (
                            <Alert className="bg-yellow-50 text-yellow-800 border-yellow-200">
                                <AlertDescription className="flex items-center">
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading file... Please wait
                                </AlertDescription>
                            </Alert>
                        )}

                        {error && (
                            <Alert className="bg-red-50 text-red-800 border-red-200">
                                <AlertDescription className="flex items-center">
                                    <XCircle className="w-4 h-4 mr-2" />
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        {success && (
                            <Alert className="bg-green-50 text-green-800 border-green-200">
                                <AlertDescription className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    File uploaded successfully!
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            disabled={uploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={!file || uploading || success}
                            className="min-w-[100px]"
                        >
                            {uploading ? (
                                <div className="flex items-center">
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Uploading...
                                </div>
                            ) : success ? (
                                <div className="flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Done
                                </div>
                            ) : (
                                'Upload Report'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };

    const RejectionDialog = ({ isOpen, onClose, onConfirm, slot }) => {
        const [reason, setReason] = useState("");
        const [error, setError] = useState("");

        const handleSubmit = () => {
            if (!reason.trim()) {
                setError("Please provide a rejection reason");
                return;
            }
            onConfirm(reason);
            setReason("");
            setError("");
        };

        return (
            <Dialog open={isOpen} onOpenChange={() => {
                setReason("");
                setError("");
                onClose();
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center text-red-600">
                            <AlertTriangle className="mr-2" /> Reject Patient Application
                        </DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting {slot?.patientName}'s application
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Rejection Reason
                            </label>
                            <textarea
                                value={reason}
                                onChange={(e) => {
                                    setReason(e.target.value);
                                    setError("");
                                }}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                placeholder="Enter the reason for rejection..."
                            />
                            {error && (
                                <p className="text-sm text-red-500">{error}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleSubmit}
                        >
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    };



    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gray-50">
            {/* Dialog components remain the same */}
            <Dialog open={!!clashDialog} onOpenChange={() => setClashDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center text-red-600">
                            <AlertTriangle className="mr-2" /> Schedule Clash Detected
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        The new schedule conflicts with an existing schedule.
                        Please adjust the time or delete the conflicting schedule.
                    </DialogDescription>
                    <DialogFooter>
                        <Button variant="destructive" onClick={() => setClashDialog(null)}>
                            Modify Schedule
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog
                open={!!deleteConfirmation}
                onOpenChange={() => setDeleteConfirmation(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center text-red-600">
                            <AlertTriangle className="mr-2" /> Cancel Schedule
                        </DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Deleting this schedule will cancel all associated bookings.
                        Are you sure you want to proceed?
                    </DialogDescription>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteConfirmation(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleScheduleDelete(
                                deleteConfirmation.scheduleId,
                                deleteConfirmation.date
                            )}
                        >
                            Confirm Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <LabReportUploadDialog
                isOpen={uploadDialog}
                onClose={() => setUploadDialog(false)}
                onUpload={(fileData) => handleLabReportUploaded(fileData, currentSchedule, currentSlot)}
                slot={currentSlot}
            />



            <h1 className="text-3xl font-semibold mb-8 text-gray-800 flex items-center">
                <Calendar className="mr-2 text-blue-500" />
                Doctors Schedule Manager
            </h1>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3">
                    {/* Schedule Form component remains the same */}
                    <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                            <Plus className="mr-2 text-green-500"/>
                            Add New Schedule
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={scheduleForm.date}
                                    onChange={(e) => setScheduleForm(prev => ({...prev, date: e.target.value}))}
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                <div className="relative">
                                    <Clock className="absolute top-3 left-3 text-gray-400" size={16}/>
                                    <input
                                        type="time"
                                        value={scheduleForm.startTime}
                                        onChange={(e) => setScheduleForm(prev => ({
                                            ...prev,
                                            startTime: e.target.value
                                        }))}
                                        className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                                <div className="relative">
                                    <Clock className="absolute top-3 left-3 text-gray-400" size={16}/>
                                    <input
                                        type="time"
                                        value={scheduleForm.endTime}
                                        onChange={(e) => setScheduleForm(prev => ({...prev, endTime: e.target.value}))}
                                        className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Interval
                                    (Minutes)</label>
                                <input
                                    type="number"
                                    value={scheduleForm.interval}
                                    onChange={(e) => setScheduleForm(prev => ({...prev, interval: e.target.value}))}
                                    min="5"
                                    max="120"
                                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 ease-in-out"
                            >
                                Save Schedule
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:w-2/3">
                    <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                            <Calendar className="mr-2 text-blue-500"/>
                            Your Schedules
                        </h2>
                        {schedules.length === 0 ? (
                            <div className="text-gray-500 text-center py-4 flex items-center justify-center">
                                <AlertCircle className="mr-2 text-yellow-500"/>
                                <p>No schedules found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {schedules.map((schedule) => (
                                    <div key={schedule.id}
                                         className="bg-gray-50 p-4 rounded-md border border-gray-200 transition duration-200 ease-in-out hover:shadow-md">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <Calendar className="text-blue-500" size={20}/>
                                                <div>
                                                    <p className="font-bold text-gray-800 mb-1">
                                                        {formatDate(schedule.date)}
                                                    </p>
                                                    <p className="font-medium text-gray-700">
                                                        {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {schedule.interval} minute consultation intervals
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => toggleSchedule(schedule.id)}
                                                    className="text-gray-500 hover:text-blue-500 focus:outline-none transition duration-200 ease-in-out"
                                                >
                                                    {expandedSchedule === schedule.id ? (
                                                        <ChevronUp size={20}/>
                                                    ) : (
                                                        <ChevronDown size={20}/>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmation({
                                                        scheduleId: schedule.id,
                                                        date: schedule.date
                                                    })}
                                                    className="text-red-500 hover:text-red-700 focus:outline-none transition duration-200 ease-in-out"
                                                >
                                                    <Trash2 size={20}/>
                                                </button>
                                            </div>
                                        </div>
                                        {expandedSchedule === schedule.id && (
                                            <div className="mt-4">
                                                <div
                                                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
                                                    {schedule.timeSlots.map((slot, index) => (
                                                        <div
                                                            key={`${schedule.id}-${index}`}
                                                            className={`relative p-2 rounded text-sm text-center border cursor-pointer transition duration-200 ease-in-out ${
                                                                slot.booked
                                                                    ? slot.status === 'Accepted'
                                                                        ? 'bg-green-100 border-green-200 text-green-800'
                                                                        : 'bg-red-100 border-red-200 text-red-800'
                                                                    : 'bg-blue-100 border-blue-200 text-blue-800'
                                                            }`}
                                                            onClick={() => toggleSlotDetails(`${schedule.id}-${index}`)}
                                                        >
                                                            {slot.start} - {slot.end}

                                                            {expandedSlot === `${schedule.id}-${index}` && slot.patient && (
                                                                <div className="absolute z-10 top-full left-0 mt-2 w-96 bg-white shadow-lg rounded-md p-4 border">
                                                                    <div className="flex items-center space-x-2 mb-2">
                                                                        <User className="text-blue-500" />
                                                                        <h3 className="font-semibold">Patient Details</h3>
                                                                    </div>
                                                                    <PatientSearch uid={slot.patient} notes={slot.notes} patientName={slot.patientName} />
                                                                    {slot.status === 'Accepted' && (
                                                                        <Button
                                                                            className="mt-2 w-full"
                                                                            // onClick={() => handleRejectApplication(schedule, slot)}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSlotToReject({ schedule, slot });
                                                                                setRejectionDialog(true);
                                                                            }}

                                                                        >
                                                                            Reject Patient
                                                                        </Button>
                                                                    )}
                                                                    {slot.status === 'Accepted' && (
                                                                        <Button
                                                                            className="mt-2 w-full"
                                                                            onClick={() => handleTreatmentDone(schedule, slot)}
                                                                        >
                                                                            Accept Patient
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            )}

                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <RejectionDialog
                isOpen={rejectionDialog}
                onClose={() => {
                    setRejectionDialog(false);
                    setSlotToReject(null);
                }}
                onConfirm={(reason) => {
                    if (slotToReject) {
                        handleRejectApplication(slotToReject.schedule, slotToReject.slot, reason);
                    }
                }}
                slot={slotToReject?.slot}
            />

            {message && (
                <div className={`mt-6 p-4 rounded-md text-center animate-pulse ${
                    status === "success" ? "bg-green-100 text-green-800 border border-green-200" :
                        status === "error" ? "bg-red-100 text-red-800 border border-red-200" :
                            "bg-blue-100 text-blue-800 border border-blue-200"
                }`}>
                    <div className="flex items-center justify-center">
                        {status === "success" ? (
                            <Check className="mr-2 text-green-500" />
                        ) : status === "error" ? (
                            <AlertCircle className="mr-2 text-red-500" />
                        ) : (
                            <Clock className="mr-2 text-blue-500" />
                        )}
                        {message}
                    </div>
                </div>
            )}


        </div>
    );
};

export default DoctorScheduleManager;

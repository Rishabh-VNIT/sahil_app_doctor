import React, { useState, useEffect } from "react";
import { LogOut, Bell, ChevronDown } from "lucide-react";
import Link from "next/link";
import { handleLogout } from "@/utils/handleLogout";
import MyComponent, { getProfileImage } from "@/utils/firebaseHelpers";
import {AuthProvider, useAuth} from "@/lib/auth";
import {doc, getDoc} from "firebase/firestore";
import {db} from "@/firebase/config"; // Assume this helper fetches the profileImage URL.

const Navbar = ({ toggleSidebar, user }) => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    // const { myUser, auth } = useAuth()
    const getRandomAvatar = () => {
        const randomSeed = Math.floor(Math.random() * 1000);
        return `https://api.dicebear.com/6.x/avataaars/svg?seed=${randomSeed}`;
    };

    const [profileImage, setProfileImage] = useState(null)


    useEffect(() => {
        const fetchProfileImage = async () => {
            if (user?.uid) {
                const docRef = doc(db, "doctors", user.uid)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists() && docSnap.data().profileImage) {
                    setProfileImage(docSnap.data().profileImage)
                } else {
                    setProfileImage(getRandomAvatar())
                }
            }
        }
        fetchProfileImage()
    }, [user?.uid])

    useEffect(() => {

    }, [user?.uid]);

    return (
        <AuthProvider>
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <h1 className="text-xl font-bold text-blue-600">Doctor Dashboard</h1>
                    </div>
                    <div className="flex items-center">
                        {/*<button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">*/}
                        {/*    <span className="sr-only">View notifications</span>*/}
                        {/*    <Bell className="h-6 w-6" />*/}
                        {/*</button>*/}
                        <div className="ml-3 relative">
                            <div>
                                <button
                                    className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    id="user-menu"
                                    aria-haspopup="true"
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                >
                                    <span className="sr-only">Open user menu</span>
                                    {/*<img*/}
                                    {/*    className="h-8 w-8 rounded-full"*/}
                                    {/*    src={profileImage}*/}
                                    {/*    alt={user?.displayName || "User"}*/}
                                    {/*/>*/}
                                    <img className="h-8 w-8 rounded-full" src={profileImage || getRandomAvatar()}
                                         alt={user?.displayName || "User"}/>

                                    <ChevronDown className="ml-1 h-4 w-4 text-gray-400"/>
                                </button>
                            </div>
                            {isProfileOpen && (
                                <div
                                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5"
                                    role="menu"
                                    aria-orientation="vertical"
                                    aria-labelledby="user-menu"
                                >
                                    <Link href="/profile">
                                        <div
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            role="menuitem"
                                        >
                                            Your Profile
                                        </div>
                                    </Link>
                                    <Link href="hospital">
                                        <div
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            role="menuitem"
                                        >
                                            Hospital
                                        </div>
                                    </Link>
                                    <Link href="#">
                                        <div
                                            onClick={handleLogout}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            role="menuitem"
                                        >
                                            Log out
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="ml-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            <LogOut className="h-5 w-5 mr-2 inline-block" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </header>
            </AuthProvider>
    );
};

export default Navbar;

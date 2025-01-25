import { auth } from "@/firebase/config";
import {router} from "next/client";


export const handleLogout = async () => {
    try {
        await auth.signOut();
        router.push("/signin");
    } catch (error) {
        console.error("Logout failed", error.message);
    }
};

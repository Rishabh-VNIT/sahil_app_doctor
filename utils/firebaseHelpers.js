import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/firebase/config"

function MyComponent({ user }) {


    return (
        <img className="h-8 w-8 rounded-full" src={profileImage || getRandomAvatar()} alt={user?.displayName || "User"} />
    )
}

export default MyComponent


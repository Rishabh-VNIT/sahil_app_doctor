import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import { auth } from "@/firebase/config"
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

const SignIn = () => {
    const [formData, setFormData] = useState({ email: "", password: "" })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData({ ...formData, [name]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        const { email, password } = formData

        try {
            await signInWithEmailAndPassword(auth, email, password)
            router.push("/dashboard")
        } catch (error) {
            setError("Invalid credentials. Please try again.")
        }
    }

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider()
        try {
            const result = await signInWithPopup(auth, provider)
            router.push("/dashboard")
        } catch (error) {
            setError(error.message)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 py-12">
            <div className="w-full max-w-md">
                <form
                    onSubmit={handleSubmit}
                    className="bg-white shadow-2xl rounded-lg px-12 pt-10 pb-8 mb-4"
                >
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
                        Doctor Sign-In
                    </h2>
                    {error && (
                        <div className="mb-4 text-sm text-red-600 bg-red-100 border border-red-400 rounded p-3">
                            {error}
                        </div>
                    )}
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
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
                        >
                            Sign In
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="group relative w-full flex justify-center py-3 px-4 mt-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
                    >
                        <span className="flex items-center justify-center">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/5/51/Google.png"
                                alt="Google"
                                className="h-5 w-5 mr-2"
                            />
                            Sign In with Google
                        </span>
                    </button>
                </form>
                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{" "}
                        <Link href="/signup" className="text-blue-600 hover:underline">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default SignIn

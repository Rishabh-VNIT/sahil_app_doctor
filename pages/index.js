'use client'

import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

export default function Home() {
    const router = useRouter()

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-teal-100">
            <div className="max-w-3xl mx-auto text-center px-4">
                <h1 className="text-5xl font-extrabold text-blue-600 mb-6 leading-tight">
                    Welcome to Your Health Companion
                </h1>
                <p className="text-xl text-gray-700 mb-10 leading-relaxed">
                    Manage your appointments, connect with healthcare professionals, and take control of your well-being with our intuitive Doctor Appointment App.
                </p>
                <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <button
                        onClick={() => router.push('/signin')}
                        className="group relative px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-full overflow-hidden transition-all duration-300 ease-out hover:bg-blue-700 hover:shadow-lg"
                    >
                        <span className="relative z-10">Sign In</span>
                        <span className="absolute inset-0 bg-blue-800 opacity-0 group-hover:opacity-20 transition-opacity duration-300 ease-out"></span>
                    </button>
                    <button
                        onClick={() => router.push('/signup')}
                        className="group relative px-8 py-4 bg-teal-500 text-white text-lg font-semibold rounded-full overflow-hidden transition-all duration-300 ease-out hover:bg-teal-600 hover:shadow-lg"
                    >
            <span className="relative z-10 flex items-center justify-center">
              Sign Up
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 ease-out group-hover:translate-x-1" />
            </span>
                        <span className="absolute inset-0 bg-teal-700 opacity-0 group-hover:opacity-20 transition-opacity duration-300 ease-out"></span>
                    </button>
                </div>
            </div>
            <div className="mt-16 text-center">
                <p className="text-gray-600 mb-4">Trusted by healthcare professionals and patients alike</p>
                <div className="flex justify-center space-x-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-16 h-16 bg-gray-300 rounded-full animate-pulse"></div>
                    ))}
                </div>
            </div>
        </div>
    )
}


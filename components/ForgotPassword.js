// components/ForgotPassword.js
import { useState } from "react";
import { auth } from "../firebase/config";
import { sendPasswordResetEmail } from "firebase/auth";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handlePasswordReset = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("Password reset email sent! Check your inbox.");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-xl font-bold text-gray-800 mb-4">Forgot Password</h1>
                <form onSubmit={handlePasswordReset} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-gray-700 font-medium">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
                    >
                        Reset Password
                    </button>
                </form>
                {message && <p className="mt-4 text-green-500">{message}</p>}
                {error && <p className="mt-4 text-red-500">{error}</p>}
            </div>
        </div>
    );
};

export default ForgotPassword;

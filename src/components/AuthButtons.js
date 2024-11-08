"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function AuthButtons() {
    const { data: session } = useSession();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    const handleAuthAction = async () => {
        if (isSignUp) {
            // Placeholder for account creation logic
            setMessage("Account created successfully! Please sign in.");
            setIsSignUp(false);
            setEmail("");
            setPassword("");
        } else {
            // Attempt to sign in
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password
            });

            if (result.error) {
                setMessage("Sign in failed. Please check your credentials.");
            }
        }
    };

    return (
        <div className="relative">
            {session ? (
                <div className="flex items-center space-x-4">
                    <span className="text-red-600">{session.user.email}</span>
                    <button
                        onClick={() => signOut()}
                        className="button-danger py-1 px-3 rounded"
                    >
                        Sign Out
                    </button>
                </div>
            ) : (
                <>
                    <button
                        onClick={toggleDropdown}
                        className="button-primary py-1 px-3 rounded"
                    >
                        {isSignUp ? "Sign Up" : "Sign In"}
                    </button>
                    {dropdownOpen && (
                        <div
                            className="absolute right-0 top-full mt-2 w-64 bg-primary-color shadow-md rounded-md p-4 z-10 text-white"
                            style={{
                                animation: "slideDown 0.3s ease-out",
                                backgroundColor: "#003366" // Ensures solid dark blue background
                            }}
                        >
                            <h2 className="text-lg font-bold mb-3">{isSignUp ? "Sign Up" : "Sign In"}</h2>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full mb-2 p-2 border rounded text-primary-color placeholder-primary-color"
                                required
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mb-2 p-2 border rounded text-primary-color placeholder-primary-color"
                                required
                            />
                            <button
                                onClick={handleAuthAction}
                                className="w-full button-primary py-2 rounded mt-2"
                            >
                                {isSignUp ? "Create Account" : "Sign In"}
                            </button>
                            <button
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setMessage(""); // Clear messages on toggle
                                }}
                                className="text-white underline mt-2 text-sm"
                            >
                                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                            </button>
                            {message && (
                                <p className="mt-2 text-sm text-green-600">{message}</p>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Slide-down effect for the dropdown */}
            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}

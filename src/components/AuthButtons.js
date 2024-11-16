"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import axios from 'axios';

export default function AuthButtons() {
    const { data: session } = useSession();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [username, setUsername] = useState("");
    const [identifier, setIdentifier] = useState(""); // Field for username or email
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    const handleAuthAction = async () => {
        if (isSignUp) {
            // Registration Logic
            try {
                console.log("Registration attempt with payload:", { username, email: identifier, password });
                const response = await axios.post('/api/auth/register', { username, email: identifier, password }, {
                    headers: { 'Content-Type': 'application/json' }
                });
                setMessage(response.data.message || "Account created successfully! Please sign in.");
                setIsSignUp(false);
                setUsername("");
                setIdentifier("");
                setPassword("");
            } catch (error) {
                console.error("Registration error:", error.response?.data.message || error.message);
                setMessage(error.response?.data.message || "Registration failed.");
            }
        } else {
            // Login Logic using NextAuth's signIn function
            try {
                console.log("Login attempt with payload:", { identifier, password });
                const result = await signIn("credentials", {
                    redirect: false,
                    identifier,
                    password,
                });

                if (result?.error) {
                    console.error("Login error:", result.error);
                    setMessage("Sign in failed. Please check your credentials.");
                } else {
                    setMessage("Sign-in successful!");
                }
            } catch (error) {
                console.error("Login error:", error.message);
                setMessage("Sign in failed. Please check your credentials.");
            }
        }
    };

    return (
        <div className="relative">
            {session ? (
                <div className="flex items-center space-x-4">
                    <span style={{ color: "var(--text-color)" }}>{session.user.email}</span>
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
                        style={{
                            whiteSpace: "nowrap",
                            width: "fit-content"
                        }}
                    >
                        {isSignUp ? "Sign Up" : "Sign In"}
                    </button>
                    {dropdownOpen && (
                        <div
                            className="absolute right-0 top-full mt-2 w-64 bg-primary-color shadow-md rounded-md p-4 z-10"
                            style={{
                                animation: "slideDown 0.3s ease-out",
                                backgroundColor: "#003366",
                                color: "var(--text-color)"
                            }}
                        >
                            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text-color)" }}>
                                {isSignUp ? "Sign Up" : "Sign In"}
                            </h2>
                            {isSignUp && (
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full mb-2 p-2 border rounded placeholder-primary-color"
                                    style={{ color: "var(--text-color)" }}
                                    required
                                />
                            )}
                            <input
                                type="text"
                                id="identifier"
                                name="identifier"
                                placeholder="Username or Email"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full mb-2 p-2 border rounded placeholder-primary-color"
                                style={{ color: "var(--text-color)" }}
                                required
                            />
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full mb-2 p-2 border rounded placeholder-primary-color"
                                style={{ color: "var(--text-color)" }}
                                required
                            />
                            <button
                                onClick={handleAuthAction}
                                className="w-full button-primary py-2 rounded mt-2"
                                style={{ color: "var(--text-color)", backgroundColor: "white" }}
                            >
                                {isSignUp ? "Create Account" : "Sign In"}
                            </button>
                            <button
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setMessage("");
                                }}
                                className="underline mt-2 text-sm"
                                style={{ color: "var(--text-color)" }}
                            >
                                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                            </button>
                            {message && (
                                <p className="mt-2 text-sm" style={{ color: isSignUp ? "green" : "red" }}>{message}</p>
                            )}
                        </div>
                    )}
                </>
            )}

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

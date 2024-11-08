// src/pages/api/auth/local.js
import { compare } from "bcryptjs"; // Assumes passwords are hashed with bcrypt

// Mock database lookup (replace with actual database queries)
const users = [
    { email: "user@example.com", passwordHash: "$2a$12$somethinghashed" },
];

export default async function handler(req, res) {
    if (req.method === "POST") {
        const { email, password } = req.body;
        const user = users.find((user) => user.email === email);

        if (user && await compare(password, user.passwordHash)) {
            // Mock a session creation or token generation
            res.status(200).json({ message: "Authenticated", user });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } else {
        res.status(405).end(); // Method Not Allowed
    }
}

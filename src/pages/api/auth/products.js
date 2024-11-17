import { getSession } from "next-auth/react";

export default async function handler(req, res) {
    const session = await getSession({ req });

    // Check if user is logged in and has admin privileges
    if (!session || !session.user.isAdmin) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.method === "POST") {
        const { name, description, price } = req.body;
        
        // Save product to database or other storage (mocked here)
        console.log("New Product:", { name, description, price });

        // Return a successful response
        res.status(201).json({ message: "Product added successfully" });
    } else {
        res.setHeader("Allow", ["POST"]);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}

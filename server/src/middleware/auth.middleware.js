const jwt = require("jsonwebtoken");
const User = require("../models/user.model");


// Middleware to protect routes
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);

        console.log("decode",decode);
        
        const user = await User.findById(decode.id).select("-password");
        console.log("user", user);
        
       
        
        if (!user) {
            return res.status(401).json({ message: "Unauthorized: User not found" });
        }
        req.user = user; // Attach user to request object
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error.message);
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admins only" });
    }
    next();
}

const instructorMiddleware = (req, res, next) => {
    if (req.user.role !== "instructor") {
        return res.status(403).json({ message: "Forbidden: Instructors only" });
    }
    next();
}

const studentMiddleware = (req, res, next) => {
    if (req.user.role !== "student") {
        return res.status(403).json({ message: "Forbidden: Students only" });
    }
    next();
}




module.exports = {
    authMiddleware, adminMiddleware, instructorMiddleware, studentMiddleware
};

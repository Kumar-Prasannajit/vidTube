import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.js";

const verifyJWT = asyncHandler(async (req, _, next) => {
    const token = req.cookies?.accessToken || req.headers('Authorization')?.replace('Bearer ', ''); // Get token from cookies or Authorization header

    if (!token) {
        throw new ApiError(401, "Unauthorized: No token provided");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
        if (!user) {
            throw new ApiError(401, "Unauthorized: Invalid token");
        }
        req.user = user; // Attach user to request object
        //next() will be called in the route handler after this middleware, so we can access req.user there
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Unauthorized: Invalid token");
    }
})

export default verifyJWT;
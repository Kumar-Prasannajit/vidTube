import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.model.js";

const registerUser = asyncHandler( async (req, res) => {
    const { fullName, email, username, password } = req.body;

    //validation
    if ([fullName, email, username, password].some((field) => !field || field.trim() === "")) { // Check if any field is missing or empty
        throw new ApiError(400, "All fields are required");
    }

    //check if user already exists
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }
})

export { registerUser }
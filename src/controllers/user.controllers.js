import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;

    //validation
    if ([fullname, email, username, password].some((field) => !field || field.trim() === "")) { // Check if any field is missing or empty
        throw new ApiError(400, "All fields are required");
    }

    //check if user already exists
    const existingUser = await User.findOne({
        $or: [{ email }, { username }]
    });

    if (existingUser) {
        throw new ApiError(409, "User with email or username already exists");
    }

    //get avatar filepath
    let avatarLocalPath = req.files?.avatar[0]?.path || null;

    //get cover img filepath
    let coverImgLocalPath = req.files?.coverImage[0]?.path || null;

    if (!avatarLocalPath) throw new ApiError(400, "Avatar image is required");

    //upload imgs to cloudinary and get urls
    const avatarUrl = await uploadToCloudinary(avatarLocalPath);
    let coverImageUrl = null;
    if (coverImgLocalPath) {
        coverImageUrl = await uploadToCloudinary(coverImgLocalPath);
    }

    //create user
    const newUser = await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatarUrl,
        coverImage: coverImageUrl
    })

    const createdUser = await User.findById(newUser._id).select("-password -refreshToken"); // Exclude password and refreshToken from the response

    if (!createdUser) throw new ApiError(500, "Failed to register the user");

    //send response
    res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User registered successfully"));
})

const generateAcessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        //validation
        if (!user) throw new ApiError(404, "User not found");

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        //save refresh token in db
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Failed to generate tokens");
    }
}

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    //VALIDATION EITHER USERNAME OR EMAIL CAN BE USED TO LOGIN
    if ((!email && !username) || !password) {
        throw new ApiError(400, "Username or email and password are required");
    }

    //find user from db using mail or username
    const user = await User.findOne({
        $or: [{ email }, { username }]
    })
    //validation
    if (!user) throw new ApiError(404, "User not found");

    //validate password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) throw new ApiError(401, "Invalid credentials");

    //generate access and refresh token
    const { accessToken, refreshToken } = await generateAcessAndRefreshToken(user._id);

    // Exclude password and refreshToken from the response
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    //validation
    if(!loggedInUser) throw new ApiError(500, "Failed to login the user");

    //send response
    res
        .status(200)
        .json(new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken}, "User logged in successfully"));
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    //validation
    if(!incomingRefreshToken) throw new ApiError(400, "Refresh Token is required");

    try {
        //extract user id from incoming refersh token
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFREAH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);

    //validation
    if(!user) throw new ApiError(401, "Invalid Refresh Token");
    //verify if the incoming refresh token matches the one stored in db
    if(user.refreshToken !== incomingRefreshToken) throw new ApiError(401, "Invalid Refresh Token");

    //generate new tokens by calling the helper function to generate access and refresh token
    const { accessToken, refreshToken: newRefreshToken } = await generateAcessAndRefreshToken(user._id);

    //update the refresh token in db
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    //configure cookie options
    const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Set secure flag in production
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }

    //send new refresh and access token in response
    return res
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", newRefreshToken, cookieOptions)
        .status(200)
        .json(new ApiResponse(200, { accessToken }, "Access token refreshed successfully"));
    } catch (error) {
        throw new ApiError(501, "Failed to refresh access token");
    }
})

const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    //find user from db
    const user = await User.findByIdAndUpdate(
        userId,
        {
            $set: { refreshToken: undefined }
        },
        { new: true }
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Set secure flag in production
    }

    //send response
    res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, null, "User logged out successfully"));
});

export { 
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser
};
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.models.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler( async (req, res) => {
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

    if(!avatarLocalPath) throw new ApiError(400, "Avatar image is required");

    //upload imgs to cloudinary and get urls
    const avatarUrl = await uploadToCloudinary(avatarLocalPath);
    let coverImageUrl = null;
    if(coverImgLocalPath){
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

    if(!createdUser) throw new ApiError(500, "Failed to register the user");

    //send response
    res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User registered successfully"));
})

export { registerUser }
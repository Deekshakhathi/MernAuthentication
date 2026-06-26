import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

import transporter from "../config/nodemailer.js";


export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.json({ success: false, message: "Please fill all the fields" });
    }
    try {

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const User = new userModel({
            name,
            email,
            password: hashedPassword

        });
        await User.save();
        const token = jwt.sign({ id: User._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to Our App!',
            text: `Hello ${email},\n\nThank you for registering with our app! We're excited to have you on board.\n\nBest regards,\nThe Team`
        }
        await transporter.sendMail(mailOptions);
        return res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({ success: false, message: "Please fill all the fields" });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "invalid email" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "invalid password" });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.json({ success: true, message: "login successful", user });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });
        return res.json({ success: true, message: "logout successful" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


//send verification otp
export const sendVerifyOtp = async (req, res) => {
    try {
        const { userID } = req.body;
        const user = await userModel.findById(userID);
        if (user.isAccountVerified) {
            return res.json({ success: false, message: "User not found" });
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyotp = otp;
        user.VerifyoptExprireAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            text: `Hello ${user.name},\n\nYour OTP for account verification is: ${otp}\n\nThis OTP is valid for 24 hours.\n\nBest regards,\nThe Team`
        }

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "OTP sent successfully" });
        return res.json({ success: true, message: "OTP sent successfully" });

    } catch {
        res.json({ success: false, message: error.message })
    }
}

export const verifyEmail = async (req, res) => {
    const { userID, otp } = req.body;
    if (!userID || !otp) {
        return res.json({ success: false, message: "Please provide userID and otp" });
    }
    try {
        const user = await userModel.findById(userID);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        if (user.verifyotp === '' || user.verifyotp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }
        if (Date.now() > user.VerifyoptExprireAt) {
            return res.json({ success: false, message: "OTP has expired" });
        }

        user.isAccountVerified = true;
        user.verifyotp = '';
        user.VerifyoptExprireAt = 0;
        await user.save();
        return res.json({ success: true, message: "Email verified successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true, message: "User is authenticated" });
    }
    catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
//send password reset otp
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.json({ success: false, message: "Please provide email" });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExprireAt = Date.now() + 15 * 60 * 60 * 1000;
        await user.save();
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Hello ${user.name},\n\nYour OTP for password reset is: ${otp}\n\nThis OTP is valid for 15 minutes.\n\nBest regards,\nThe Team`
        }
        await transporter.sendMail(mailOptions);
        return res.json({ success: true, message: "OTP sent successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }

}

//reset user password
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: "Please provide email, otp and new password" });
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        if (user.resetOtp ===""||user.resetOtp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }
        if (Date.now() > user.resetOtpExprireAt) {
            return res.json({ success: false, message: "OTP has expired" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExprireAt = 0;
        await user.save();
        return res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
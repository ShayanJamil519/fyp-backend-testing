import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import cloudinary from "cloudinary";
import moment from "moment";
import axios from "axios";
import crypto from "crypto";
import { createTransport } from "nodemailer";
import { getStatusWithRetry } from "../utils/recurrentFetcher.js";

export const UserSignup = async (req, role, res) => {
  try {
    let extractedText = "";
    let numb;
    const myCloudd = await cloudinary.v2.uploader.upload(req.avatara, {
      folder: "avatars",
      transformation: [
        { width: 1000, height: 1000, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });
    const myCloud = await cloudinary.v2.uploader.upload(req.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });
    const validateEmail = async (email) => {
      // Validate the email format
      if (!validator.isEmail(email)) {
        throw new Error("Invalid email format");
      }

      // Sanitize the email
      const sanitizedEmail = validator.normalizeEmail(email);

      let user = await User.findOne({ email: sanitizedEmail });
      return user ? false : true;
    };

    let emailNotRegistered = await validateEmail(req.email);
    if (!emailNotRegistered) {
      return res.status(400).json({
        message: `Email is already registered.`,
      });
    }
    const headers = {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": process.env.OCR_API_KEY,
    };

    const endpoint =
      "https://fyp-se20017.cognitiveservices.azure.com/vision/v3.2/read/analyze?language=ur";
    const requestData = {
      url: myCloudd.secure_url,
    };

    const response = await axios.post(endpoint, requestData, {
      headers: {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": process.env.OCR_API_KEY,
      },
    });

    const hah = response.headers["operation-location"].split("/").slice(-1)[0];
    const url = `https://fyp-se20017.cognitiveservices.azure.com/vision/v3.2/read/analyzeResults/${hah}`;

    const data = await getStatusWithRetry(url, headers);
    const readResults = data.analyzeResult.readResults;

    extractedText = "";

    readResults.forEach((readResult) => {
      readResult.lines.forEach((line) => {
        extractedText += line.text + "\n";
      });
    });

    const regex = /\b\d{5}-\d{7}-\d{1}\b/;
    const match = extractedText.match(regex);
    numb = match ? match[0] : null;
    if (numb == null) {
      return res.status(400).json({
        message: `Please Enter a valid Cnic Image`,
      });
    }
    const validateCnic = async (cnic) => {
      let user = await User.findOne({ cnic });
      return user ? false : true;
    };

    let cnicNotRegistered = await validateCnic(numb);
    if (!cnicNotRegistered) {
      return res.status(400).json({
        message: `Cnic is already registered.`,
      });
    }
    const password = await bcrypt.hash(req.password, 12);
    console.log("here" + numb);
    const newUser = new User({
      ...req,
      password,
      role,
      avatar: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
      cnic: numb,
    });

    await newUser.save();
    return res.status(201).json({
      ...newUser,
      message: "You have succesfully created your Account",
    });
  } catch (err) {
    return res.status(500).json({
      message: `${err.message}`,
    });
  }
};

export const userLogin = async (req, res) => {
  let { email, password } = req;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({
      message: "You are not registered.Please register yourself",
      success: false,
    });
  }
  let isMatch = await bcrypt.compare(password, user.password);
  if (isMatch) {
    let token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        image: user.avatar.url,
        subdivison: user.subDivison,
        district: user.district,
        ethAddress: user.ethAddress,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3 days" }
    );
    res.cookie("jwt", token, {
      expires: moment().add(3, "days").toDate(),
      httpOnly: true,
    });

    let result = {
      name: user.name,
      role: user.role,
      email: user.email,
      token: `Bearer ${token}`,
      expiresIn: 168,
    };

    return res.status(200).json({
      ...result,
      message: "You are now logged in.",
    });
  } else {
    return res.status(403).json({
      message: "Incorrect password.",
    });
  }
};

export const getUserID = (req, res) => {
  const userId = req.userId;
  return res.status(200).json({ userId });
};

export const getAllUsers = async (req, res) => {
  try {
    // Check if the requesting user has admin role

    const users = await User.find();
    return res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(404)
        .json({ status: false, message: "Insufficient Details" });
    }
    const userExists = await User.findOne({ email });

    if (!userExists) {
      return res
        .status(404)
        .json({ status: false, message: "Invalid user name or email" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

    userExists.passwordResetToken = resetToken;
    userExists.passwordResetExpires = resetExpires;

    await userExists.save();

    try {
      let transporter = createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.NODEMAILER_EMAIL,
          pass: process.env.NODEMAILER_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      let mailOptions = {
        to: userExists.email,
        from: process.env.NODEMAILER_EMAIL,
        subject: "Password Reset Email",
        text: `You are receiving this because you have requested the reset of the password for your account.\n
        Please click on the following link, or paste this into your browser to complete the process:\n
        ${process.env.FRONTEND_URL}/forgot-password/${resetToken}\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };

      await transporter.sendMail(mailOptions);
      return res.json({
        status: true,
        message: "Password reset email sent!",
      });
    } catch (error) {
      console.log({ error });
      return res.json({
        status: false,
        message: error.message,
      });
    }
  } catch (ex) {
    return res.status(500).json({ status: false, message: ex.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res
        .status(404)
        .json({ status: false, message: "Insufficient Details" });
    }

    const isTokenValid = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!isTokenValid) {
      return res.status(404).json({
        status: false,
        message: "Password reset token is invalid or has expired",
      });
    }

    const isUserFound = await User.findById(isTokenValid._id);

    if (!isUserFound) {
      return res.status(404).json({
        status: false,
        message: "We were unable to find a user for this token",
      });
    }

    if (isUserFound.passwordResetToken !== token) {
      return res.status(404).json({
        status: false,
        message:
          "User token and your token didn't match. You may have a more recent token in your mail list",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(newPassword, salt);

    isUserFound.password = hashPassword;
    isUserFound.passwordResetToken = undefined;
    isUserFound.passwordResetExpires = undefined;

    await isUserFound.save();

    return res.json({
      status: true,
      message: "Password has been successfully changed!",
    });
  } catch (ex) {
    return res.status(500).json({ status: false, message: ex.message });
  }
};

import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { jest } from "@jest/globals";
import cloudinary from "cloudinary";
import axios from "axios";
import { getStatusWithRetry } from "../utils/recurrentFetcher.js";
import {
  forgotPassword,
  resetPassword,
  userLogin,
  UserSignup,
} from "../controllers/authController.js";

jest.mock("../models/userModel.js");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");
jest.mock("cloudinary");
jest.mock("axios");
jest.mock("nodemailer");
jest.mock("../utils/recurrentFetcher.js");

describe("User Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("UserSignup", () => {
    it("should create a new user", async () => {
      // Mock the necessary functions and responses
      User.findOne.mockResolvedValue(null); // Email not registered
      await bcrypt.hash.mockResolvedValue("hashedpassword");
      await User.prototype.save.mockResolvedValue({
        _id: "userId",
        email: "test@test.com",
        name: "Test User",
        avatar: {
          public_id: "public_id",
          url: "https://example.com/image.jpg",
        },
      });

      const cloudinaryResponse = {
        secure_url: "https://example.com/image.jpg",
        public_id: "public_id",
      };
      await cloudinary.v2.uploader.upload
        .mockResolvedValueOnce(cloudinaryResponse)
        .mockResolvedValueOnce(cloudinaryResponse);
      axios.post.mockResolvedValue({
        headers: { "operation-location": "https://example.com/result" },
      });
      getStatusWithRetry.mockResolvedValue({
        analyzeResult: {
          readResults: [
            {
              lines: [{ text: "12345-1234567-1" }],
            },
          ],
        },
      });

      const req = {
        body: {
          email: "test@test.com",
          password: "password123",
          avatara: "avatara_path",
          avatar: "avatar_path",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await UserSignup(req.body, "user", res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("userLogin", () => {
    it("should login the user", async () => {
      const user = {
        _id: "userId",
        email: "test@test.com",
        password: "hashedpassword",
        role: "user",
        name: "Test User",
        avatar: { url: "https://example.com/image.jpg" },
      };
      User.findOne.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("jwtToken");

      const req = {
        body: {
          email: "test@test.com",
          password: "password123",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn(),
      };

      await userLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        name: user.name,
        role: user.role,
        email: user.email,
        token: `Bearer jwtToken`,
        expiresIn: 168,
        message: "You are now logged in.",
      });
    });
    // NOK: Handling errors when logging in the user
    it("should handle errors when logging in the user", async () => {
      User.findOne.mockResolvedValue(null);

      const req = {
        body: {
          email: "test@test.com",
          password: "password123",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await userLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "You are not registered.Please register yourself",
        success: false,
      });
    });
  });

  describe("forgotPassword", () => {
    it("should send a password reset email", async () => {
      const user = {
        _id: "userId",
        email: "test@test.com",
        token: "resetToken",
        save: jest.fn(),
      };
      User.findOne.mockResolvedValue(user);

      const req = {
        body: { email: "test@test.com" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await forgotPassword(req, res);

      expect(user.save).toHaveBeenCalled();
    });
    // NOK: Handling errors when logging in the user
    it("should handle errors when logging in the user", async () => {
      User.findOne.mockResolvedValue(null);

      const req = {
        body: {
          email: "test@test.com",
          password: "password123",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await userLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "You are not registered.Please register yourself",
        success: false,
      });
    });
    // NOT RUN: Default state, test not yet executed
    it("should not run the forgotPassword test (NOT RUN)", async () => {
      // NOT RUN test case is not executed
    });

    // NOT COMPLETED: Test case not completed
    it("should not run the forgotPassword test (NOT COMPLETED)", async () => {
      // NOT COMPLETED test case is not executed
    });
  });

  describe("resetPassword", () => {
    it("should reset the user password", async () => {
      const user = {
        _id: "userId",
        passwordResetToken: "resetToken",
        passwordResetExpires: Date.now() + 3600000,
        save: jest.fn(),
      };

      User.findOne.mockResolvedValue(user);
      User.findById.mockResolvedValue(user);

      const req = {
        body: {
          token: "resetToken",
          newPassword: "newPassword123",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await resetPassword(req, res);

      // Verify the response is as expected
      expect(res.json).toHaveBeenCalledWith({
        status: true,
        message: "Password has been successfully changed!",
      });
    });
  });
});

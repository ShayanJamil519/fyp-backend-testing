import mongoose from "mongoose";

import allowedSubDivision from '../constants/allowedSubDivision.js';
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "RecyclingPointAdmin", "LandfillAdmin","DistrictAdmin", "admin"],
    },
    password: {
      type: String,
      required: true,
    },
    ethAddress: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      enum: ["south", "east", "west","center", "malir" , "korangi" , "keamari"]
    },
    subDivison: {
      type: String,
      required: true,
    },

    area: {
      type: String,
    },
    cnic: {
      required : true,
      type: String,
      unique: true,
    },
    avatar: {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
    passwordResetToken: { type: String, default: "" },
    passwordResetExpires: { type: Date, default: new Date() },
  },
  { timestamps: true }
);
const User = mongoose.model("User", UserSchema);

export default User;


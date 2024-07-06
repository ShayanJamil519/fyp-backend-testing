import mongoose from "mongoose";

const responseSchema = new mongoose.Schema({
  time: { type: String },
  date: { type: Date, default: Date.now },
  comments: { type: String},
  image: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  }
});

const complaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  district: { type: String, required: true },
  subDivision: { type: String},
  date: { type: Date, default: Date.now },
  area: { type: String, required: true },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ["discarded","pending", "resolved"],
    default: "pending",
  },
  response: [responseSchema],
  resolvedAt: { type: Date },
  latitude: { type: Number},
  longitude: { type: Number},
  image: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  }
});

export default mongoose.model("Complaint", complaintSchema);

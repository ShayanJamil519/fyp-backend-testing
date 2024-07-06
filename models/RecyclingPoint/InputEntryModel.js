import mongoose from "mongoose";

const inputEntrySchema = new mongoose.Schema({
  dateAndTime: { type: Date, default: Date.now },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
  district: { type: String, required: true }, 
  quantityReceived: { type: Number, required: true },
  sourceSubdivision: { type: String },
  area: { type: String, required: true },
  image: {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
  },
});

export default mongoose.model("InputEntry", inputEntrySchema);
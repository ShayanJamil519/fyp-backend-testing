import mongoose from "mongoose";

const outputEntrySchema = new mongoose.Schema({
  inputEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "InputEntry",
    required: true,
  },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
  recyclablePercentage: { type: Number, required: true },
  plasticPercentage: { type: Number, required: true },
  glassPercentage: { type: Number, required: true },
  Metalloids: { type: Number, required: true },
  marketValue: { type: Number, required: true },
  image: {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
  },
  district: { type: String, required: true }, 
  sourceSubdivision: { type: String },
},
{ timestamps: true });

export default mongoose.model("OutputEntry", outputEntrySchema);
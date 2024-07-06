import mongoose from "mongoose";

const recyclingSchema = new mongoose.Schema({
  district: { type: String, required: true }, 
  sourceSubdivision: { type: String },
  name: { type: String, required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  image: {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
  },
  latestUrl: { type: String },
  latestUrlO: { type: String }
});

export default mongoose.model("recycling", recyclingSchema);



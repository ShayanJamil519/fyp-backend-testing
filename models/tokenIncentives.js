import mongoose from "mongoose";

const tokenIncentives = new mongoose.Schema({
  userId: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  subDivision: { type: String},
  random: { type: String},
  tokenBalance: { type: Number},
  year: { type: Number},

},{
  timestamps:true
});

export default mongoose.model("TokenIncentives", tokenIncentives);

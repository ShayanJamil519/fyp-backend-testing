import mongoose from "mongoose";

const wasteCollectionEntrySchema = new mongoose.Schema({
  districtAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  totalAmount: { type: Number, required: true },
  notes: { type: String },
  subdivision: { type: String, required: true },
  area: { type: String, required: true },
  image: {
    public_id: { type: String, required: true },
    url: { type: String, required: true },
  },
});

export default mongoose.model("WasteCollectionEntry", wasteCollectionEntrySchema);


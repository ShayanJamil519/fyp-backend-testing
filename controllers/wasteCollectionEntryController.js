import wasteCollectionEntry from "../models/wasteCollectionEntry.js";

import cloudinary from "cloudinary";
import moment from "moment";

export const createEntry = async (req, id, res) => {
  try {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });
    const newEntry = new WasteCollectionEntry({
      districtAdmin: id,
      date: req.body.date,
      notes: req.body.notes,
      totalAmount: req.body.totalAmount,
      subdivision: req.body.subdivision,
      area: req.body.area,
      image: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });

    await newEntry.save();
    return res.status(201).json({
      message: "Entry created successfully.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: err,
    });
  }
};

export const getWasteCollectionEntriesBySubdivision = async (req, res) => {
  try {
    const { subdivision } = req.params;
    const startOfToday = moment().startOf("day");
    console.log(startOfToday.toDate());
    console.log(subdivision);
    const wasteCollectionEntries = await wasteCollectionEntry.find({
      subdivision,
      date: { $gte: startOfToday.toDate() },
    });
    console.log(wasteCollectionEntries);
    return res.status(200).json({ wasteCollectionEntries });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

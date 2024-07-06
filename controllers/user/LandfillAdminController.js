import Landfill from "../../models/LandfillPoint/landfill.js";
import landfillInputEntrySchema from "../../models/LandfillPoint/inputEntryModel.js";
import OutputEntry from "../../models/RecyclingPoint/OutputEntryModel.js";
import InputEntry from "../../models/RecyclingPoint/InputEntryModel.js";
import cloudinary from "cloudinary";
import mongoose from "mongoose";


export const createInputEntry = async (req,admin ,  res) => {
  try {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });
    const { district, landfillSite, quantityReceived, sourceSubdivision, area } = req.body;
    const newEntry = new landfillInputEntrySchema ({
      admin ,
      district,
      quantityReceived,
      landfillSite,
      sourceSubdivision,
      area,
      image: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });
    await newEntry.save();

    return res.status(201).json({
      message: "Input entry created successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateLandfillLatestUrl = async (req, adminId , res) => {
  try {
    const { latestUrl } = req.body;
    const landfill = await Landfill.findOne({ admin: adminId });

    if (!landfill) {
      return res.status(404).json({
        message: "Landfill not found",
      });
    }

    // Update the latestUrl field
    landfill.latestUrl = latestUrl;
    await landfill.save();

    return res.status(200).json({
      message: "latestUrl updated successfully",
      landfill,
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      message: "Can't update the url at this time",
    });
  }
};

export const createLandfill = async (req, res) => {
  try {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });
    const { name, admin, district, subdivision } = req.body;
    const newLandfill = new Landfill({
      name,
      admin,
      district,
      subdivision,
      image: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });
    await newLandfill.save();

    return res.status(201).json({
      message: "Landfill created successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



// Delete landfill point by ID
export const deleteLandfillById = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if the landfill point exists
    const landfillPoint = await Landfill.findById(id);
    if (!landfillPoint) {
      return res.status(404).json({ message: "Landfill point not found." });
    }
    // Delete the landfill point
    await Landfill.findByIdAndDelete(id);
    return res.status(200).json({ message: "Landfill point deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



// Get all landfill points
export const getAllLandfillPoints = async (req, res) => {
  try {
    // Fetch all landfill points
    const landfillPoints = await Landfill.find();
    return res.status(200).json({ landfillPoints });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get landfill point by ID
export const getLandfillPointById = async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch landfill point by ID
    const landfillPoint = await Landfill.findById(id);
    if (!landfillPoint) {
      return res.status(404).json({ message: "Landfill point not found." });
    }
    return res.status(200).json({ landfillPoint });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getAllLandfillInputEntries = async (req, res) => {
  try {
    // Fetch all recycling points
    const landfillinputEntries = await landfillInputEntrySchema.find();
    return res.status(200).json({ landfillinputEntries });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateLandfillById = async (req, res) => {
  const { id } = req.params;
  const { district, sourceSubdivision, name, admin, image } = req.body;

  try {
    const updatedLandfill = await Landfill.findByIdAndUpdate(
      id,
      { district, sourceSubdivision, name, admin, image },
      { new: true }
    );

    if (!updatedLandfill) {
      return res.status(404).json({ error: "Landfill not found" });
    }

    return res.status(200).json(updatedLandfill);
  } catch (error) {
    console.error("Error updating landfill:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};




export const getLandfillEntriesByAdmin = async (req, res) => {
  try {
    const { landfillId } = req.params;

    const adminId = new mongoose.Types.ObjectId(landfillId)

    if (!mongoose.Types.ObjectId.isValid(adminId)) {
      return res.status(400).json({ message: 'Invalid admin ID format' });
    }
    console.log(adminId)
    const entries = await landfillInputEntrySchema.find({admin :adminId});
    const landfill = await Landfill.findOne({admin :adminId});
    console.log(landfill)
    const url = landfill.latestUrl
    console.log(url)
//console.log(entries)
    res.json({  entries , url });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

//first row first two columns
export const getLandfillPointAdminData = async (req,adminId, res) => {
  try {    
    if (!adminId) {
      return res.status(400).json({ status: false, message: "Admin ID is required" });
    }
    const totalQuantityReceived = await InputEntry.aggregate([
      { $match: { admin: new mongoose.Types.ObjectId(adminId) } },
      { $group: { _id: null, totalQuantity: { $sum: "$quantityReceived" } } }
    ]);
    const totalRecyclablePercentage = await OutputEntry.aggregate([
      { $match: { admin: new mongoose.Types.ObjectId(adminId) } },
      { $group: { _id: null, averageRecyclable: { $avg: "$recyclablePercentage" } } }
    ]);

    const result = {
      totalQuantityReceived: totalQuantityReceived[0] ? totalQuantityReceived[0].totalQuantity : 0,
      averageRecyclablePercentage: totalRecyclablePercentage[0] ? (100 - totalRecyclablePercentage[0].averageRecyclable) : 0
    };

    return res.json({
result,
    });

  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};


//first row , last 2 columns same as district admin
// Second Row , first column grapg same as distrcit admin

//Second row , second column for dark blue call api at line no 232 of district admin



// Light blue code below :
export const getLast7DaysWasteByAdmin = async (req,adminId  ,res) => {
  try {

    const currentDate = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(currentDate.getDate() - 6); // Get the date 6 days ago to include today

    // Initialize an array to hold the dates and quantities
    let dailyQuantities = Array.from({ length: 7 }, (_, i) => {
      let date = new Date();
      date.setDate(sevenDaysAgo.getDate() + i);
      return {
        date: date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
        quantityReceived: 0
      };
    });

    // Aggregate the quantities received in the last 7 days
    const quantities = await landfillInputEntrySchema.aggregate([
      {
        $match: {
          admin: new mongoose.Types.ObjectId(adminId),
          date: { $gte: sevenDaysAgo, $lte: currentDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$date' }
          },
          totalQuantity: { $sum: '$quantityReceived' }
        }
      }
    ]);

    // Merge the results with the dailyQuantities array
    quantities.forEach(item => {
      let found = dailyQuantities.find(d => d.date === item._id);
      if (found) {
        found.quantityReceived = item.totalQuantity;
      }
    });

    res.json(dailyQuantities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//top threads same as district admin
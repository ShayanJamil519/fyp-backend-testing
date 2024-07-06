import OutputEntry from "../../models/RecyclingPoint/OutputEntryModel.js";
import InputEntry from "../../models/RecyclingPoint/InputEntryModel.js";
import Recycling from "../../models/RecyclingPoint/recycling.js";
import cloudinary from "cloudinary";
import mongoose from "mongoose";


export const createRecyclingPoint = async (req, res) => {
  try {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });
    const { name, admin, district, subdivision } = req.body;
    const newRecyclingPoint = new Recycling({
      name,
      admin,
      district,
      subdivision,
      image: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });
    await newRecyclingPoint.save();

    return res.status(201).json({
      message: "Recycling Point created successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const updateRecyclingLatestUrl = async (req, adminId , res) => {
  try {
    const { latestUrl } = req.body;
    const landfill = await Recycling.findOne({ admin: adminId });

    if (!landfill) {
      return res.status(404).json({
        message: "Recycling not found",
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

export const updateRecyclingLatestUrlO = async (req, adminId , res) => {
  try {
    const { latestUrl } = req.body;
    const landfill = await Recycling.findOne({ admin: adminId });

    if (!landfill) {
      return res.status(404).json({
        message: "Recycling not found",
      });
    }

    // Update the latestUrl field
    landfill.latestUrlO = latestUrl;
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


// Delete recycling point by ID
export const deleteRecyclingPointById = async (req, res) => {
  try {
    const { id } = req.params;
    // Check if the recycling point exists
    const recyclingPoint = await Recycling.findById(id);
    if (!recyclingPoint) {
      return res.status(404).json({ message: "Recycling point not found." });
    }
    // Delete the recycling point
    await Recycling.findByIdAndDelete(id);
    return res.status(200).json({ message: "Recycling point deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get all recycling points
export const getAllRecyclingPoints = async (req, res) => {
  try {
    // Fetch all recycling points
    const recyclingPoints = await Recycling.find();
    return res.status(200).json({ recyclingPoints });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getAllInputEntries = async (req, res) => {
  try {
    // Fetch all recycling points
    const inputEntries = await InputEntry.find();
    return res.status(200).json({ inputEntries });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllOutputEntries = async (req, res) => {
  try {
    // Fetch all recycling points
    const outputEntries = await OutputEntry.find();
    return res.status(200).json({ outputEntries });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Get recycling point by ID
export const getRecyclingPointById = async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch recycling point by ID
    const recyclingPoint = await Recycling.findById(id);
    if (!recyclingPoint) {
      return res.status(404).json({ message: "Recycling point not found." });
    }
    return res.status(200).json({ recyclingPoint });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



export const createInputEntry = async (req,admin , res) => {
  try {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });
    const { district, quantityReceived, sourceSubdivision, area } = req.body;
    const newEntry = new InputEntry({
      admin ,
      district,
      quantityReceived,
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

export const createOutputEntry = async (req,admin, res) => {
  try {

    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

    const {
      inputEntryId,
      recyclablePercentage,
      plasticPercentage,
      glassPercentage,
      metalloidsPercentage,
      marketValue,
    } = req.body;

    const inputEntry = await InputEntry.findById(inputEntryId);
    if (!inputEntry) {
      return res.status(404).json({ message: "Input entry not found" });
    }

    console.log(inputEntry)
    const { district, sourceSubdivision } = inputEntry;
    console.log(district ,sourceSubdivision)
    const newOutputEntry = new OutputEntry({
      inputEntry: inputEntryId,
      admin,
      district,
      sourceSubdivision,
      recyclablePercentage,
      plasticPercentage,
      glassPercentage,
      Metalloids: metalloidsPercentage,
      marketValue,
      image: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
      createdAt: Date.now(),
    });

    await newOutputEntry.save();

    return res.status(201).json({
      message: "Output entry created successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const updateRecyclingById = async (req, res) => {
  const { id } = req.params;
  const { district, sourceSubdivision, name, admin, image } = req.body;

  try {
    const updatedRecycling = await Recycling.findByIdAndUpdate(
      id,
      { district, sourceSubdivision, name, admin, image },
      { new: true } // To return the updated document
    );

    if (!updatedRecycling) {
      return res.status(404).json({ error: "Recycling Point  not found" });
    }

    return res.status(200).json(updatedRecycling);
  } catch (error) {
    console.error("Error updating recycling:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const getRecyclingEntriesByAdmin = async (req, res) => {
  try {
    const { recyclingId } = req.params;
    const adminId = new mongoose.Types.ObjectId(recyclingId)

    const entries = await InputEntry.find({ admin: adminId });
    const landfill = await Recycling.findOne({admin :adminId});
    const url = landfill.latestUrl
    //console.log(entries)
    res.json({  entries , url });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
export const getRecyclingOutputEntriesByAdmin = async (req, res) => {
  try {
    const { recyclingId } = req.params;
    const adminId = new mongoose.Types.ObjectId(recyclingId)
    if (!adminId) {
      return res.status(404).json({ message: 'Admin not found for this recycling point' });
    }
    console.log(adminId)
    const entries = await OutputEntry.find({ admin: adminId });

    const landfill = await Recycling.findOne({admin :adminId});
    const url = landfill.latestUrlO
    console.log(entries)
    res.json({  entries , url });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

//first row first two columns
export const getRecyclingPointAdminData = async (req,adminId, res) => {
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
      averageRecyclablePercentage: totalRecyclablePercentage[0] ? totalRecyclablePercentage[0].averageRecyclable : 0
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
export const getAdminTotalQuantityLast7Days = async (req,adminId, res) => {
  try {


    if (!adminId) {
      return res.status(400).json({ status: false, message: "Admin ID is required" });
    }

    const dailyQuantities = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() - i);

      const entry = await InputEntry.aggregate([
        {
          $match: {
            admin: new mongoose.Types.ObjectId(adminId),
            dateAndTime: {
              $gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
              $lt: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
            }
          }
        },
        {
          $group: {
            _id: null,
            totalQuantity: { $sum: "$quantityReceived" }
          }
        }
      ]);

      dailyQuantities.push({
        date: currentDate,
        totalQuantity: entry.length > 0 ? entry[0].totalQuantity : 0
      });
    }

    return res.json({
      status: true,
      data: dailyQuantities,
    });

  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

//Percentage Graph 
export const getMonthlyWastePercentages = async (req,adminId, res) => {
  try {

    const currentDate = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);

    const entries = await OutputEntry.find({
      createdAt: { $gte: oneMonthAgo, $lte: currentDate },
      admin: new mongoose.Types.ObjectId(adminId)
    }).populate('inputEntry');

    const filteredEntries = entries.filter(entry => entry.inputEntry);

    let totalPlasticPercentage = 0;
    let totalGlassPercentage = 0;
    let totalMetalloids = 0;
    let totalRecyclablePercentage = 0;
    let entryCount = filteredEntries.length;

    // Sum up all the percentages
    filteredEntries.forEach(entry => {
      totalPlasticPercentage += entry.plasticPercentage;
      totalGlassPercentage += entry.glassPercentage;
      totalMetalloids += entry.Metalloids;
      totalRecyclablePercentage += entry.recyclablePercentage;
    });

    // Calculate the average percentages
    const averagePlasticPercentage = entryCount ? totalPlasticPercentage / entryCount : 0;
    const averageGlassPercentage = entryCount ? totalGlassPercentage / entryCount : 0;
    const averageMetalloids = entryCount ? totalMetalloids / entryCount : 0;
    const averageRecyclablePercentage = entryCount ? totalRecyclablePercentage / entryCount : 0;

    res.json({
      averagePlasticPercentage,
      averageGlassPercentage,
      averageMetalloids,
      averageRecyclablePercentage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//top threads same as district admin
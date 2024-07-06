import cloudinary from "cloudinary";
import Complaint from "../../models/complaintModel.js";
import User from "../../models/userModel.js";
import OutputEntry from "../../models/RecyclingPoint/OutputEntryModel.js";
import InputEntry from "../../models/RecyclingPoint/InputEntryModel.js";
import WasteCollectionEntry from "../../models/wasteCollectionEntry.js";
import TokenIncentives from "../../models/tokenIncentives.js";
import { startOfMonth, endOfMonth } from 'date-fns';
import mongoose from "mongoose";
import axios from 'axios';
export const getComplaintsInDistrict = async (req, res) => {
  try {
    const district = req.params.district;
    const complaints = await Complaint.find({
      district,
      status: "pending",
    });
    return res.status(200).json({ complaints });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteComplainById = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: "complaint not found." });
    }
    await Complaint.findByIdAndDelete(id);
    return res
      .status(200)
      .json({ message: "Complaint deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getPendingComplaintsInDistrict = async (req, res) => {
  try {
    const district = req.params.district;
    const pendingComplaints = await Complaint.find({
      district,
      status: "pending",
    });
    return res.status(200).json({ pendingComplaints });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addResponseToComplaint = async (req, res) => {
  try {
    const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
      folder: "avatars",
      transformation: [
        { width: 1000, height: 1000, crop: "limit" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });
    const { comments } = req.body;
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];
    const complaintId = req.params.id;
    const complaint = await Complaint.findOne({ _id: complaintId });
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    const newResponse = {
      time,
      date,
      comments,
      image: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    };
    complaint.response.push(newResponse);
    complaint.status = "resolved";
    await complaint.save();
    return res
      .status(201)
      .json({ message: "Response added successfully", complaint });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getSubdivisionsAndUserCounts = async (req, res) => {
  try {
    const { district } = req.params;
    const users = await User.find({ district, role: 'user' });
    const subdivisionCounts = {};
    users.forEach(user => {
      const subdivision = user.subDivison;
      subdivisionCounts[subdivision] = (subdivisionCounts[subdivision] || 0) + 1;
    });
    const currentDate = new Date();
    const previousMonthStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const previousMonthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

const inputEntries = await InputEntry.find({
  dateAndTime: { $gte: previousMonthStartDate, $lte: previousMonthEndDate }
});


const subdivisionOutputEntries = {};
const outputEntryPromises = inputEntries.map(async inputEntry => {
  const subdivision = inputEntry.sourceSubdivision;
  const outputEntry = await OutputEntry.findOne({ inputEntry: inputEntry._id });
  if (outputEntry) {
    return { subdivision, outputEntry };
  }
  return null;
});

const outputEntriesResults = await Promise.all(outputEntryPromises);

// Populate subdivisionOutputEntries
outputEntriesResults.forEach(result => {
  if (result) {
    const { subdivision, outputEntry } = result;
    if (!subdivisionOutputEntries[subdivision]) {
      subdivisionOutputEntries[subdivision] = [];
    }
    subdivisionOutputEntries[subdivision].push(outputEntry);
  }
});

  const subdivisions = [];
for (const subdivision in subdivisionCounts) {
  const userCount = subdivisionCounts[subdivision];
  const outputEntries = subdivisionOutputEntries[subdivision] || [];
  //console.log("chama")
  const populatedOutputEntries = await OutputEntry.populate(outputEntries, { path: 'inputEntry' });
  //console.log(populatedOutputEntries)
  const avgRecyclablePercentage = populatedOutputEntries.reduce((acc, entry) => acc + entry.recyclablePercentage, 0) / populatedOutputEntries.length;
  const avgPlasticPercentage = populatedOutputEntries.reduce((acc, entry) => acc + entry.plasticPercentage, 0) / populatedOutputEntries.length;
  const avgGlassPercentage = populatedOutputEntries.reduce((acc, entry) => acc + entry.glassPercentage, 0) / populatedOutputEntries.length;
  const avgMetalloids = populatedOutputEntries.reduce((acc, entry) => acc + entry.Metalloids, 0) / populatedOutputEntries.length;
  const avgMarketValue = populatedOutputEntries.reduce((acc, entry) => acc + entry.marketValue, 0) / populatedOutputEntries.length;
console.log(avgRecyclablePercentage)
  subdivisions.push({
    subdivision,
    userCount,
    avgRecyclablePercentage,
    avgPlasticPercentage,
    avgGlassPercentage,
    avgMetalloids,
    avgMarketValue
  });
    }
    res.json(subdivisions);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getSubdivisionComplaints = async (req, res) => {
  try {
    const { district } = req.params;
    const currentYear = new Date().getFullYear();

    const users = await User.find({ district });

    // Initialize the subdivisionComplaints object with subdivisions from users
    const subdivisionComplaints = {};
    users.forEach(user => {
      const subdivision = user.subDivison;
      if (subdivision && !subdivisionComplaints[subdivision]) {
        subdivisionComplaints[subdivision] = { total: 0, valid: 0, tokenBalance: 0 };
      }
    });

    // Get all complaints in the specified district
    const complaints = await Complaint.find({ district });

    // Aggregate the total and valid complaints for each subdivision
    complaints.forEach(complaint => {
      const subdivision = complaint.subDivision;
      if (subdivisionComplaints[subdivision]) {
        subdivisionComplaints[subdivision].total++;
        if (complaint.status !== 'discarded') {
          subdivisionComplaints[subdivision].valid++;
        }
      }
    });

    // Fetch the token balances for each subdivision
    for (const subdivision in subdivisionComplaints) {
      const tokenIncentive = await TokenIncentives.findOne({ subDivision: subdivision, year: currentYear });
      if (tokenIncentive) {
        subdivisionComplaints[subdivision].tokenBalance = tokenIncentive.tokenBalance;
      }
    }

    // Prepare the response object
    const response = {};
    for (const subdivision in subdivisionComplaints) {
      const { total, valid, tokenBalance } = subdivisionComplaints[subdivision];
      response[subdivision] = { total, valid, tokenBalance };
    }

    res.json(response);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const predictData = async (req, res) => {
  try {
    const { recyclablePercentage, plasticPercentage, glassPercentage, Metalloids, complaints, validcomplaints } = req.body;
    const data =  [recyclablePercentage, plasticPercentage, glassPercentage, Metalloids, complaints, validcomplaints]
    const response = await axios.post('https://another-lovat.vercel.app/predict', { data });
   
   
    res.json(response.data.prediction);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// first row first two stuff
export const getTotalWasteReceived = async (req, res) => {
  try {
    const { district } = req.params;
    const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(new Date());
    const inputEntries = await InputEntry.find({
      district,
      dateAndTime: { $gte: startDate, $lte: endDate }
    });
    const totalWasteReceived = inputEntries.reduce((acc, entry) => acc + entry.quantityReceived, 0);
    const outputEntries = await OutputEntry.find({
      createdAt: { $gte: startDate, $lte: endDate}
    })
    .populate({
      path: 'inputEntry',
      match: { district: district }
    });
  
    console.log(outputEntries)
    const avgRecyclablePercentage = outputEntries.length
      ? outputEntries.reduce((acc, entry) => acc + entry.recyclablePercentage, 0) / outputEntries.length
      : 0;


    res.json({ district, totalWasteReceived, avgRecyclablePercentage });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// profit this week lite blue
export const getTotalWasteLast7Days = async (req, res) => {
  try {
    const { district } = req.params;
    const currentDate = new Date();
    const sevenDaysAgo = new Date(currentDate);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const wasteCollectionEntries = await WasteCollectionEntry.find({
      date: { $gte: sevenDaysAgo, $lte: currentDate },
      districtAdmin: { $ne: null } 
    }).populate({
      path: 'districtAdmin'
    });
        const filteredEntries = wasteCollectionEntries.filter(entry => entry.districtAdmin && entry.districtAdmin.district === district);

    console.log(wasteCollectionEntries)
    
    const totalAmounts = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);
      const entriesForDay = filteredEntries.filter(entry =>
        entry.date.getFullYear() === date.getFullYear() &&
        entry.date.getMonth() === date.getMonth() &&
        entry.date.getDate() === date.getDate()
      );
      const totalAmountForDay = entriesForDay.reduce((total, entry) => total + entry.totalAmount, 0);
      totalAmounts.unshift(totalAmountForDay);
    }

    return res.status(200).json({ totalAmounts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// profit this week dark blue
export const getWasteRecycledByDistrict = async (req, res) => {
  try {
    //for 7 days
    const { district } = req.params;
    const currentDate = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(currentDate.getDate() - 7);

    // Create an array to hold the total waste for each of the last 7 days
    const dailyWaste = await InputEntry.aggregate([
      {
        $match: {
          district: district,
          dateAndTime: { $gte: sevenDaysAgo, $lte: currentDate },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$dateAndTime" },
            month: { $month: "$dateAndTime" },
            day: { $dayOfMonth: "$dateAndTime" },
          },
          totalQuantity: { $sum: '$quantityReceived' },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 }
      }
    ]);

    const result = [];
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(currentDate.getDate() - i);

      const dayData = dailyWaste.find(day => {
        return day._id.year === targetDate.getFullYear() &&
               day._id.month === (targetDate.getMonth() + 1) &&
               day._id.day === targetDate.getDate();
      });

      result.push({
        totalQuantity: dayData ? dayData.totalQuantity : 0,
      });
    }

    res.json({
      dailyWaste: result,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  metal plastic 
export const getMonthlyWastePercentages = async (req, res) => {
  try {
    const { district } = req.params;
    const currentDate = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);


    const entries = await OutputEntry.find({
      createdAt: { $gte: oneMonthAgo, $lte: currentDate }
    }).populate({
      path: 'inputEntry',
      match: { district: district }
    });

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

// total amount
export const getWasteCollectionBySubdivision = async (req, res) => {
  try {
    const { districtAdmin } = req.params;
    
    // Find entries for the specified district admin and join with token incentives
    const entries = await WasteCollectionEntry.aggregate([
      { $match: { districtAdmin: new mongoose.Types.ObjectId(districtAdmin) } },
      {
        $lookup: {
          from: 'tokenincentives',
          let: { subdivision: "$subdivision" },
          pipeline: [
            { $match: { $expr: { $eq: ["$subDivision", "$$subdivision"] } } },
            { $project: { tokenBalance: 1 } }
          ],
          as: 'tokenDetails'
        }
      },
      {
        $lookup: {
          from: 'outputentries',
          let: { subdivision: "$subdivision" },
          pipeline: [
            { $match: { $expr: { $eq: ["$sourceSubdivision", "$$subdivision"] } } },
            { $project: { recyclablePercentage: 1 } }
          ],
          as: 'outputDetails'
        }
      },
      {
        $addFields: {
          tokenBalance: { $ifNull: [{ $arrayElemAt: ["$tokenDetails.tokenBalance", 0] }, 0] },
          recyclablePercentage: { $ifNull: [{ $arrayElemAt: ["$outputDetails.recyclablePercentage", 0] }, 0] }
        }
      },
      {
        $group: {
          _id: "$subdivision",
          totalAmount: { $sum: "$totalAmount" },
          tokenBalance: { $first: "$tokenBalance" },
          recyclablePercentage: { $avg: "$recyclablePercentage" }
        },
      },
      {
        $project: {
          _id: 0,
          subdivision: "$_id",
          totalAmount: 1,
          tokenBalance: 1,
          recyclablePercentage: 1,
        },
      },
    ]);

    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
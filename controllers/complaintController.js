import Complaint from "../models/complaintModel.js";
import cloudinary from "cloudinary";
import { startOfMonth, endOfMonth } from 'date-fns';


const getLast12MonthsDateRanges = () => {
  const now = new Date();
  const dateRanges = [];

  for (let i = 0; i < 12; i++) {
    const startOfMonth = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    dateRanges.push({ startOfMonth, endOfMonth });
  }

  return dateRanges;
};

// export const getComplaintsByUser = async (req, res) => {
//   try {
//     const userId = req.params.userId;
//     const complaints = await Complaint.find({ userId });
//     return res.status(200).json({ complaints });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };



export const createComplaint = async (req,id, res ) => {
    try {
      const myCloud = await cloudinary.v2.uploader.upload(req.body.image, {
        folder: "avatars",
        transformation: [
          { width: 1000, height: 1000, crop: "limit" },
          { quality: "auto", fetch_format: "auto" },
        ],
      });
      const newComplaint = new Complaint({
        userId: id, 
        latitude: parseFloat(req.body.latitude),
        longitude: parseFloat(req.body.longitude),
        district: req.body.district,
        subDivision : req.body.subDivision,
        area: req.body.area,
        description: req.body.description,
        image: {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        }, 
      });
  
      await newComplaint.save();
  
      return res.status(201).json({
        message: "Complaint created successfully.",
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Internal server error.",
      });
    }
  };


  // first row last 2 values
  export const getComplaintsSummary = async (req, res) => {
    try {
      const { district } = req.params; 
      const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(new Date());
      const totalComplaints = await Complaint.countDocuments({
        district,
        date: { $gte: startDate, $lte: endDate },
      });
      const validComplaints = await Complaint.countDocuments({
        district,
        date: { $gte: startDate, $lte: endDate },
        status: { $ne: "discarded" },
      });
  
      return res.status(200).json({
        totalComplaints,
        validComplaints,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

// chartt resolved complaints
  export const getMonthlyComplaintsSummary = async (req, res) => {
    try {
      const { district } = req.params; 
      const dateRanges = getLast12MonthsDateRanges();
  
      const totalComplaintsArray = [];
      const resolvedComplaintsArray = [];
  
      for (const { startOfMonth, endOfMonth } of dateRanges) {
        const totalComplaints = await Complaint.countDocuments({
          district ,
         
          date: { $gte: startOfMonth, $lte: endOfMonth },
        });

        const resolvedComplaints = await Complaint.countDocuments({
          district,
          date: { $gte: startOfMonth, $lte: endOfMonth },
          status: 'resolved',
        });
  
        totalComplaintsArray.push(totalComplaints);
        resolvedComplaintsArray.push(resolvedComplaints);
      }
  
      return res.status(200).json({
        totalComplaints: totalComplaintsArray,
        resolvedComplaints: resolvedComplaintsArray,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
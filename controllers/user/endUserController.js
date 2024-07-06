import User from "../../models/userModel.js";
import Complaint from "../../models/complaintModel.js";
import TokenIncentives from "../../models/tokenIncentives.js";

// export const getTokenIncentives = async (req,res) => {
//   try {
//     let { id } = req.params;
//     const tokenIncentives = await TokenIncentives.find({userId:id });
//     return res.status(200).json({ tokenIncentives });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// };
export const getTokenIncentives = async (req, res) => {
  try {
    let { id } = req.params;
    const tokenIncentives = await TokenIncentives.find({ userId: id });

    if (tokenIncentives && tokenIncentives.length > 0) {
      return res.status(200).json({ exists: true, tokenIncentives });
    } else {
      return res.status(200).json({ exists: false, tokenIncentives: [] });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



export const updateTokenIncentives = async (req, res ) => {
  try {
    console.log("update controller")
    let { id } = req.params;
    let userId = [];
    userId.push(id)
    const tokenIncentives = new TokenIncentives({
      random: req.body.random,
      userId

    });

    await tokenIncentives.save();

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

export const createTokenIncentives = async (req,res ) => {
  try {
    const currentYear = new Date().getFullYear();


    const existingIncentive = await TokenIncentives.findOne({
      subDivision: req.body.subDivision,
      year: currentYear,
    });

    if (existingIncentive) {
      return res.status(400).json({
        message: "Token incentives for this subdivision and year already exist.",
      });
    }
    const tokenIncentives = new TokenIncentives({
      subDivision: req.body.subDivision, 
      year: currentYear,
      tokenBalance: req.body.tokenBalance

    });

    await tokenIncentives.save();

    return res.status(201).json({
      message: "created successfully.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};




//Get All the Complaints that are registered by this user
export const getAllComplaints = async (req, id,res) => {

    try {
      console.log("trying")
      const complaints = await Complaint.find({userId:id });
      return res.status(200).json({ complaints });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };


















//Get A specific Complaint by the user
export const getComplaintById = async (req, res) => {
    try {
      const complaintId = req.params.id;
      const complaint = await Complaint.findOne({ _id: complaintId });
      if (!complaint) {
        return res.status(404).json({ message: 'Complaint not found' });
      }
      return res.status(200).json({ complaint });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
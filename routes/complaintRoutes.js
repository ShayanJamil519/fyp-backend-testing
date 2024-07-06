import express from "express";
const router = express.Router();

import {
    createComplaint ,
     getComplaintsSummary,
     getMonthlyComplaintsSummary,
    //  getComplaintsByUser
  } from "../controllers/complaintController.js";

import {
    checkRole,
  } from "../middleware/checkRole.js";
  import {
    userAuth,
  } from "../middleware/userAuth.js";

import {
  getAllComplaints,
  getComplaintById
} from "../controllers/user/endUserController.js"
import {
  getComplaintsInDistrict,
  getPendingComplaintsInDistrict,
  addResponseToComplaint,
  deleteComplainById
} from "../controllers/user/districtAdminController.js"
  router.post(
    "/create-complaint",
    userAuth,
    checkRole(["user"]),
    async (req, res) => {
        createComplaint(req,req.userId , res);
    }
  );

  router.get(
    "/get-complaints",
    userAuth,
    // checkRole(["user"]),
    async (req, res) => {
        getAllComplaints(req,req.userId , res);
    }
  );

  router.delete(
    "/delete-complaint/:id",
    userAuth,
    checkRole(["DistrictAdmin"]),
    async (req, res) => {
      deleteComplainById(req, res);
    }
  );

  router.get(
    "/get-specific-complain/:id",
    userAuth,
    checkRole(["user"]),
    async (req, res) => {
        getComplaintById(req, res);
    }
  );

  router.get(
    "/get-complaints-district/:district",
    userAuth,
    async (req, res) => {
        getComplaintsInDistrict(req , res);
    }
  );

  router.get(
    "/get-complaints-district-pending/:district",
    userAuth,
    checkRole(["DistrictAdmin"]),
    async (req, res) => {
       getPendingComplaintsInDistrict(req , res);
    }
  );

  router.get(
    "/getComplaintsSummary/:district",
    userAuth,
    async (req, res) => {
       getComplaintsSummary(req , res);
    }
  );

  router.get(
    "/getMonthlyComplaintsSummary/:district",
    userAuth,
    async (req, res) => {
       getMonthlyComplaintsSummary(req , res);
    }
  );

  router.post(
    "/add-response-to-a-complaint/:id",
    userAuth,
    checkRole(["DistrictAdmin"]),
    async (req, res) => {
       addResponseToComplaint(req , res);
    }
  );


  export default router;
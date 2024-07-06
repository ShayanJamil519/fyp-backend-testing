import express from "express";
const router = express.Router();

import {
  checkRole,
} from "../middleware/checkRole.js";
import {
  userAuth,
} from "../middleware/userAuth.js";

import {
  createInputEntry,
  createLandfill,
  deleteLandfillById,
  getAllLandfillPoints,
  getLandfillPointById,
  updateLandfillById,
  getAllLandfillInputEntries,
  getLandfillEntriesByAdmin,
  getLandfillPointAdminData,
  getLast7DaysWasteByAdmin,
  updateLandfillLatestUrl
} from "../controllers/user/LandfillAdminController.js";

router.post(
  "/create-input-entry",
  userAuth,
  checkRole(["LandfillAdmin"]),
  async (req, res) => {
    createInputEntry(req,req.userId, res);
  }
);

router.post(
  "/updateLandfillLatestUrl",
  userAuth,
  checkRole(["LandfillAdmin"]),
  async (req, res) => {
    updateLandfillLatestUrl(req,req.userId, res);
  }
);

router.get(
  "/get-landfill-input-entries",
  userAuth,
  checkRole(["LandfillAdmin"]),
  async (req, res) => {
    getAllLandfillInputEntries(req, res);
  }
);

router.get(
  "/getLandfillEntriesByAdmin/:landfillId",
  async (req, res) => {
    getLandfillEntriesByAdmin(req, res);
  }
);

// Route for creating a recycling point
router.post(
  "/create-landfill-point",
  userAuth,
  checkRole(["admin"]),
  async (req, res) => {
    createLandfill(req, res);
  }
);

// Route for deleting a recycling point by ID
router.delete(
  "/delete-landfill-point/:id",
  userAuth,
  checkRole(["admin"]),
  async (req, res) => {
    deleteLandfillById(req, res);
  }
);

// Route for getting all recycling points
router.get(
  "/get-all-landfill-points",
  async (req, res) => {
    getAllLandfillPoints(req, res);
  }
);

// Route for getting a recycling point by ID
router.get(
  "/get-landfill-point/:id",
  async (req, res) => {
    getLandfillPointById(req, res);
  }
);



router.put(
  "/update/:id",
  userAuth,
  checkRole(["admin"]),
  async (req, res) => {
    updateLandfillById(req, res);
  }
);

router.get(
  "/getLandfillPointAdminData",
  userAuth,
  checkRole(["LandfillAdmin"]),
  async (req, res) => {
    getLandfillPointAdminData(req,req.userId, res);
  }
);



router.get(
  "/getLast7DaysWasteByAdmin",
  userAuth,
  checkRole(["LandfillAdmin"]),
  async (req, res) => {
    getLast7DaysWasteByAdmin(req,req.userId, res);
  }
);
export default router;

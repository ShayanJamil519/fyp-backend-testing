import express from "express";
import mongoose from "mongoose";
const router = express.Router();


import {
  checkRole,
} from "../middleware/checkRole.js";

  import {
    userAuth,
  } from "../middleware/userAuth.js";


import {
    createInputEntry,
    createOutputEntry,
    createRecyclingPoint,
    deleteRecyclingPointById,
    getAllRecyclingPoints,
    getRecyclingPointById,
    updateRecyclingById,
    getAllInputEntries,
    getAllOutputEntries,
    getRecyclingEntriesByAdmin,
    getRecyclingOutputEntriesByAdmin,
    getRecyclingPointAdminData,
    getAdminTotalQuantityLast7Days,
    getMonthlyWastePercentages,
    updateRecyclingLatestUrl,
    updateRecyclingLatestUrlO
  } from "../controllers/user/recyclingAdminController.js";

  router.post(
    "/create-input-entry",
    userAuth,
    checkRole(["RecyclingPointAdmin"]),
    async (req, res) => {
       createInputEntry(req ,req.userId, res);
    }
  );

  router.post(
    "/updateRecyclingLatestUrl",
    userAuth,
    checkRole(["RecyclingPointAdmin"]),
    async (req, res) => {
       updateRecyclingLatestUrl(req ,req.userId, res);
    }
  );

  router.post(
    "/updateRecyclingLatestUrlO",
    userAuth,
    checkRole(["RecyclingPointAdmin"]),
    async (req, res) => {
      updateRecyclingLatestUrlO(req ,req.userId, res);
    }
  );


  router.post(
    "/create-output-entry",
    userAuth,
    checkRole(["RecyclingPointAdmin"]),
    async (req, res) => {
       createOutputEntry(req ,req.userId, res);
    }
  );

  router.get(
    "/get-input-entries",
    userAuth,
    checkRole(["RecyclingPointAdmin"]),
    async (req, res) => {
      getAllInputEntries(req, res);
    }
  );
  
  router.get(
    "/get-output-entries",
    userAuth,
    checkRole(["RecyclingPointAdmin"]),
    async (req, res) => {
      getAllOutputEntries(req, res);
    }
  );

  // Route for creating a recycling point
router.post(
  "/create-recycling-point",
  userAuth,
  checkRole(["admin"]),
  async (req, res) => {
    createRecyclingPoint(req, res);
  }
);

// Route for deleting a recycling point by ID
router.delete(
  "/delete-recycling-point/:id",
  userAuth,
  checkRole(["admin"]),
  async (req, res) => {
    deleteRecyclingPointById(req, res);
  }
);

router.get(
  "/get-all-recycling-points",
  async (req, res) => {
    getAllRecyclingPoints(req, res);
  }
);

router.get(
  "/getRecyclingEntriesByAdmin/:recyclingId",
  async (req, res) => {
    getRecyclingEntriesByAdmin(req, res);
  }
);
router.get(
  "/getRecyclingOutputEntriesByAdmin/:recyclingId",
  async (req, res) => {
    getRecyclingOutputEntriesByAdmin(req, res);
  }
);

router.get(
  "/get-recycling-point/:id",
  async (req, res) => {
    getRecyclingPointById(req, res);
  }
);


router.put(
  "/update/:id",
  userAuth,
  checkRole(["admin"]),
  async (req, res) => {
    updateRecyclingById(req, res);
  }
);

router.get(
  "/getRecyclingPointAdminData",
  userAuth,
  checkRole(["RecyclingPointAdmin"]),
  async (req, res) => {
    getRecyclingPointAdminData(req,req.userId, res);
  }
);

router.get(
  "/getAdminTotalQuantityLast7Days",
  userAuth,
  checkRole(["RecyclingPointAdmin"]),
  async (req, res) => {
    getAdminTotalQuantityLast7Days(req,req.userId, res);
  }
);

router.get(
  "/getMonthlyWastePercentages",
  userAuth,
  checkRole(["RecyclingPointAdmin"]),
  async (req, res) => {
    getMonthlyWastePercentages(req,req.userId, res);
  }
);


  export default router;
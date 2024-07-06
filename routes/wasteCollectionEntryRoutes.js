import express from "express";
const router = express.Router();

import {
    createEntry,
    getWasteCollectionEntriesBySubdivision
  } from "../controllers/wasteCollectionEntryController.js";

import {
    checkRole,
  } from "../middleware/checkRole.js";

  import {
    userAuth,
  } from "../middleware/userAuth.js";

  router.post(
    "/create-entry",
    userAuth,
    checkRole(["DistrictAdmin"]),
    async (req, res) => {
        createEntry(req,req.userId , res);
    }
  );

  router.get(
    "/get-entry-subdivision/:subdivision",
    async (req, res) => {
        getWasteCollectionEntriesBySubdivision(req, res);
    }
  );

 

  export default router;
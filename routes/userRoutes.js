import express from "express";
const router = express.Router();

import {
  getTokenIncentives,
  updateTokenIncentives,
  createTokenIncentives
} from "../controllers/user/endUserController.js"

import {
  userAuth,
} from "../middleware/userAuth.js";

import {
  checkRole,
} from "../middleware/checkRole.js";
import {
    userLogin,
    UserSignup,
    getUserID,
    getAllUsers,
    forgotPassword,
    resetPassword
  } from "../controllers/authController.js";
  import {
getSubdivisionsAndUserCounts,
getSubdivisionComplaints,
predictData,
getTotalWasteReceived,
getTotalWasteLast7Days,
getWasteRecycledByDistrict,
getMonthlyWastePercentages,
getWasteCollectionBySubdivision
  } from "../controllers/user/districtAdminController.js"
  


router.post("/register-user", (req, res) => {
    UserSignup(req.body, "user", res);
 });
router.post("/register-DistrictAdmin", (req, res) => {
  UserSignup(req.body, "DistrictAdmin", res);
});
router.post("/register-RecyclingPointAdmin", (req, res) => {
  UserSignup(req.body, "RecyclingPointAdmin", res);
});

router.get(
  "/get-incentive/:id",
  userAuth,
  checkRole(["user"]),
  async (req, res) => {
      getTokenIncentives(req, res);
  }
);



router.post(
  "/create-incentive",
  userAuth,
  checkRole(["DistrictAdmin"]),
  async (req, res) => {
      createTokenIncentives(req , res);
  }
);
router.post(
  "/update-incentive/:id",
  userAuth,
  checkRole(["user"]),
  async (req, res) => {
      updateTokenIncentives(req, res);
  }
);

router.post(
  "/forgotPassword",
  async (req, res) => {
      forgotPassword(req, res);
  }
);

router.post(
  "/resetPassword",
  async (req, res) => {
      resetPassword(req, res);
  }
);
 router.post("/Login", async (req, res) => {
  await userLogin(req.body, res);
});

 

 router.get(
   "/se-protected",
   userAuth,
   checkRole(["user"]),
   async (req, res) => {
     return res.json(`welcome ${req.body.name}`);
   }
 );

 router.get(
  "/get-UserId",
  userAuth,
  async (req, res) => {
    getUserID(req,res);
}
);

router.get(
  "/get-all-users",
  userAuth, 
  async (req, res) => {
    getAllUsers(req, res);
  }
);
 

router.get(
  "/get-subDivision/:district",
  userAuth, 
  checkRole(["DistrictAdmin"]),
  async (req, res) => {
    getSubdivisionsAndUserCounts(req, res);
  }
);

router.get(
  "/get-subDivision-complaints/:district",
  userAuth, 
  checkRole(["DistrictAdmin"]),
  async (req, res) => {
    getSubdivisionComplaints(req, res);
  }
);

router.get(
  "/getTotalWasteReceived/:district",
  userAuth,
  async (req, res) => {
    getTotalWasteReceived(req, res);
  }
);

router.get(
  "/getTotalWasteLast7Days/:district",
  userAuth, 
  async (req, res) => {
    getTotalWasteLast7Days(req, res);
  }
);

router.get(
  "/getWasteRecycledByDistrict/:district",
  userAuth, 
  async (req, res) => {
    getWasteRecycledByDistrict(req, res);
  }
);

router.get(
  "/getMonthlyWastePercentages/:district",
  userAuth, 
  async (req, res) => {
    getMonthlyWastePercentages(req, res);
  }
);
router.post(
  "/predict",
  userAuth,
  checkRole(["DistrictAdmin"]),
  async (req, res) => {
      predictData(req,res);
  }
);

router.get(
  "/getWasteCollectionBySubdivision/:districtAdmin",
  userAuth, 
  async (req, res) => {
    getWasteCollectionBySubdivision(req, res);
  }
);

export default router;
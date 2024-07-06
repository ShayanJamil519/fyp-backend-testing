import express from "express";
const router = express.Router();

import {
    createThread,
    addReplyToThread,
    getAllThreads,
    increaseLikesForThread,
    getThreadById,
    getTopViewedThreads
  } from "../controllers/threadController.js";

  import {
    checkRole,
  } from "../middleware/checkRole.js";

  import {
    userAuth,
  } from "../middleware/userAuth.js";

  router.post(
    "/create-thread",
    userAuth,
    async (req, res) => {
        createThread(req,req.userId , res);
    }
  );

  router.get(
    "/get-threads",
    userAuth,
    async (req, res) => {
        getAllThreads(req, res);
    }
  );
  router.get(
    "/get-top-threads",
    userAuth,
    async (req, res) => {
        getTopViewedThreads(req, res);
    }
  );

  router.get(
    "/get-thread/:id",
    userAuth,
    async (req, res) => {
        getThreadById(req,req.userId , res);
    }
  );



  router.post(
    "/add-reply-to-a-thread/:id",
    userAuth,
    async (req, res) => {
       addReplyToThread(req ,req.userId ,  res);
    }
  );

  router.post(
    "/like",
    userAuth,
    async (req, res) => {
       increaseLikesForThread(req ,  res);
    }
  );


  export default router;
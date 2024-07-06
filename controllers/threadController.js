import Thread from "../models/threadModel.js";
import mongoose from "mongoose";

export const createThread = async (req,id, res ) => {
    try{
      const newComplaint = new Thread({
        userId: id, 
        title: req.body.title,
        userName : req.body.userName,
        avatar : req.body.avatar,
        tcontent : req.body.tcontent,
      });
      await newComplaint.save();
      const threads = await Thread.find();
      return res.status(201).json({
        message: "Thread created successfully.",
        threads : threads,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        message: "Please make sure the content is correct.",
      });
    }
  };

export  const getAllThreads = async (req, res) => {
    try {
      const threads = await Thread.find();
      return res.status(200).json(threads);
    } catch (error) {
      console.error('Error fetching threads:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };


  export const addReplyToThread = async (req,id , res) => {
    try {
     
      const {  content ,timeOfReply ,RuserName ,rAvatar } = req.body;
      const threadId = req.params.id;
      const userId = id;
      const thread = await Thread.findOne({ _id: threadId });
      if (!thread) {
        return res.status(404).json({ message: 'Thread not found' });
      }
      const newResponse = { userId , timeOfReply ,content , RuserName , rAvatar };
      thread.replies.push(newResponse);
      await thread.save();
      return res.status(201).json({ message: 'Reply added successfully', thread });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Kindly check your content again' });
    }
  };


  export const increaseLikesForThread = async (req,res) => {
    try {

        const {  userId , threadId} = req.body;
        console.log(userId)
      const thread = await Thread.findById(threadId);

      if (thread.likes.includes(userId)) {
        return res.status(400).json({ error: 'User has already liked this thread' });
      }
      thread.likes.push(userId);
      thread.likesCount = thread.likes.length;
      await thread.save();

      return res.status(200).json(thread);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ error: 'Error increasing likes for thread:' });
    }
  };


  export const getThreadById = async (req,userId, res) => {
    try {
      const id  = req.params.id;
      const thread = await Thread.findById(id);
      if (!thread) {
        return res.status(404).json({ error: 'Thread not found' });
      }
      const currentTime = new Date();
    const startOfToday = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
    const endOfToday = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate() + 1);
    const userViewsToday = thread.viewsLog.filter(log => 
      log.userId.equals(userId) && log.timestamp >= startOfToday && log.timestamp < endOfToday
  );

  if (userViewsToday.length < 3) {
      thread.views += 1;
      thread.viewsLog.push({ userId: new mongoose.Types.ObjectId(userId), timestamp: currentTime });
      await thread.save();
  }
    return res.status(200).json(thread);
    } catch (error) {
      console.error('Error getting thread by ID:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

  export const getTopViewedThreads = async (req, res) => {
    try {
        const topViewedThreads = await Thread.find({ views: { $gt: 0 } }).sort({ views: -1 }).limit(6).exec();

        if (topViewedThreads.length === 0) {
            return res.status(404).json({ message: 'No threads with views found' });
        }

        res.json(topViewedThreads);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
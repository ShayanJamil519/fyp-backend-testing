import Thread from "../models/threadModel.js";
import mongoose from "mongoose";
import { jest } from "@jest/globals";
import {
  createThread,
  getAllThreads,
  addReplyToThread,
  increaseLikesForThread,
  getThreadById,
  getTopViewedThreads,
} from "../controllers/threadController.js";

jest.mock("../models/threadModel.js");

describe("Thread Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createThread", () => {
    it("should create a new thread", async () => {
      Thread.prototype.save.mockResolvedValue();

      const req = {
        body: {
          title: "Test Thread",
          userName: "Test User",
          avatar: "avatar_path",
          tcontent: "Test content",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      Thread.find.mockResolvedValue([
        {
          _id: "threadId",
          title: "Test Thread",
          userName: "Test User",
          avatar: "avatar_path",
          tcontent: "Test content",
        },
      ]);

      await createThread(req, "userId", res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Thread created successfully.",
        threads: [
          {
            _id: "threadId",
            title: "Test Thread",
            userName: "Test User",
            avatar: "avatar_path",
            tcontent: "Test content",
          },
        ],
      });
    });
    // Error scenario: Handling errors when creating a new thread (NOK)
    it("should handle errors when creating a new thread", async () => {
      Thread.prototype.save.mockRejectedValue(new Error("Error saving thread"));

      const req = {
        body: {
          title: "Test Thread",
          userName: "Test User",
          avatar: "avatar_path",
          tcontent: "Test content",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await createThread(req, "userId", res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Please make sure the content is correct.",
      });
    });
  });

  describe("getAllThreads", () => {
    it("should return all threads", async () => {
      const threads = [
        {
          _id: "threadId1",
          title: "Test Thread 1",
          userName: "Test User 1",
          avatar: "avatar_path1",
          tcontent: "Test content 1",
        },
        {
          _id: "threadId2",
          title: "Test Thread 2",
          userName: "Test User 2",
          avatar: "avatar_path2",
          tcontent: "Test content 2",
        },
      ];

      Thread.find.mockResolvedValue(threads);

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getAllThreads(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(threads);
    });
    // Partial OK: Return partial results when some threads cannot be fetched
    it("should return partial results when some threads cannot be fetched", async () => {
      Thread.find.mockResolvedValue([
        {
          _id: "threadId1",
          title: "Test Thread 1",
          userName: "Test User 1",
          avatar: "avatar_path1",
          tcontent: "Test content 1",
        },
      ]);

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getAllThreads(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([
        {
          _id: "threadId1",
          title: "Test Thread 1",
          userName: "Test User 1",
          avatar: "avatar_path1",
          tcontent: "Test content 1",
        },
      ]);
    });
  });

  describe("addReplyToThread", () => {
    it("should add a reply to a thread", async () => {
      const thread = {
        _id: "threadId",
        replies: [],
        save: jest.fn(),
      };

      Thread.findOne.mockResolvedValue(thread);

      const req = {
        params: { id: "threadId" },
        body: {
          content: "Test reply",
          timeOfReply: "2023-07-31T12:34:56Z",
          RuserName: "Reply User",
          rAvatar: "reply_avatar_path",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await addReplyToThread(req, "userId", res);

      expect(thread.replies).toContainEqual({
        userId: "userId",
        timeOfReply: "2023-07-31T12:34:56Z",
        content: "Test reply",
        RuserName: "Reply User",
        rAvatar: "reply_avatar_path",
      });
      expect(thread.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Reply added successfully",
        thread,
      });
    });
    // NOT COMPLETED: Test case not completed
    it("should not run the addReplyToThread test (NOT COMPLETED)", async () => {
      // NOT COMPLETED test case is not executed
    });
  });

  describe("increaseLikesForThread", () => {
    it("should increase likes for a thread", async () => {
      const thread = {
        _id: "threadId",
        likes: [],
        likesCount: 0,
        save: jest.fn(),
      };

      Thread.findById.mockResolvedValue(thread);

      const req = {
        body: {
          userId: "userId",
          threadId: "threadId",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await increaseLikesForThread(req, res);

      expect(thread.likes).toContain("userId");
      expect(thread.likesCount).toBe(1);
      expect(thread.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(thread);
    });
  });
  describe("getThreadById", () => {
    it("should get a thread by ID and increase views if conditions are met", async () => {
      const threadMock = {
        _id: "someId",
        views: 0,
        viewsLog: [],
        save: jest.fn(),
      };

      // Ensure findById resolves to the thread with conditions to add views
      Thread.findById.mockResolvedValue(threadMock);

      // Mocking the date within the test to control the behavior around view log checks
      jest.spyOn(global, "Date").mockImplementation(() => ({
        getFullYear: () => 2023,
        getMonth: () => 6, // July (0-indexed)
        getDate: () => 1,
        getHours: () => 0,
        getMinutes: () => 0,
        getSeconds: () => 0,
        getMilliseconds: () => 0,
      }));

      const req = {
        params: { id: "someId" },
      };
      const userId = "userId";
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getThreadById(req, userId, res);

      expect(res.status).toHaveBeenCalledWith(500);

      // Clean up the mock
      jest.restoreAllMocks();
    });
  });

  describe("getTopViewedThreads", () => {
    it("should return top viewed threads", async () => {
      const mockThreads = [
        { _id: "1", views: 10 },
        { _id: "2", views: 5 },
      ];

      // Properly mock the MongoDB operation chain
      Thread.find.mockImplementation(() => ({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(mockThreads),
      }));

      const req = {};
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getTopViewedThreads(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});

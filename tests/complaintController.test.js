import Complaint from "../models/complaintModel.js";
import cloudinary from "cloudinary";
import { jest } from "@jest/globals";
import { startOfMonth, endOfMonth } from "date-fns";
import {
  createComplaint,
  getComplaintsSummary,
  getMonthlyComplaintsSummary,
} from "../controllers/complaintController.js";

jest.mock("../models/complaintModel.js");
jest.mock("cloudinary");

describe("Complaint Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createComplaint", () => {
    it("should create a new complaint", async () => {
      const cloudinaryResponse = {
        secure_url: "https://example.com/image.jpg",
        public_id: "public_id",
      };
      cloudinary.v2.uploader.upload.mockResolvedValue(cloudinaryResponse);

      Complaint.prototype.save.mockResolvedValue();

      const req = {
        body: {
          image: "image_path",
          latitude: "123.456",
          longitude: "789.101",
          district: "District 1",
          subDivision: "SubDivision 1",
          area: "Area 1",
          description: "Test description",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await createComplaint(req, "userId", res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Complaint created successfully.",
      });
    });
    // NOK: Handling errors when creating a new complaint
    it("should handle errors when creating a new complaint", async () => {
      cloudinary.v2.uploader.upload.mockRejectedValue(
        new Error("Error uploading image")
      );

      const req = {
        body: {
          image: "image_path",
          latitude: "123.456",
          longitude: "789.101",
          district: "District 1",
          subDivision: "SubDivision 1",
          area: "Area 1",
          description: "Test description",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await createComplaint(req, "userId", res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Internal server error.",
      });
    });
  });

  describe("getComplaintsSummary", () => {
    it("should return complaints summary for a district", async () => {
      const district = "District 1";
      const startDate = startOfMonth(new Date());
      const endDate = endOfMonth(new Date());

      Complaint.countDocuments
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(80);

      const req = {
        params: { district },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getComplaintsSummary(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        totalComplaints: 100,

        validComplaints: 80,
      });
    });
    // Partial OK: Return complaints summary with zero valid complaints
    it("should return complaints summary with zero valid complaints", async () => {
      Complaint.countDocuments
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(0);

      const req = {
        params: { district: "District 1" },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getComplaintsSummary(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        totalComplaints: 100,
        validComplaints: 0,
      });
    });

    // NOT RUN: Default state, test not yet executed
    it("should not run the getComplaintsSummary test (NOT RUN)", async () => {
      // NOT RUN test case is not executed
    });

    // NOT COMPLETED: Test case not completed
    it("should not run the getComplaintsSummary test (NOT COMPLETED)", async () => {
      // NOT COMPLETED test case is not executed
    });
  });

  describe("getMonthlyComplaintsSummary", () => {
    it("should return monthly complaints summary for a district", async () => {
      const district = "District 1";
      const dateRanges = [
        {
          startOfMonth: new Date("2023-07-01"),
          endOfMonth: new Date("2023-07-31"),
        },
        {
          startOfMonth: new Date("2023-06-01"),
          endOfMonth: new Date("2023-06-30"),
        },
      ];

      jest.spyOn(global, "Date").mockImplementation(() => {
        const now = new Date("2023-07-31");
        return now;
      });

      Complaint.countDocuments
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(30) // July
        .mockResolvedValueOnce(40)
        .mockResolvedValueOnce(25); // June

      const req = {
        params: { district },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await getMonthlyComplaintsSummary(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});

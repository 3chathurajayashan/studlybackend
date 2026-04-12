import express from "express";
import { createAdminNotice, getAllAdminNotices, deleteAdminNotice } from "../Controllers/AdminNoticeController.js";

const router = express.Router();

// ROUTES
router.post("/", createAdminNotice);
router.get("/all", getAllAdminNotices);
router.delete("/:id", deleteAdminNotice);

export default router;
import express from "express";
import {
  createTicket,
  getTickets,
  getTicketById,
  addMessage,
  upload,
  editTicket,
  deleteTicket
} from "../Controllers/ticketController.js";

const router = express.Router();

// Create a new ticket with multiple attachments
router.post("/", upload.array("attachments"), createTicket);

// Get all tickets
router.get("/", getTickets);
// Edit ticket
router.put("/:id", upload.array("attachments"), editTicket);

// Delete ticket
router.delete("/:id", deleteTicket);


// Get single ticket by ID
router.get("/:id", getTicketById);

// Add message to ticket (with optional attachments)
router.post("/:id/message", upload.array("attachments"), addMessage);

export default router;
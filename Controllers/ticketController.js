import Ticket from "../Models/ticketModel.js";
import cloudinary from "../Config/cloudinary.js"; 
import multer from "multer";
import fs from "fs";
import path from "path";

// Setup multer storage (temporary storage before uploading to Cloudinary)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

export const upload = multer({ storage });

// ----------------- CREATE -----------------
export const createTicket = async (req, res) => {
  try {
    const { instructor, title, description, category, priority } = req.body;

    let attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "auto",
          folder: "tickets",
        });

        attachments.push({
          url: result.secure_url,
          public_id: result.public_id,
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
        });

        fs.unlinkSync(file.path);
      }
    }

    const ticket = await Ticket.create({
      instructor,
      title,
      description,
      category,
      priority,
      attachments,
    });

    res.status(201).json({ success: true, ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// ----------------- GET ALL -----------------
export const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find()
      .populate("instructor", "name email profilePicture")
      .populate("messages.sender", "name email");
    res.json({ success: true, tickets });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// ----------------- GET SINGLE -----------------
export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate("instructor", "name email")
      .populate("messages.sender", "name email");

    if (!ticket)
      return res.status(404).json({ success: false, message: "Ticket not found" });

    res.json({ success: true, ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// ----------------- ADD MESSAGE -----------------
export const addMessage = async (req, res) => {
  try {
    const { sender, senderRole, message } = req.body;
    const ticketId = req.params.id;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket)
      return res.status(404).json({ success: false, message: "Ticket not found" });

    let attachments = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "auto",
          folder: "ticket_messages",
        });

        attachments.push({
          url: result.secure_url,
          public_id: result.public_id,
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
        });

        fs.unlinkSync(file.path);
      }
    }

    ticket.messages.push({ sender, senderRole, message, attachments });
    await ticket.save();

    res.json({ success: true, ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// ----------------- EDIT TICKET -----------------
export const editTicket = async (req, res) => {
  try {
    const ticketId = req.params.id;
    const { title, description, category, priority } = req.body;

    const ticket = await Ticket.findById(ticketId);
    if (!ticket)
      return res.status(404).json({ success: false, message: "Ticket not found" });

    // Replace attachments if new files uploaded
    if (req.files && req.files.length > 0) {
      // Delete old attachments from Cloudinary
      if (ticket.attachments.length > 0) {
        for (const att of ticket.attachments) {
          await cloudinary.uploader.destroy(att.public_id);
        }
      }

      const newAttachments = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "auto",
          folder: "tickets",
        });

        newAttachments.push({
          url: result.secure_url,
          public_id: result.public_id,
          fileName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
        });

        fs.unlinkSync(file.path);
      }

      ticket.attachments = newAttachments;
    }

    // Update other fields
    ticket.title = title || ticket.title;
    ticket.description = description || ticket.description;
    ticket.category = category || ticket.category;
    ticket.priority = priority || ticket.priority;

    await ticket.save();
    res.json({ success: true, ticket });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error", error });
  }
};

// ----------------- DELETE TICKET -----------------
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // delete attachments from cloudinary
    if (ticket.attachments && ticket.attachments.length > 0) {
      for (const file of ticket.attachments) {
        if (file.public_id) {
          await cloudinary.uploader.destroy(file.public_id);
        }
      }
    }

    await Ticket.findByIdAndDelete(id);

    res.json({ message: "Ticket deleted successfully" });

  } catch (error) {
    console.error("Delete ticket error:", error);
    res.status(500).json({ message: "Server error while deleting ticket" });
  }
};
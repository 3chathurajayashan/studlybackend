import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { connectDB } from "./Config/DB.js";
import courseRoutes from "./Routes/CourseRoute.js";
import subjectRoute from './Routes/SubjectRoutes.js'
import userRoutes from './Routes/UserRoutes.js'
import noticeRoute from './Routes/NoticeRoutes.js'
import AdminNotice from './Routes/AdminNoticeRoute.js'
import AssestmentRoute from './Routes/AssessmentRoutes.js'
import ContentRoute from './Routes/ContentRoutes.js'
 import ticketRoute from './Routes/ticketRoutes.js'
 import enrollmentRoutes from './Routes/enrollmentRoutes.js'
 import progressRoute from './Routes/ProgressRoutes.js'

  

const app = express();
const PORT = process.env.PORT || 5050;

 
await connectDB();

//setting various http headers
app.use(helmet());

 
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));
app.options("*", cors());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logger middleware
app.use(morgan("dev"));

// Rate limiting (Anti abuse protection)
//A single IP can send maximum 200 requests in 15 minutes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

 // Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LMS Course API OK!"
  });
});

app.use("/api", courseRoutes);
app.use("/api/subjects", subjectRoute);
app.use("/api/users", userRoutes);
app.use("/api/notice", noticeRoute)
app.use("/api/admin/notice", AdminNotice)
app.use("/api/assestment",AssestmentRoute )
app.use("/api/content",ContentRoute )
 app.use("/api/tickets", ticketRoute)
 app.use("/api/enrollments", enrollmentRoutes);
 app.use("/api/progress", progressRoute)


app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
 


 
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

 
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

 
 export default app;
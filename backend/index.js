import cookieParser from "cookie-parser";
import express from "express";
import cors from 'cors';
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.js";
import companyRoute from "./routes/company.js";
import jobRoute from "./routes/job.js";
import ApplicationRoute from "./routes/application.js";
dotenv.config ({});

const app = express();

// app.get("/home",(req,res)=>{
//     return res.status(200).json({
//         message:"I am coming from backend",
//         success:true
//     })
// });

//middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
const corsOptions ={
    origin:'http://localhost:5173',
    credentials:true
}
app.use(cors(corsOptions))


//api's
app.use("/api/v1/user",userRoute);
app.use("/api/v1/company",companyRoute);
app.use("/api/v1/job",jobRoute);
app.use("/api/v1/application",ApplicationRoute);


const PORT =process.env.PORT || 3000;
app.listen(PORT,()=>{
    connectDB();
    console.log(`server running at port ${PORT}`); 
})
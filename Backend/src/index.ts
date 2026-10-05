import dotenv from "dotenv"
import cors from "cors"
import express from "express";
import type {Response,Application} from 'express'
import authRouter from "./routes/auth.routes.js";
import articlesRouter from "./routes/article.routes.js";
import connectDB from "./config/db.js";
import { createUserTable } from "./models/user.model.js";
import { createArticleTable } from "./models/article.model.js";

dotenv.config();

//type application
const app: Application = express();

app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use("/api/auth",authRouter);
app.use("/api/articles",articlesRouter)

app.use(
    (
        err:any,
        res:Response,
        
    )=>{
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(statusCode).json({
      status: "error",
      message,
    });
    }
)


const PORT = process.env.PORT || 3000;

const startServer = async():Promise<void>=>{
    // await testDbConnection();
    await connectDB();
    //creating tables
    await createUserTable();
    await createArticleTable();
    app.listen(PORT,()=>{
    console.log(`Server is running on Port ${PORT}`);
})
}

startServer();
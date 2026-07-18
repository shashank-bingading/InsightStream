import cors from "cors"
import dotenv from "dotenv"
import express from "express";
import type {Request,Response,Application} from 'express'

dotenv.config();

//type application
const app: Application = express();

app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.get('/',(req:Request,res:Response)=>{
    res.status(200).json({"message":"Connection Successful"});

});

//for routes 

//
const PORT = process.env.PORT || 3000;

const startServer = async():Promise<void>=>{
    // await testDbConnection();

    app.listen(PORT,()=>{
    console.log(`Server is running on Port ${PORT}`);
})
}

startServer();
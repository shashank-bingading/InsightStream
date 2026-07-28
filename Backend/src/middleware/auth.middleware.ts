import type {NextFunction, Request,Response} from 'express'
import jwt from "jsonwebtoken";

export interface Jwtpayload {
    id:string,
    email:string,
}

export interface AuthenticatedRequest extends Request {
    user?: Jwtpayload;
}

export const authenticateToken = (req:AuthenticatedRequest,res:Response,next:NextFunction):void=>{
    try {
        //checking for the presence of authheaders
        const authHeader =  req.headers["authorization"];
        //here authheader = Bearer dafabsalkfbajhasdvfkadvsa
        //we want the second part obv
        const token = authHeader && authHeader.split(" ")[1];

        if(!token){
            res.status(401).json({"message":"Access token missing or invalid"})
            return;
        }

        const secret = process.env.JWT_SECRET || "fallback_secret";
        const decoded = jwt.verify(token,secret) as Jwtpayload;

        req.user = decoded;

        next();

    } catch (error) {
        res.status(403).json({"message":"Invalid or expired token"})
    }
    
};
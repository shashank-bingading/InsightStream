import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type {Request, Response, NextFunction} from "express";

//initializing upstash redis clients
const redis = Redis.fromEnv();

//Defining Standard API Rate Limiter
const apiRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, "15 m"),
    analytics:true,
    prefix: "@upstash/ratelimit/api",
});

//Defining Auth API Rate Limiter

const authRatelimit = new Ratelimit({
    redis,
    limiter:Ratelimit.slidingWindow(10,"15 m"),
    analytics:true,
    prefix: "@upstash/ratelimit/auth",
});

//Helper Function 
const createExpressRateLimiter = (Limiter:Ratelimit)=>{
    return async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
        try {
            const ip = (req.headers["x-forwarded-for"] as string) || req.ip || "127.0.0.1";
            const {success,limit,remaining,reset} = await Limiter.limit(ip);

            const retryAfterSeconds = Math.max(1,Math.ceil((reset - Date.now()) / 1000));
            //attaching standard rate-limiting headers to the HTTP response
            res.setHeader("X-RateLimit-Limit",limit);
            res.setHeader("X-RateLimit-Remaining",remaining);
            res.setHeader("X-RateLimit-Reset",reset);

            //checking if the ip exceeded the allowed request threshold
            if(!success){
                res.status(429).json({
                    status:"error",
                    statusCode:429,
                    message: `Too many requests.Please try again in ${retryAfterSeconds}`
                });
                return;
            }
            next();
        } catch (error) {
        // Redis connection fails
        console.error("Upstash Rate Limiter error:", error);
        next();
        };
        

    };
};

//Exporting required middlewares

export const apiLimiter = createExpressRateLimiter(apiRatelimit);
export const authLimiter = createExpressRateLimiter(authRatelimit);
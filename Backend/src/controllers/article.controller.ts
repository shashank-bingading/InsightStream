import type {Response,NextFunction} from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js"
import { scrapeArticle } from "../services/scrapper.service.js";
import {generateSummary} from "../services/ai.service.js"
import { pool } from "../config/db.js";

//validation checks first
export const createArticle = async (
    req:AuthenticatedRequest,
    res: Response,
    next:NextFunction
):Promise<void>=>{

    try {
        const {url} = req.body;
        const user_id = req.user?.id;

        if (!user_id) {
            const error: any = new Error("Unauthorized. Please LogIn or SignUp");
            error.statusCode = 401;
            throw error;
        }
        if(!url || typeof url !=="string"){
            const error: any = new Error("Please provide a valid article URL.");
            error.statusCode = 400;
            throw error;
        }
        //For scraping raw text and title from the web page
        const scrapedData = await scrapeArticle(url);
        //passsing this scraped text to generate summary
        const SummaryOutput = await generateSummary(scrapedData.content);
        
        const insertQuery = `INSERT INTO articles (user_id, url, title, summary, key_takeaways, read_time_minutes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
      `;

      const values = [
        user_id,
        url,
        scrapedData.title,
        SummaryOutput.summary,
        JSON.stringify(SummaryOutput.keyTakeaways),
        SummaryOutput.readTimeMinutes,
      ]

      const result = await pool.query(insertQuery,values);
      const newArticle = result.rows[0];
      
      res.status(201).json({
        status:"success",
        data:{
            article:newArticle,
        },
      });

    } catch (error) {
        next(error);
        //passing errors cleanely to express global error handler
    }
};

export const getUserArticles = async(
    req:AuthenticatedRequest,
    res:Response,
    next:NextFunction
):Promise<void>=>{
    try {
        const user_id = req.user?.id;
        if (!user_id) {
            const error: any = new Error("Unauthorized. Please LogIn or SignUp");
            error.statusCode = 401;
            throw error;
        }

        const findQuery = `
        SELECT id, url, title, summary, key_takeaways, read_time_minutes, created_at
      FROM articles
      WHERE user_id = $1
      ORDER BY created_at DESC;`;

      const result = await pool.query(findQuery,[user_id]);

      res.status(200).json({
        status:"success",
        results: result.rowCount,
        data:{
            articles:result.rows,
        },
      });
    } catch (error) {
        next(error);
    }
};
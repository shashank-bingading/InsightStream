import type {Response,NextFunction} from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js"
import { scrapeArticle } from "../services/scrapper.service.js";
import {generateSummary} from "../services/ai.service.js"
import { createArticleInDB,getArticlesByUserId } from "../models/article.model.js";

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

      const newArticle = await createArticleInDB(
        user_id,
        {
        title:scrapedData.title,
        content:scrapedData.content,
        summary:SummaryOutput.summary,
        keyTakeaways:JSON.stringify(SummaryOutput.keyTakeaways),
        readTimeMinutes:SummaryOutput.readTimeMinutes,
        sourceUrl:url,
      });
      
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


      const result = await getArticlesByUserId(user_id);

      res.status(200).json({
        status:"success",
        results: result.length,
        data:{
            articles:result,
        },
      });
    } catch (error) {
        next(error);
    }
};
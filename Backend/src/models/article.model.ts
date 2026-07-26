import { pool } from "../config/db.js"

interface Article{
    id:string,
    userId:string,//foreign key
    title:string,
    content:string,
    summary?:string|null,
    sourceUrl?:string|null,
    createdAt:Date,
    updatedAt: Date
}

interface CreateArticleDTO{
    title:string,
    content:string,
    summary:string,
    sourceUrl:string
}

export const createArticleTable = async()=>{
    try {
        const result = await pool.query(`
            CREATE TABLE IF NOT EXISTS articles(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE),
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            summary TEXT,
            source_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP`);

            console.log("Article table created/verified");
    } catch (error) {
        console.error(`Error in creating/verfying article table: ${error}`);
        throw error
        
    }
}
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

//this represents what client sends us to our API when saving a new article
interface CreateArticleDTO{
    title:string,
    content:string,
    summary?:string,
    sourceUrl?:string
}

export const createArticleTable = async()=>{
    try {
        const result = await pool.query(`
            CREATE TABLE IF NOT EXISTS articles(
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            summary TEXT,
            source_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)`);

            console.log("Article table created/verified");
    } catch (error) {
        console.error(`Error in creating/verfying article table: ${error}`);
        throw error
        
    }
}

export const createArticle = async(
    userId:string,
    data:CreateArticleDTO
):Promise <Article> =>{
    try {
        const {title,content,summary=null,sourceUrl=null} = data;
        const result = await pool.query(
            `INSERT INTO articles (user_id, title, content, summary, source_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING 
         id, 
         user_id AS "userId", 
         title, 
         content, 
         summary, 
         source_url AS "sourceUrl", 
         created_at AS "createdAt", 
         updated_at AS "updatedAt"`,
      [userId, title, content, summary, sourceUrl]
        );
        return result.rows[0];
    } catch (error) {
        console.error("Error in creating Article:",error);
        throw error;
    }
}

export const getArticlesByUserId = async(
    userId:string
):Promise<Article[]>=>{
    try {
        const result = await pool.query(
      `SELECT 
         id, 
         user_id AS "userId", 
         title, 
         content, 
         summary, 
         source_url AS "sourceUrl", 
         created_at AS "createdAt", 
         updated_at AS "updatedAt"
       FROM articles 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
    } catch (error) {
        console.error("Error fetching user articles:", error);
    throw error;
    }
}

// 4. Fetch Single Article by ID
export const getArticleById = async (
  id: string
): Promise<Article | null> => {
  try {
    const result = await pool.query(
      `SELECT 
         id, 
         user_id AS "userId", 
         title, 
         content, 
         summary, 
         source_url AS "sourceUrl", 
         created_at AS "createdAt", 
         updated_at AS "updatedAt"
       FROM articles 
       WHERE id = $1`,
      [id]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error("Error fetching article by ID:", error);
    throw error;
  }
};

//Delete Article (With User Ownership Check)
export const deleteArticle = async (
id:string,
userId:string
):Promise<boolean>=>{
    try {
        const result = await pool.query(
      `DELETE FROM articles WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    //to check if there is a change in row count
    return (result.rowCount ?? 0)>0;

    } catch (error) {
        console.error("Error deleting article:", error);
        throw error;
    }
}
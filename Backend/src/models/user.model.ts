import { pool } from "../config/db.js";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

//data exprected from a request body
export interface CreateUserDTO {
  email: string;
  password: string;
}

export const createUserTable = async () => {
  try {
    const query = await pool.query(` 
                CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )`);
    console.log("Users table verified/created");
  } catch (error) {
    console.error("Error creating users table:", error);
    throw error;
  }
};

//Find user by Email
export const findUserByEmail = async (email: string):Promise<User | null> => {
  try {
    const result = await pool.query(
      `SELECT 
        id, 
        email, 
        password_hash AS "passwordHash", 
        created_at AS "createdAt", 
        updated_at AS "updatedAt" 
      FROM users 
      WHERE email = $1`,
      [email],
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error("Error finding user by email:", error);
    throw error;
  }
};

//omitting password before return user object
//Creating User(registration)
export async function createUser (email:string,passwordHash:string): Promise<Omit<User, "passwordHash">>{
  try {
    const result = await pool.query(`INSERT INTO users (email, password_hash) 
       VALUES ($1, $2) 
       RETURNING 
         id, 
         email, 
         created_at AS "createdAt", 
         updated_at AS "updatedAt"`,
      [email, passwordHash]);
      return result.rows[0];
  } catch (error) {
    console.error("Error creating user in DB:", error);
    throw error;
  }
}

export const findUserById = async(id:string):Promise<Omit<User,"passwordHash">|null> => {
  try {
    const result = await pool.query(
      `SELECT 
        id, 
        email, 
        created_at AS "createdAt", 
        updated_at AS "updatedAt" 
      FROM users 
      WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } catch (error) {
    console.error("Error finding user by ID:", error);
    throw error;
  }
}
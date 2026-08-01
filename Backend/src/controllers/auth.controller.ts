import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { pool } from "../config/db.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import type { Response, NextFunction } from "express";
import type { Jwtpayload } from "../middleware/auth.middleware.js";


//have to clear redundant code in this file and the other controller file
export const RegisterUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;
    //can I use email = req.body.email here?
    if (!email || !password) {
      const error: any = new Error("Email or password missing");
      error.statusCode = 400;
      throw error;
    }
    const result = await pool.query(
      `
            SELECT * FROM users WHERE email = $1`,
      [email],
    );
    if (result.rows.length > 0) {
      console.log("User already exists");
      res.status(409).json({ message: "Email already in use" });
      return;
    }
    const hashedpassword = await bcrypt.hash(password, 10);

    const insertUserQuery = `INSERT INTO users (email, passwordHash)
        VALUES ($1, $2)
        RETURNING id, email, created_at;`;

    //registering user
    const result2 = await pool.query(insertUserQuery, [email, hashedpassword]);
    const newUser = result2.rows[0];

    //creating jwt payload and signing the token
    const payload: Jwtpayload = {
      id: newUser.id,
      email: newUser.email,
    };

    const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          createdAt: newUser.created_at,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const error: any = new Error("Email or password missing");
      error.statusCode = 400;
      throw error;
    }
    const findUserQuery = `SELECT * FROM users WHERE email = $1`;
    const newResult = await pool.query(findUserQuery, [email]);
    if (newResult.rowCount == 0) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    const user = newResult.rows[0];
    //Comparing passwords
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({
        message: "Invalid Email or Password",
      });
      return;
    }
    //jwt sign & response object
    const payload: Jwtpayload = { id: user.id, email: user.email };
    const token = jsonwebtoken.sign(payload, process.env.JWT_SECRET as string, {
      expiresIn: "7d",
    });

    res.status(200).json({
      status: "success",
      token,
      data: {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};


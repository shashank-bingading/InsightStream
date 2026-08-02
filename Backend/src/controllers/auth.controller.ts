import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import type { Response, NextFunction } from "express";
import type { Jwtpayload } from "../middleware/auth.middleware.js";
import { createUser, findUserByEmail } from "../models/user.model.js";

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
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      console.log("User already exists");
      res.status(409).json({ message: "Email already in use" });
      return;
    }
    const hashedpassword = await bcrypt.hash(password, 10);
    //creating new user
    const newUser = await createUser(email, hashedpassword);

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
        user: 
          //password already emitted so no need..
          newUser,
        
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
    const user = await findUserByEmail(email);
    if (!user) {
      const error: any = new Error("Invalid email or password.");
      error.statusCode = 401;
      throw error;
    }

    //user without passwordHash
    const {passwordHash, ...userWithoutPass} = user;
    //Comparing passwords
    const isPasswordValid = await bcrypt.compare(password, passwordHash);

    if (!isPasswordValid) {
      const error: any = new Error("Invalid email or password.");
      error.statusCode = 401;
      throw error;
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
        user: userWithoutPass,
      },
    });
  } catch (error) {
    next(error);
  }
};

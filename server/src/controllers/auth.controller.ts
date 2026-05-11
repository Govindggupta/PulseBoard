import type { Request, Response } from "express";
import { signInSchema, signUpSchema } from "../schema/auth.schema.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../env.js";

const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 5);
};

export const handleSignUp = async (req: Request, res: Response) => {
  try {
    const parsedData = signUpSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({
        error: "Invalid request data",
        details: parsedData.error.issues,
      });
    }

    const { email, username, password } = parsedData.data;

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      return res
        .status(409)
        .json({ error: "User with this email already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const user = await db.insert(users).values({
      email, 
      username, 
      password: hashedPassword
    })

    console.log(user)

    return res.status(201).json({ message: "User created successfully", user: user});
  } catch (error) {
    return res.status(500).json({message: "Internal server error" , error: error instanceof Error ? error.message : "Unknown error"})
  }
};

export const handleSignIn = async (req: Request, res: Response) => {
  try {
    const parsedData = signInSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({
        error: "Invalid request data",
        details: parsedData.error.issues,
      });
    }

    const { email, password } = parsedData.data;

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    if (existingUser.length === 0 ) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = existingUser[0];

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (!user.password) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const matchPassword = await bcrypt.compare(password, user.password);

    if (!matchPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({id: user.id}, env.JWT_SECRET);

    return res.status(200).json({ message: "Sign in successful", token });
    


  } catch (error) {
    return res.status(500).json({message: "Signin Failded"}) 
  }
}


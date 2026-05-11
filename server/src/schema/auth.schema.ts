import {z} from 'zod';

export const signUpSchema = z.object({
    email: z.email(),
    username : z.string().min(2).max(100),
    password : z.string().min(6).max(100)
})

export const signInSchema = z.object({  
    email: z.email(),
    password : z.string().min(6).max(100)
})


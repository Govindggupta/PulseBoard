import express, { Router } from 'express';
import { handleSignIn, handleSignUp } from '../controllers/auth.controller.js';

export const authRouter: Router = express.Router()

authRouter.post('/signup', handleSignUp )
authRouter.post('/signin', handleSignIn)
authRouter.post('/logout')
// authRouter.get('/me')
import express, { Router } from 'express';
import { handleLogout, handleMe, handleSignIn, handleSignUp } from '../controllers/auth.controller.js';
import { middleware } from '../middleware/middleware.js';

export const authRouter: Router = express.Router()

authRouter.post('/signup', handleSignUp )
authRouter.post('/signin', handleSignIn)
authRouter.post('/logout', middleware, handleLogout)
authRouter.get('/me', middleware, handleMe)
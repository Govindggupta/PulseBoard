import express, { Router } from 'express';
// import {} from '../controllers/polls.controller.js';
import { middleware } from '../middleware/middleware.js';
import {
	handleCreatePoll,
	handleGetPollById,
	handleGetUserPolls,
	handleDeletePollById,
	handleUpdatePollById,
} from '../controllers/polls.controller.js';

export const pollsRouter: Router = express.Router();

pollsRouter.post('/', middleware, handleCreatePoll);
pollsRouter.get('/:pollId', middleware, handleGetPollById)
pollsRouter.get('/', middleware , handleGetUserPolls);
pollsRouter.delete('/:pollId', middleware, handleDeletePollById);
pollsRouter.put('/:pollId' , middleware , handleUpdatePollById)




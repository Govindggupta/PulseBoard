import express, { Router } from 'express';
import { middleware } from '../middleware/middleware.js';
import { optionalAuth } from '../middleware/optionalAuth.js';
import {
	handleCreatePoll,
	handleGetPollById,
	handleGetUserPolls,
	handleDeletePollById,
	handleUpdatePollById,
	handlePublishPoll,
	handleGetPublicPoll,
	handleSubmitResponse,
	handleGetPollAnalytics,
} from '../controllers/polls.controller.js';

export const pollsRouter: Router = express.Router();

pollsRouter.post('/', middleware, handleCreatePoll);
pollsRouter.get('/', middleware, handleGetUserPolls);
pollsRouter.get('/:pollId', middleware, handleGetPollById);
pollsRouter.put('/:pollId', middleware, handleUpdatePollById);
pollsRouter.delete('/:pollId', middleware, handleDeletePollById);
pollsRouter.patch('/:pollId/publish', middleware, handlePublishPoll);
pollsRouter.get('/:pollId/analytics', middleware, handleGetPollAnalytics);

pollsRouter.get('/:pollId/public', optionalAuth, handleGetPublicPoll);
pollsRouter.post('/:pollId/responses', optionalAuth, handleSubmitResponse);

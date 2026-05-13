import express from 'express'; 
import cors from 'cors';
import { createServer } from 'http';
import { env } from './env.js'
import { authRouter } from './routes/auth.route.js';
import { pollsRouter } from './routes/polls.route.js';
import { middleware } from './middleware/middleware.js';
import { initializeSocket } from './socket/socket.js';

const app = express(); 
const server = createServer(app);

// Initialize Socket.io
initializeSocket(server);

app.use(cors());
app.use(express.json());

app.get("/check", (req, res) => {
    res.json({message: "it's working here"})
});

app.use('/api/auth', authRouter);
app.use('/api/polls', pollsRouter)

server.listen(env.PORT , () => {
    console.log(`server is running at ${env.PORT}`)
})
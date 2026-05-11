import express from 'express'; 
import cors from 'cors';
import { env } from './env.js'
import { authRouter } from './routes/auth.route.js';
import { middleware } from './middleware/middleware.js';

const app = express(); 

app.use(cors());
app.use(express.json());

app.get("/check", (req, res) => {
    res.json({message: "it's working here"})
});

app.use('/api/auth', authRouter);

app.listen(env.PORT , () => {
    console.log(`server is running at ${env.PORT}`)
})
import express from 'express'; 
import cors from 'cors';
import { env } from './env.js'


const app = express(); 

app.use(cors());
app.use(express.json());

app.get("/check", (req, res) => {
    res.json({message: "it's working here"})
});

app.listen(env.PORT , () => {
    console.log(`server is running at ${env.PORT}`)
})
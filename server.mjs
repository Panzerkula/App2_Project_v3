import { requireAuth } from "./modules/auth_middleware.mjs"
import express from "express";

const PORT = 3000;
const app = new express();

app.use(express.static('public'))


app.get('/', (req, res) => {
    res.send('SERVER KJØRER!!!!!!!!!!')
})


app.listen(PORT, () => {
    console.log(`Port: ${PORT}`)
})

app.post("/games", requireAuth);
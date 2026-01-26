import express from "express";

const PORT = 8080;
const app = new express();

app.use(express.static('public'))


app.get('/', (req, res) => {
    res.send('Showing from server.mjs')
})


app.listen(PORT, () => {
    console.log(`Port: ${PORT}`)
})
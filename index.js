
const { json } = require('body-parser')
const express = require('express')
const { getById } = require('./services/songs');

const app = express()
const port = 3000

app.use(json({ type: 'application/*+json' }))

app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.get('/api/v1/songs/:id', (req, res) => {
    const result = getById(req.params.id);
    res.send(result);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
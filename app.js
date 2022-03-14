
const { json } = require('body-parser')
const express = require('express')
const { getById, nonExistingFiles } = require('./services/songs');

const app = express()
const port = process.env.port || 3000

app.use(json({ type: 'application/json' }))

app.use(express.static('public'));

app.get('/api/songs/:id', (req, res) => {
    const result = getById(req.params.id);
    res.send(result);
})

app.post('/api/songs/check', (req, res) => {
    console.log(req.body);
    const { ids } = req.body;
    const result = nonExistingFiles(ids);
    if (result.length) {
        res.status(400).send(result);
    }
    res.send();
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})
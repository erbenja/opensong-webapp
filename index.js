
const { json } = require('body-parser')
const express = require('express')
const app = express()
const port = 3000

app.use(json);

app.get('/api/v1/songs/:id', (req, res) => {
    console.log(req.body);
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

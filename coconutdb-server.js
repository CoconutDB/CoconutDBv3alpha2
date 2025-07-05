const express = require('express');
const CoconutDB = require('./lib/coconutdb');

const app = express();
const db = new CoconutDB('./data');

app.use(express.json());

app.post('/:collection/find', async (req, res) => {
    const result = await db.collection(req.params.collection).find(req.body.query || {});
    res.json({ result });
});

app.post('/:collection/insertOne', async (req, res) => {
    const doc = await db.collection(req.params.collection).insertOne(req.body.doc);
    res.json({ doc });
});

app.post('/:collection/updateOne', async (req, res) => {
    const result = await db.collection(req.params.collection).updateOne(req.body.query, req.body.update);
    res.json({ result });
});

app.post('/:collection/deleteOne', async (req, res) => {
    const result = await db.collection(req.params.collection).deleteOne(req.body.query);
    res.json({ result });
});

app.get('/', (req, res) => {
    res.send('🟢 CoconutDB Server is running!');
});

const PORT = 27018;
app.listen(PORT, () => {
    console.log(`✅ CoconutDB Server running at http://localhost:${PORT}`);
});

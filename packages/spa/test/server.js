const express = require('express');
const { join } = require('path');
const app = express();

const port = process.env.PORT || 8000;

app.use(express.static(join(__dirname, 'public')));
app.use(express.static(join(__dirname, '../dist')));

app.get('/api/spa/start', (_, response) => {
  response.status(200).json({});
});

app.listen(port, () => {
  console.log(`spa development server running on port ${port}`);
});

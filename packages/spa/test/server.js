const express = require('express');
const { join } = require('path');
const app = express();

const port = process.env.PORT || 8000;

app.use(express.static(join(__dirname, 'public')));
app.use(express.static(join(__dirname, '../dist')));

app.listen(port, () => {
  console.log(`web-client development server running on port ${port}`);
});

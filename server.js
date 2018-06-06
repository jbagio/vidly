const express = require('express');

// Routes
const genres = require('./routes/genres');

const app = express();

app.use(express.json());

app.use('/api/genres', genres);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}...`));

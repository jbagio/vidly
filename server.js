// Packages
const express = require('express');

// App config
const app = express();
const port = process.env.PORT || 3000;

// Start server
app.listen(port, () => console.log(`Server listening on port ${port}...`));

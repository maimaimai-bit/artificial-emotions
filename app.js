const express = require("express");
const path = require("path");
const app = express();

// Serve static files from root directory instead of /public
app.use(express.static(__dirname));

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

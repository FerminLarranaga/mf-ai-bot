require("dotenv").config();
const express = require("express");
const { PORT } = require("./src/config");
const router = require("./src/routes");

const app = express();
app.use(express.json());
app.use(router);

// ── Start ────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`🚀 Server listening on port ${PORT}`);
});
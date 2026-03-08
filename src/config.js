const fs = require("fs");
const path = require("path");

const {
    OPENAI_API_KEY,
    OPENAI_MODEL = "gpt-5.1",
    MANYCHAT_API_KEY,
    MANYCHAT_FLOW_NS,
    MANYCHAT_API_BASE = "https://api.manychat.com/fb",
    VECTOR_STORE_ID,
    PORT = 3000,
} = process.env;

const SYSTEM_INSTRUCTIONS = fs.readFileSync(
    path.join(__dirname, "..", "system_instructions.txt"),
    "utf8"
);

module.exports = {
    OPENAI_API_KEY,
    OPENAI_MODEL,
    MANYCHAT_API_KEY,
    MANYCHAT_FLOW_NS,
    MANYCHAT_API_BASE,
    VECTOR_STORE_ID,
    PORT,
    SYSTEM_INSTRUCTIONS,
};

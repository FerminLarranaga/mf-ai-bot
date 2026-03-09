const fs = require("fs");
const path = require("path");

const {
    OPENAI_API_KEY,
    OPENAI_MODEL = "gpt-5.1",
    MANYCHAT_API_KEY,
    MANYCHAT_FLOW_NS,
    MANYCHAT_API_BASE = "https://api.manychat.com/fb",
    VECTOR_STORE_ID,
    MAX_PDF_PAGES = 5,
    PORT = 3000,
    AWS_REGION,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_BUCKET_NAME,
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
    MAX_PDF_PAGES,
    PORT,
    SYSTEM_INSTRUCTIONS,
    AWS_REGION,
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_BUCKET_NAME,
};

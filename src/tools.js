const { VECTOR_STORE_ID } = require("./config");

// ── Tool Definitions (Responses API format) ───────────────────

const TOOLS = [
    {
        type: "function",
        name: "generate_image_code",
        description:
            "Sends the customer and image with the costs of the translation for his specific purpose. " +
            "Call this ONLY after you have gathered and confirmed 3 things: " +
            "whether the translation is public or personal, if it is public you should also confirm the type of document " +
            "and finally which languages are involved.",
        parameters: {
            type: "object",
            properties: {
                isPublic: {
                    type: "boolean",
                    description:
                        "true if the translation is for public/official/" +
                        "sworn use, false if for personal use.",
                },
                typeOfDocument: {
                    type: "number",
                    description:
                        "Document type — only relevant when isPublic is " +
                        "true. 1 = Personal documents (birth/marriage " +
                        "certificates, passports). 2 = Education (syllabi, " +
                        "transcripts, diplomas). 3 = Notarial, judicial, " +
                        "contracts, balance sheets, patents. Pass 0 when " +
                        "isPublic is false.",
                },
                direction: {
                    type: "number",
                    description:
                        "Translation direction. " +
                        "1 = from a foreign language to Spanish. " +
                        "2 = from Spanish to a foreign language or from a foreign language to another foreign language.",
                },
                language: {
                    type: "number",
                    description:
                        "Language category number. If 2 languages that are not spanish are involved, use the highest category number between the two languages. " +
                        "1 = French/English/Italian/Portuguese. " +
                        "2 = German/Dutch/Flemish. " +
                        "3 = Belarusian/Bulgarian/Catalan/Czech/Croatian/" +
                        "Danish/Slovak/Slovenian/Latvian/Lithuanian/" +
                        "Norwegian/Polish/Romanian/Russian/Serbian/" +
                        "Swedish/Ukrainian. " +
                        "4 = Arabic/Armenian/Finnish/Greek/Hebrew/" +
                        "Hungarian/Latin/Persian/Farsi/Turkish. " +
                        "5 = Chinese/Korean/Japanese.",
                },
            },
            required: ["isPublic", "direction", "language"],
        },
    },
    // ── File Search (OpenAI built-in) ─────────────────────────
    ...(VECTOR_STORE_ID
        ? [
            {
                type: "file_search",
                vector_store_ids: [VECTOR_STORE_ID],
            },
        ]
        : []),
];

module.exports = TOOLS;

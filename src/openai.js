const axios = require("axios");
const { OPENAI_API_KEY, OPENAI_MODEL, SYSTEM_INSTRUCTIONS } = require("./config");
const TOOLS = require("./tools");

// ── OpenAI Responses API ──────────────────────────────────────

async function callResponsesAPI(input, previousResponseId) {
    const body = {
        model: OPENAI_MODEL,
        instructions: SYSTEM_INSTRUCTIONS,
        input,
        tools: TOOLS,
        store: true, // persist so previous_response_id works later
    };

    if (previousResponseId) {
        body.previous_response_id = previousResponseId;
    }

    const { data } = await axios.post(
        "https://api.openai.com/v1/responses",
        body,
        {
            headers: {
                Authorization: `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
        }
    );

    return data;
}

module.exports = { callResponsesAPI };

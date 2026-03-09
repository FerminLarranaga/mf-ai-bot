const { callResponsesAPI } = require("./openai");

const MAX_TOOL_ROUNDS = 5; // safety limit

// ── Tool Implementations ──────────────────────────────────────

function generateImageCode({ isPublic, typeOfDocument, direction, language }) {
    if (isPublic) {
        return `${typeOfDocument}_${direction}_${language}`;
    }
    return `${direction}_${language}`;
}

/**
 * Dispatches a custom function call by name.
 * Built-in OpenAI tools (e.g. file_search) are resolved server-side and
 * appear as type "file_search_call", never reaching this function.
 *
 * @param {string} name
 * @param {object} args
 * @returns {string}
 */
function executeFunction(name, args) {
    switch (name) {
        case "generate_image_code":
            return generateImageCode(args);
        default:
            throw new Error(`Unknown function: ${name}`);
    }
}

// ── Tool-Call Loop ────────────────────────────────────────────

/**
 * Runs the tool-call agentic loop: repeatedly executes any custom function
 * calls returned by the API until there are none left or the round limit
 * is reached.
 *
 * @param {object} initialResponse - First API response (already obtained)
 * @returns {Promise<{ response: object, imageCode: string | null }>}
 */
async function runToolLoop(initialResponse) {
    let response = initialResponse;
    let imageCode = null;
    let iterations = 0;

    while (iterations++ < MAX_TOOL_ROUNDS) {
        const functionCalls = response.output.filter(
            (item) => item.type === "function_call"
        );

        if (functionCalls.length === 0) break;

        const functionOutputs = functionCalls.map((fc) => {
            const args = JSON.parse(fc.arguments);
            console.log(`  ⚙️  ${fc.name}(${JSON.stringify(args)})`);

            const result = executeFunction(fc.name, args);
            console.log(`  ➜  result: ${result}`);

            if (fc.name === "generate_image_code") {
                imageCode = result;
            }

            return {
                type: "function_call_output",
                call_id: fc.call_id,
                output: String(result),
            };
        });

        response = await callResponsesAPI(functionOutputs, response.id);
    }

    return { response, imageCode };
}

module.exports = { runToolLoop };

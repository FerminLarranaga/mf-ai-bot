const { callResponsesAPI } = require("./openai");
const { setCustomField, triggerSendFlow } = require("./manychat");

// ── Local Tool Execution ──────────────────────────────────────

function generateImageCode({ isPublic, typeOfDocument, direction, language }) {
    if (isPublic) {
        return `${typeOfDocument}_${direction}_${language}`;
    }
    return `${direction}_${language}`;
}

function executeFunction(name, args) {
    switch (name) {
        case "generate_image_code":
            return generateImageCode(args);
        default:
            // Built-in OpenAI tools (e.g. file_search) are handled
            // server-side by the API and never reach this branch.
            throw new Error(`Unknown function: ${name}`);
    }
}

// ── Core Processing Pipeline ──────────────────────────────────

async function processMessage(contactId, userMessage, previousResponseId) {
    try {
        // 1. Send user message to OpenAI Responses API
        let response = await callResponsesAPI(userMessage, previousResponseId);

        let imageCode = null;
        let iterations = 0;
        const MAX_TOOL_ROUNDS = 5; // safety limit

        // 2. Handle tool calls in a loop
        while (iterations++ < MAX_TOOL_ROUNDS) {
            const functionCalls = response.output.filter(
                (item) => item.type === "function_call"
            );

            if (functionCalls.length === 0) break;

            // Execute every *custom* function call in this round.
            // Built-in tools like file_search are resolved by OpenAI
            // and appear in the output as type "file_search_call", not
            // "function_call", so they never enter this map.
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

            // Send results back; chain via previous_response_id
            response = await callResponsesAPI(functionOutputs, response.id);
        }

        // 3. Extract assistant's final text
        const assistantText = response.output
            .filter(
                (item) => item.type === "message" && item.role === "assistant"
            )
            .flatMap((msg) => msg.content)
            .filter((block) => block.type === "output_text")
            .map((block) => block.text)
            .join("\n");

        const subscriberId = Number(contactId);

        // 4. Push AI response to ManyChat
        await setCustomField(
            subscriberId,
            "AI_Response",
            assistantText || "[empty response]"
        );

        // 5. Set previous_response_id for the next iteration
        await setCustomField(subscriberId, "OpenAI_Thread_ID", response.id);

        // 6. If a code was generated, set the image_code field
        if (imageCode) {
            await setCustomField(subscriberId, "AI_Image_URL", imageCode);
            console.log(`  🏷️  AI_Image_URL set: ${imageCode}`);
        }

        // 7. Trigger the ManyChat flow that sends AI_Response
        await triggerSendFlow(subscriberId);

        console.log(`✅ contact ${contactId} | resp ${response.id}`);
    } catch (error) {
        const errData = error.response?.data || error.message;
        console.error("❌ Error:", errData);

        // If the stored response ID is stale/invalid, retry fresh
        if (previousResponseId && error.response?.status === 400) {
            console.log("🔄 Retrying without previous_response_id …");
            return processMessage(contactId, userMessage, null);
        }

        // Best-effort: notify the customer something went wrong
        try {
            const subscriberId = Number(contactId);
            await setCustomField(
                subscriberId,
                "AI_Response",
                "Lo siento, ocurrió un error procesando tu mensaje. " +
                "Por favor intenta de nuevo en unos momentos."
            );
            await triggerSendFlow(subscriberId);
        } catch (inner) {
            console.error("❌ Could not send error message:", inner.message);
        }
    }
}

module.exports = { processMessage };

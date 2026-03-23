const { callResponsesAPI } = require("./openai");
const { setCustomField, triggerSendFlow } = require("./manychat");
const { buildApiInput } = require("./mediaParser");
const { runToolLoop } = require("./toolExecutor");

// ── Core Processing Pipeline ──────────────────────────────────

async function processMessage(contactId, userMessage, previousResponseId) {
    try {
        // 1. Resolve any media URLs (PDF / image) into API-compatible input
        const apiInput = await buildApiInput(userMessage);

        // When input is a media array, don't pass previous_response_id — OpenAI
        // rejects requests that combine a conversation-threaded ID with a raw
        // message array input (it causes a 400 "invalid_request_error").
        const isMediaInput = Array.isArray(apiInput);
        const responseId = isMediaInput ? null : previousResponseId;
        if (isMediaInput && previousResponseId) {
            console.log(`  ⚠️  Media input detected — ignoring previous_response_id to avoid 400`);
        }

        // 2. Send to OpenAI Responses API
        const initialResponse = await callResponsesAPI(apiInput, responseId);

        // 3. Execute tool calls until the model returns a final answer
        const { response, imageCode } = await runToolLoop(initialResponse);

        // 4. Extract assistant's final text
        // The Responses API can return content blocks typed either "text" or
        // "output_text" depending on the model/version — accept both.
        const assistantText = response.output
            .filter((item) => item.type === "message" && item.role === "assistant")
            .flatMap((msg) => msg.content)
            .filter((block) => block.type === "output_text" || block.type === "text")
            .map((block) => block.text)
            .join("\n");

        console.log(`  📝  assistantText length: ${assistantText.length} chars`);

        const subscriberId = Number(contactId);

        // 5. Push AI response to ManyChat
        await setCustomField(subscriberId, "AI_Response", assistantText || "[empty response]");

        // 6. Persist response ID for conversation threading
        await setCustomField(subscriberId, "OpenAI_Thread_ID", response.id);

        // 7. If a code was generated, store it
        if (imageCode) {
            await setCustomField(subscriberId, "AI_Image_URL", imageCode);
            console.log(`  🏷️  AI_Image_URL set: ${imageCode}`);
        }

        // 8. Trigger the ManyChat flow that delivers AI_Response to the user
        await triggerSendFlow(subscriberId);

        console.log(`✅ contact ${contactId} | resp ${response.id}`);
    } catch (error) {
        // Log the full error payload so you can see exactly what OpenAI returned
        const errData = error.response?.data || error.message;
        console.error("❌ Error status:", error.response?.status);
        console.error("❌ Error detail:", JSON.stringify(errData, null, 2));

        // If the stored response ID is stale/invalid, retry fresh
        // Do not uncomment or remove this
        // if (previousResponseId && error.response?.status === 400) {
        //     console.log("🔄 Retrying without previous_response_id …");
        //     return processMessage(contactId, userMessage, null);
        // }

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

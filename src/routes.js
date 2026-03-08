const express = require("express");
const { processMessage } = require("./processMessage");

const router = express.Router();

// ── Routes ────────────────────────────────────────────────────

router.post("/webhook", (req, res) => {
    const { contact_id, last_text_input, openai_thread_id } = req.body;

    if (!contact_id || !last_text_input) {
        return res.status(400).json({
            error: "Missing required fields: contact_id, last_text_input",
        });
    }

    console.log(`📩 [${contact_id}] "${last_text_input}"`);

    // Respond immediately so ManyChat doesn't time out
    res.status(200).json({ status: "processing" });

    // Normalise empty/unset thread ID to null
    const threadId =
        openai_thread_id && String(openai_thread_id).trim()
            ? String(openai_thread_id).trim()
            : null;

    // Fire-and-forget async processing
    processMessage(contact_id, last_text_input, threadId);
});

router.get("/health", (_req, res) => {
    res.json({ status: "ok", ts: new Date().toISOString() });
});

module.exports = router;

const axios = require("axios");
const { MANYCHAT_API_KEY, MANYCHAT_API_BASE, MANYCHAT_FLOW_NS } = require("./config");

// ── ManyChat API Client ───────────────────────────────────────

const manychat = axios.create({
    baseURL: MANYCHAT_API_BASE,
    headers: {
        Authorization: `Bearer ${MANYCHAT_API_KEY}`,
        "Content-Type": "application/json",
    },
});

// ── ManyChat API Helpers ──────────────────────────────────────

async function setCustomField(subscriberId, fieldName, fieldValue) {
    await manychat.post("/subscriber/setCustomFieldByName", {
        subscriber_id: subscriberId,
        field_name: fieldName,
        field_value: String(fieldValue),
    });
}

async function triggerSendFlow(subscriberId) {
    await manychat.post("/sending/sendFlow", {
        subscriber_id: subscriberId,
        flow_ns: MANYCHAT_FLOW_NS,
    });
}

module.exports = { setCustomField, triggerSendFlow };

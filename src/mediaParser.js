const { validatePdfPageCount } = require("./pdfHandler");
const { MAX_PDF_PAGES } = require("./config");

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

/**
 * Inspects `userMessage` for a URL pointing to a PDF or image and returns
 * the appropriate input value for the OpenAI Responses API.
 *
 * - PDF   → array with an input_file pointing to the ManyChat URL
 * - Image → single element array with an input_image message
 * - None  → the original string unchanged
 *
 * @param {string} userMessage
 * @returns {Promise<string | Array>} apiInput
 */
async function buildApiInput(userMessage) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = userMessage.match(urlRegex);

    if (!urls || urls.length === 0) return userMessage;

    const firstUrl = urls[0];
    const urlWithoutParams = firstUrl.toLowerCase().split("?")[0];

    if (urlWithoutParams.endsWith(".pdf")) {
        return await _buildPdfInput(firstUrl, userMessage);
    }

    if (IMAGE_EXTENSIONS.some((ext) => urlWithoutParams.endsWith(ext))) {
        return _buildImageInput(firstUrl);
    }

    return userMessage;
}

async function _buildPdfInput(url, originalMessage) {
    console.log(`  📄  Found PDF URL: ${url}`);
    try {
        await validatePdfPageCount(url, MAX_PDF_PAGES);

        return [
            {
                role: "user",
                content: [{ type: "input_file", file_url: url }],
            },
        ];
    } catch (pdfErr) {
        console.error("PDF Processing Error:", pdfErr.message);
        return `${originalMessage}\n\n[System Nota: Error procesando el PDF: ${pdfErr.message}]`;
    }
}

function _buildImageInput(url) {
    console.log(`  🖼️  Found Image URL: ${url}`);
    return [
        {
            role: "user",
            content: [{ type: "input_image", image_url: url }],
        },
    ];
}

module.exports = { buildApiInput };

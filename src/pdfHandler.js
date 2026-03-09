const axios = require("axios");
const { PDFDocument } = require("pdf-lib");

/**
 * Downloads the PDF from the given URL and validates that its page count
 * does not exceed `maxPages`.
 *
 * @param {string} url       Public URL of the PDF (e.g. a ManyChat file URL)
 * @param {number} maxPages  Maximum number of pages allowed
 * @returns {Promise<void>}  Resolves if OK, throws otherwise
 */
async function validatePdfPageCount(url, maxPages) {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const pdfDoc = await PDFDocument.load(response.data, {
        ignoreEncryption: true,
    });
    const pageCount = pdfDoc.getPageCount();

    if (pageCount > maxPages) {
        throw new Error(
            `El PDF tiene demasiadas páginas (${pageCount}). El máximo permitido es ${maxPages}.`
        );
    }

    console.log(`  📄  PDF validated: ${pageCount} page(s) (max ${maxPages}).`);
}

module.exports = { validatePdfPageCount };

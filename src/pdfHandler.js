const axios = require("axios");
const pdfParse = require("pdf-parse");
const pdfImgConvert = require("pdf-img-convert");

async function processPdfFromUrl(url, maxPages) {
    // 1. Download buffer
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);

    // 2. Parse and count pages
    const data = await pdfParse(buffer);
    if (data.numpages > maxPages) {
        throw new Error(`El PDF tiene demasiadas páginas (${data.numpages}). El máximo permitido es ${maxPages}.`);
    }

    // 3. Convert pages to base64 images
    const pdfImages = await pdfImgConvert.convert(buffer, { base64: true });

    return pdfImages.map(base64 => `data:image/png;base64,${base64}`);
}

module.exports = { processPdfFromUrl };

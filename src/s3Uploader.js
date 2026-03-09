const crypto = require("crypto");
const { PutObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("./s3Client");
const { AWS_BUCKET_NAME, AWS_REGION } = require("./config");

/**
 * Uploads a PNG buffer to S3 and returns its public URL.
 *
 * @param {Buffer} buffer  PNG image data
 * @returns {Promise<string>} Public URL of the uploaded image
 */
async function uploadImageToS3(buffer) {
    const key = `pdf-images/${crypto.randomUUID()}.png`;

    await s3.send(
        new PutObjectCommand({
            Bucket: AWS_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: "image/png",
        })
    );

    return `https://${AWS_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
}

module.exports = { uploadImageToS3 };

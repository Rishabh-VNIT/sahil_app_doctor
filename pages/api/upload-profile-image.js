import { google } from 'googleapis';
import formidable from 'formidable';
import fs from 'fs'; // Use fs instead of fs/promises for stream support

export const config = {
    api: {
        bodyParser: false
    }
};

export default async function handler(req, res) {
    console.log("📥 Request received");

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const form = formidable({ multiples: false });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error("❌ Form parse error:", err);
            return res.status(500).json({ error: 'Upload failed' });
        }

        let { access_token } = fields;
        access_token = access_token[0];
        console.log(access_token);
        const file = files.file?.[0];

        if (!access_token) {
            return res.status(400).json({ error: 'Missing access token' });
        }

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            console.log("🔑 Authenticating with Google Drive...");

            // Initialize OAuth2 client with the provided access token
            const oauth2Client = new google.auth.OAuth2();
            oauth2Client.setCredentials({ access_token });

            const drive = google.drive({
                version: 'v3',
                auth: oauth2Client
            });

            console.log("📤 Uploading file to Google Drive...");

            const response = await drive.files.create({
                requestBody: {
                    name: `profile_${Date.now()}_${file.originalFilename}`,
                    mimeType: file.mimetype,
                    parents: ['root']
                },
                media: {
                    mimeType: file.mimetype,
                    body: fs.createReadStream(file.filepath) // Using fs to create a read stream
                }
            });

            if (!response.data.id) {
                throw new Error("File upload failed, no file ID returned.");
            }

            console.log("✅ File uploaded successfully, setting permissions...");

            // Make the file publicly accessible
            await drive.permissions.create({
                fileId: response.data.id,
                requestBody: { role: 'reader', type: 'anyone' }
            });

            // Retrieve the file link
            const fileData = await drive.files.get({
                fileId: response.data.id,
                fields: 'webViewLink'
            });

            console.log("🔗 File link generated:", fileData.data.webViewLink);

            // Clean up temporary file
            fs.unlinkSync(file.filepath);

            res.status(200).json({ fileLink: fileData.data.webViewLink });
        } catch (error) {
            console.error("🚨 Google Drive upload error:", error);
            res.status(500).json({ error: error.message || 'Drive upload failed' });
        }
    });
}

import { google } from 'googleapis';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false
    }
};

export default async function handler(req, res) {
    const form = new formidable.IncomingForm();

    form.parse(req, async (err, fields, files) => {
        if (err) return res.status(500).json({ error: 'Upload failed' });

        const { access_token } = fields;
        const file = files.file;

        try {
            const drive = google.drive({
                version: 'v3',
                auth: new google.auth.OAuth2()
            });

            drive.setCredentials({ access_token });

            const response = await drive.files.create({
                requestBody: {
                    name: file.originalFilename,
                    parents: ['root'] // Upload to root, change if needed
                },
                media: {
                    mimeType: 'application/pdf',
                    body: fs.createReadStream(file.filepath)
                }
            });

            res.status(200).json({
                fileLink: `https://drive.google.com/file/d/${response.data.id}/view`
            });
        } catch (error) {
            res.status(500).json({ error: 'Drive upload failed' });
        }
    });
}

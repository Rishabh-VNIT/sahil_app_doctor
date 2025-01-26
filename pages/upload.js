'use client';

import React, { useState } from 'react';
// import { GoogleIcon } from 'lucide-react';

export default function GoogleDriveUpload() {
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');

    const handleFileUpload = async () => {
        if (!file) {
            setUploadStatus('No file selected');
            return;
        }

        // OAuth popup logic remains the same as previous example
        const popup = window.open(
            `https://accounts.google.com/o/oauth2/v2/auth?` +
            `client_id=${process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}` +
            `&redirect_uri=${encodeURIComponent(window.location.origin)}` +
            `&response_type=token` +
            `&scope=https://www.googleapis.com/auth/drive.file` +
            `&include_granted_scopes=true` +
            `&state=upload_pdf`
        );

        // Rest of the component code remains the same
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
            <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="mb-4 w-full"
            />
            <button
                onClick={handleFileUpload}
                disabled={!file}
                className="w-full bg-blue-500 text-white py-2 rounded flex items-center justify-center"
            >
                {/*<GoogleIcon className="mr-2" /> Upload to Google Drive*/}
                Upload to Google Drive
                {process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI}
            </button>
            {uploadStatus && (
                <p className="mt-4 text-center text-sm">
                    {uploadStatus}
                </p>
            )}
        </div>
    );
}



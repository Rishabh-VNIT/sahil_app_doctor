import { useState } from "react";

export default function FileUpload() {
    const [file, setFile] = useState(null);
    const [fileId, setFileId] = useState(null);
    const [fileName, setFileName] = useState(null);  // Store the original filename

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file first!");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            // const response = await fetch("http://localhost:5000/upload", {
            const response = await fetch("https://gdfileupload.onrender.com/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            if (data.success) {
                setFileId(data.fileId);
                setFileName(data.fileName);  // Set the original filename
                alert("File uploaded successfully!");
            } else {
                alert("Upload failed!");
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const handleDownload = async () => {
        if (!fileId) {
            alert("No file available to download.");
            return;
        }

        try {
            // const response = await fetch(`http://localhost:5000/download/${fileId}`);
            const response = await fetch(`https://gdfileupload.onrender.com/download/${fileId}`);
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = fileName;  // Use the original filename for download
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error("Error downloading file:", error);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
            <h1 className="text-xl font-bold mb-4">Upload a File</h1>
            <input type="file" onChange={handleFileChange} className="mb-4" />
            <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2 rounded">
                Upload
            </button>

            {fileId && (
                <div className="mt-4">
                    <button onClick={handleDownload} className="bg-green-500 text-white px-4 py-2 rounded">
                        Download File
                    </button>
                </div>
            )}
        </div>
    );
}

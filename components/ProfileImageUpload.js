import { useState } from "react";
import { Camera } from "lucide-react";

export default function ProfileImageUpload({ currentImage, onUpload, className = "" }) {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [fileId, setFileId] = useState(null);
    const [fileName, setFileName] = useState(null);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload to render backend
        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("https://gdfileupload.onrender.com/upload", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setFileId(data.fileId);
                setFileName(data.fileName);

                // Get the download URL immediately
                const downloadResponse = await fetch(`https://gdfileupload.onrender.com/download/${data.fileId}`);
                const blob = await downloadResponse.blob();
                const imageUrl = URL.createObjectURL(blob);

                onUpload(imageUrl);
                setError(null);
            } else {
                setError('Upload failed');
            }
        } catch (error) {
            setError('Upload failed: ' + error.message);
            console.error("Error uploading image:", error);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={`relative group ${className}`}>
            {/* Current or Preview Image */}
            <img
                src={previewUrl || currentImage || "/default-avatar.png"}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover shadow-md"
            />

            {/* Upload Overlay */}
            <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full cursor-pointer
                            flex items-center justify-center text-white opacity-0 group-hover:opacity-100
                            transition-opacity duration-200">
                <div className="text-center">
                    {isUploading ? (
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mx-auto mb-1" />
                    ) : (
                        <>
                            <Camera className="w-6 h-6 mx-auto mb-1" />
                            <span className="text-sm">Change Photo</span>
                        </>
                    )}
                </div>
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isUploading}
                />
            </label>

            {/* Error Message */}
            {error && (
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2
                               bg-red-500 text-white text-xs px-2 py-1 rounded">
                    {error}
                </div>
            )}
        </div>
    );
}

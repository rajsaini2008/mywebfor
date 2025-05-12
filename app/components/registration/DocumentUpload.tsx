'use client';

import { useState, useEffect } from 'react';
import { StudentData } from '../StudentRegistration';
import Image from 'next/image';

interface DocumentUploadProps {
  data: StudentData;
  updateData: (data: Partial<StudentData>) => void;
  onNext: () => void;
  onBack: () => void;
  isEditing?: boolean;
}

const DocumentUpload = ({ data, updateData, onNext, onBack, isEditing }: DocumentUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string>('');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, field: keyof StudentData) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0], field);
    }
  };

  const handleFile = (file: File, field: keyof StudentData) => {
    updateData({ [field]: file });
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews(prev => ({
        ...prev,
        [field]: reader.result as string
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof StudentData) => {
    const file = e.target.files?.[0];
    if (file) {
      updateData({ [field]: file });
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setPreviews(prev => ({ ...prev, [field]: previewUrl }));
    }
  };

  const getPreviewUrl = (field: keyof StudentData) => {
    // If there's a preview (newly selected file), use it
    if (previews[field]) {
      return previews[field];
    }
    
    // If we're in edit mode and there's an existing URL, use it
    const urlField = `${field}Url` as keyof StudentData;
    if (isEditing && data[urlField]) {
      return data[urlField];
    }
    
    // Otherwise, show placeholder
    return '/images/placeholder-image.jpg';
  };

  // Initialize previews with existing URLs in edit mode
  useEffect(() => {
    if (isEditing) {
      const initialPreviews: { [key: string]: string } = {};
      
      // Check for existing document URLs and add them to previews
      if (data.photoUrl) initialPreviews.photo = data.photoUrl;
      if (data.signatureUrl) initialPreviews.signature = data.signatureUrl;
      if (data.aadharCardUrl) initialPreviews.aadharCard = data.aadharCardUrl;
      if (data.previousMarksheetUrl) initialPreviews.previousMarksheet = data.previousMarksheetUrl;
      if (data.photoIdProofUrl) initialPreviews.photoIdProof = data.photoIdProofUrl;
      if (data.certificateProofUrl) initialPreviews.certificateProof = data.certificateProofUrl;
      
      setPreviews(initialPreviews);
      console.log("Initialized document previews:", initialPreviews);
    }
  }, [isEditing, data]);

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      Object.values(previews).forEach(url => {
        if (url && url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [previews]);

  const renderPreview = (field: keyof StudentData, file?: File) => {
    // Get the URL field name corresponding to this field (e.g., 'photoUrl' for 'photo')
    const urlField = `${field}Url` as keyof StudentData;
    
    // Check if we have a preview from a newly uploaded file
    if (previews[field]) {
      const preview = previews[field];
      const isImage = file?.type?.startsWith('image/') || preview.includes('image') || preview.endsWith('.jpg') || preview.endsWith('.jpeg') || preview.endsWith('.png');

      return (
        <div className="mt-4 relative w-full h-40 border rounded-lg overflow-hidden">
          {isImage ? (
            <Image
              src={preview}
              alt={`Preview of ${field}`}
              fill
              className="object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder-image.jpg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">{file?.name || "Document"}</p>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Check if we have an existing URL in edit mode
    if (isEditing && data[urlField]) {
      const existingUrl = data[urlField] as string;
      const isImage = existingUrl.includes('image') || existingUrl.endsWith('.jpg') || existingUrl.endsWith('.jpeg') || existingUrl.endsWith('.png');
      
      return (
        <div className="mt-4 relative w-full h-40 border rounded-lg overflow-hidden">
          {isImage ? (
            <Image
              src={existingUrl}
              alt={`Existing ${field}`}
              fill
              className="object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder-image.jpg';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-600">Existing Document</p>
              </div>
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };

  const validateFiles = () => {
    const requiredFiles = {
      photo: 'Photo',
      signature: 'Signature',
      aadharCard: 'Aadhar Card',
      previousMarksheet: 'Previous Marksheet'
    };

    const missingFiles = [];
    for (const [field, label] of Object.entries(requiredFiles)) {
      const fileField = field as keyof StudentData;
      const urlField = `${field}Url` as keyof StudentData;
      
      if (!data[fileField] && !data[urlField]) {
        missingFiles.push(label);
      }
    }

    if (missingFiles.length > 0) {
      setError(`Please upload the following documents: ${missingFiles.join(', ')}`);
      return false;
    }

    setError(''); // Clear any previous error
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateFiles()) {
      onNext();
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Photo Upload */}
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Photo Upload</h3>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ease-in-out
                  ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={(e) => handleDrop(e, 'photo')}
              >
                <input
                  type="file"
                  id="photo"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'photo')}
                />
                <label
                  htmlFor="photo"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Upload Photo</p>
                  <p className="text-xs text-gray-500 mt-1">Drag & drop or click to upload</p>
                  {data.photo && (
                    <p className="text-xs text-primary mt-2">Selected: {data.photo.name}</p>
                  )}
                  {isEditing && data.photoUrl && !data.photo && (
                    <p className="text-xs text-green-600 mt-2">Existing photo available</p>
                  )}
                </label>
              </div>
              {renderPreview('photo', data.photo)}
            </div>
          </div>

          {/* Signature Upload */}
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Signature Upload</h3>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ease-in-out
                  ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={(e) => handleDrop(e, 'signature')}
              >
                <input
                  type="file"
                  id="signature"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'signature')}
                />
                <label
                  htmlFor="signature"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Upload Signature</p>
                  <p className="text-xs text-gray-500 mt-1">Drag & drop or click to upload</p>
                  {data.signature && (
                    <p className="text-xs text-primary mt-2">Selected: {data.signature.name}</p>
                  )}
                  {isEditing && data.signatureUrl && !data.signature && (
                    <p className="text-xs text-green-600 mt-2">Existing signature available</p>
                  )}
                </label>
              </div>
              {renderPreview('signature', data.signature)}
            </div>
          </div>

          {/* Aadhar Card Upload with Number */}
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aadhar Card Upload</h3>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ease-in-out mb-4
                  ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={(e) => handleDrop(e, 'aadharCard')}
              >
                <input
                  type="file"
                  id="aadharCard"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'aadharCard')}
                />
                <label
                  htmlFor="aadharCard"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Upload Aadhar Card</p>
                  <p className="text-xs text-gray-500 mt-1">Drag & drop or click to upload</p>
                  {data.aadharCard && (
                    <p className="text-xs text-primary mt-2">Selected: {data.aadharCard.name}</p>
                  )}
                  {isEditing && data.aadharCardUrl && !data.aadharCard && (
                    <p className="text-xs text-green-600 mt-2">Existing Aadhar card available</p>
                  )}
                </label>
              </div>
              {renderPreview('aadharCard', data.aadharCard)}
              <div className="mt-4">
                <label htmlFor="aadharNo" className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhar Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="aadharNo"
                  value={data.aadharNo || ''}
                  onChange={(e) => updateData({ aadharNo: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter 12-digit Aadhar number"
                  maxLength={12}
                  required
                />
              </div>
            </div>
          </div>

          {/* Previous Marksheet Upload with Roll Number */}
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Previous Marksheet Upload</h3>
              <div
                className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ease-in-out mb-4
                  ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={(e) => handleDrop(e, 'previousMarksheet')}
              >
                <input
                  type="file"
                  id="previousMarksheet"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'previousMarksheet')}
                />
                <label
                  htmlFor="previousMarksheet"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900">Upload Previous Marksheet</p>
                  <p className="text-xs text-gray-500 mt-1">Drag & drop or click to upload</p>
                  {data.previousMarksheet && (
                    <p className="text-xs text-primary mt-2">Selected: {data.previousMarksheet.name}</p>
                  )}
                  {isEditing && data.previousMarksheetUrl && !data.previousMarksheet && (
                    <p className="text-xs text-green-600 mt-2">Existing marksheet available</p>
                  )}
                </label>
                </div>
              {renderPreview('previousMarksheet', data.previousMarksheet)}
              <div className="mt-4">
                <label htmlFor="rollNo" className="block text-sm font-medium text-gray-700 mb-2">
                  Roll Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="rollNo"
                  value={data.rollNo || ''}
                  onChange={(e) => updateData({ rollNo: e.target.value })}
                  className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter your roll number"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            Continue to Payment
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentUpload;
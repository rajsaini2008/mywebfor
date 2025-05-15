'use client';

import { useState, useEffect } from 'react';
import { StudentData } from '../StudentRegistration';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';

interface PaymentDetailsProps {
  data: StudentData;
  updateData: (data: Partial<StudentData>) => void;
  onSubmit: () => void;
  onBack: () => void;
  isEditing?: boolean;
  studentId?: string;
}

interface CourseDetails {
  _id: string;
  name: string;
  duration: number;
  fee: number;
}

const PaymentDetails = ({ data, updateData, onSubmit, onBack, isEditing, studentId }: PaymentDetailsProps) => {
  const router = useRouter();
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [payableAmount, setPayableAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch course details when component mounts
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`/api/courses/${data.course}`);
        const result = await response.json();
        if (result.success) {
          setCourseDetails(result.data);
          // Set initial course fee and payable amount
          const initialFee = result.data.fee;
          updateData({ courseFee: initialFee });
          setPayableAmount(initialFee);
        }
      } catch (error) {
        console.error('Error fetching course details:', error);
      }
    };

    if (data.course) {
      fetchCourseDetails();
    }
  }, [data.course]);

  // Calculate payable amount when discount changes
  const handleDiscountChange = (value: number) => {
    const discount = Math.min(Math.max(0, value), courseDetails?.fee || 0); // Prevent negative or excess discount
    updateData({ discount });
    setPayableAmount((courseDetails?.fee || 0) - discount);
  };

  const validateForm = () => {
    // Check if we have all the basic details
    const basicFields = {
      name: 'Name',
      fatherName: 'Father\'s Name',
      motherName: 'Mother\'s Name',
      dateOfBirth: 'Date of Birth',
      dateOfJoining: 'Date of Joining',
      gender: 'Gender',
      aadharNo: 'Aadhar Number',
      course: 'Course',
      state: 'State',
      district: 'District',
      city: 'City',
      address: 'Address',
      pincode: 'Pincode'
    };

    // Check if we have all required documents
    const documentFields = {
      photoUrl: 'Photo',
      signatureUrl: 'Signature',
      aadharCardUrl: 'Aadhar Card',
      previousMarksheetUrl: 'Previous Marksheet'
    };

    const missingFields = [];
    
    // Check basic fields
    for (const [field, label] of Object.entries(basicFields)) {
      const value = data[field as keyof StudentData];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(label);
      }
    }

    // Check document fields - either need a File object or a URL
    for (const [field, label] of Object.entries(documentFields)) {
      const fileField = field.replace('Url', '') as keyof StudentData;
      const urlField = field as keyof StudentData;
      
      if (!data[fileField] && !data[urlField]) {
        missingFields.push(label);
      }
    }

    // Check payment details
    if (!courseDetails) {
      missingFields.push('Course Details');
    }

    if (missingFields.length > 0) {
      setError(`Please provide the following required fields: ${missingFields.join(', ')}`);
      return false;
    }

    setError(''); // Clear any previous error
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    setError('');

    try {
      // First upload all files and get their URLs
      const uploadFiles = async () => {
        const formData = new FormData();
        
        // Generate a unique student folder ID that will be consistent for this student
        const studentId = data.aadharNo ? 
          data.aadharNo.substring(0, 6) : 
          Date.now().toString().substring(0, 6);
        
        const studentFolder = `students/${data.name.toLowerCase().replace(/\s+/g, '_')}_${studentId}`;
        console.log(`Creating student folder: ${studentFolder}`);
        
        // Add all files to FormData if they exist with proper folder designations
        if (data.photo instanceof File) {
          formData.append('photo', data.photo);
          formData.append('folder', `${studentFolder}/photos`);
        }
        if (data.signature instanceof File) {
          formData.append('signature', data.signature);
          formData.append('folder', `${studentFolder}/signatures`);
        }
        if (data.aadharCard instanceof File) {
          formData.append('aadharCard', data.aadharCard);
          formData.append('folder', `${studentFolder}/idcards`);
        }
        if (data.previousMarksheet instanceof File) {
          formData.append('previousMarksheet', data.previousMarksheet);
          formData.append('folder', `${studentFolder}/documents`);
        }
        if (data.photoIdProof instanceof File) {
          formData.append('photoIdProof', data.photoIdProof);
          formData.append('folder', `${studentFolder}/identities`);
        }
        if (data.certificateProof instanceof File) {
          formData.append('certificateProof', data.certificateProof);
          formData.append('folder', `${studentFolder}/certificates`);
        }

        // Only upload if there are files
        if (formData.has('photo') || formData.has('signature') || formData.has('aadharCard') || 
            formData.has('previousMarksheet') || formData.has('photoIdProof') || formData.has('certificateProof')) {
          
          console.log("Uploading files to Cloudinary...");
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.json();
            console.error("Upload failed:", errorData);
            throw new Error('Failed to upload files: ' + (errorData.message || uploadResponse.statusText));
          }
          
          const responseData = await uploadResponse.json();
          console.log("Upload response:", responseData);
          
          // Convert array of URLs to object with field names
          if (responseData.success && Array.isArray(responseData.urls)) {
            const urlsObject: {[key: string]: string} = {};
            let urlIndex = 0;
            
            // Map each URL to the corresponding field
            if (data.photo instanceof File && urlIndex < responseData.urls.length) {
              urlsObject.photo = responseData.urls[urlIndex++];
            }
            if (data.signature instanceof File && urlIndex < responseData.urls.length) {
              urlsObject.signature = responseData.urls[urlIndex++];
            }
            if (data.aadharCard instanceof File && urlIndex < responseData.urls.length) {
              urlsObject.aadharCard = responseData.urls[urlIndex++];
            }
            if (data.previousMarksheet instanceof File && urlIndex < responseData.urls.length) {
              urlsObject.previousMarksheet = responseData.urls[urlIndex++];
            }
            if (data.photoIdProof instanceof File && urlIndex < responseData.urls.length) {
              urlsObject.photoIdProof = responseData.urls[urlIndex++];
            }
            if (data.certificateProof instanceof File && urlIndex < responseData.urls.length) {
              urlsObject.certificateProof = responseData.urls[urlIndex++];
            }
            
            return { urls: urlsObject };
          }
          
          return responseData;
        }
        
        return { urls: {} };
      };

      // Upload files first
      const uploadResult = await uploadFiles();
      console.log("Upload result:", uploadResult);
      let uploadedFiles = uploadResult.urls || {};
      
      // Use the fileMap if available (new API response format)
      if (uploadResult.fileMap) {
        uploadedFiles = uploadResult.fileMap;
      }
      
      // Log the uploaded file URLs to help with debugging
      console.log("Uploaded file URLs:", uploadedFiles);

      // Calculate total fee and payable amount
      const totalFee = (courseDetails?.fee || 0) + (data.admissionFee || 0) + (data.examFee || 0);
      const finalPayableAmount = totalFee - (data.discount || 0);

      // Prepare student data with all fields
      const studentData: any = {
        // Basic Details
        name: data.name,
        email: data.email || `${data.name.toLowerCase().replace(/\s+/g, '.')}@student.krishnacomputers.com`,
        fatherName: data.fatherName,
        motherName: data.motherName,
        dateOfBirth: data.dateOfBirth,
        dateOfJoining: data.dateOfJoining,
        gender: data.gender.charAt(0).toUpperCase() + data.gender.slice(1).toLowerCase(),
        aadharNo: data.aadharNo,
        course: data.course,
        state: data.state,
        district: data.district,
        city: data.city,
        address: data.address,
        landmark: data.landmark || '',
        pincode: data.pincode,
        phone: data.phone || data.aadharNo,
        mobile: data.mobile || data.phone || data.aadharNo,

        // Document URLs (use uploaded URLs or existing URLs)
        photoUrl: uploadedFiles.photo || data.photoUrl || '',
        signatureUrl: uploadedFiles.signature || data.signatureUrl || '',
        aadharCardUrl: uploadedFiles.aadharCard || data.aadharCardUrl || '',
        previousMarksheetUrl: uploadedFiles.previousMarksheet || data.previousMarksheetUrl || '',
        photoIdProofUrl: uploadedFiles.photoIdProof || data.photoIdProofUrl || '',
        certificateProofUrl: uploadedFiles.certificateProof || data.certificateProofUrl || '',
        idCardUrl: uploadedFiles.idCard || data.idCardUrl || '',

        // Additional Details
        rollNo: data.rollNo || '',
        photoIdType: data.photoIdType || '',
        photoIdNumber: data.photoIdNumber || '',
        qualificationType: data.qualificationType || '',
        certificateNumber: data.certificateNumber || '',

        // Payment Details
        courseFee: courseDetails?.fee || 0,
        admissionFee: data.admissionFee || 0,
        examFee: data.examFee || 0,
        discount: data.discount || 0,
        totalFee: totalFee,
        payableAmount: finalPayableAmount,
        installmentCount: data.installmentCount || 1,
        intervalInMonths: data.intervalInMonths || 0,
        admissionRemark: data.admissionRemark || '',

        // Course Details
        courseName: courseDetails?.name || '',
        courseDuration: courseDetails?.duration || 0,

        // System Fields
        centerId: data.centerId || 'MAIN',
        password: data.dateOfBirth.replace(/-/g, ''),
        status: 'Active',
        updatedAt: new Date().toISOString(),
      };

      // If not editing, add registration date
      if (!isEditing) {
        studentData.registrationDate = new Date().toISOString();
      }

      console.log(`${isEditing ? 'Updating' : 'Submitting'} student data:`, JSON.stringify(studentData, null, 2));

      // Determine API endpoint and method based on whether we're editing or creating
      const apiUrl = isEditing && studentId 
        ? `/api/students/${studentId}`
        : '/api/students';
      
      const method = isEditing && studentId ? 'PUT' : 'POST';

      // Submit student data
      const response = await fetch(apiUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studentData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Server error response:", result);
        throw new Error(result.message || `${isEditing ? 'Update' : 'Registration'} failed`);
      }

      // Success
      toast({
        title: "Success",
        description: `Student ${isEditing ? 'updated' : 'registered'} successfully!`,
      });
      
      // Call onSubmit to notify parent component
      onSubmit();
      
      // Redirect to students list with a slight delay to ensure toast is visible
      setTimeout(() => {
        window.location.href = '/admin/students';
      }, 1500);
    } catch (error: any) {
      console.error(`Error ${isEditing ? 'updating' : 'registering'} student:`, error);
      setError(error.message || `Failed to ${isEditing ? 'update' : 'register'} student. Please try again.`);
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEditing ? 'update' : 'register'} student. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="py-2 px-4">Course</th>
                <th className="py-2 px-4">Duration (in Months)</th>
                <th className="py-2 px-4">Course Fee</th>
                <th className="py-2 px-4">Discount</th>
                <th className="py-2 px-4">Payable Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-2 px-4">
                  <input
                    type="text"
                    value={courseDetails?.name || ''}
                    disabled
                    className="w-full border rounded px-2 py-1 bg-gray-50"
                  />
                </td>
                <td className="py-2 px-4">
                  <input
                    type="number"
                    value={courseDetails?.duration || 0}
                    disabled
                    className="w-full border rounded px-2 py-1 bg-gray-50"
                  />
                </td>
                <td className="py-2 px-4">
                  <input
                    type="number"
                    value={courseDetails?.fee || 0}
                    disabled
                    className="w-full border rounded px-2 py-1 bg-gray-50"
                  />
                </td>
                <td className="py-2 px-4">
                  <input
                    type="number"
                    value={data.discount || 0}
                    onChange={(e) => handleDiscountChange(Number(e.target.value))}
                    className="w-full border rounded px-2 py-1"
                    min="0"
                    max={courseDetails?.fee || 0}
                  />
                </td>
                <td className="py-2 px-4">
                  <input
                    type="number"
                    value={payableAmount}
                    disabled
                    className="w-full border rounded px-2 py-1 bg-gray-50 font-semibold text-primary"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Admission Remark */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admission Remark
          </label>
          <textarea
            value={data.admissionRemark || ''}
            onChange={(e) => updateData({ admissionRemark: e.target.value })}
            rows={4}
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Enter any remarks"
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            disabled={isSubmitting}
          >
            Back
          </button>
          <button
            type="submit"
            className={`px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : isEditing ? 'Update Student' : 'Complete Registration'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentDetails; 
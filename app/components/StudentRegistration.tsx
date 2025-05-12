'use client';

import { useState } from 'react';
import BasicDetails from '@/app/components/registration/BasicDetails';
import DocumentUpload from '@/app/components/registration/DocumentUpload';
import PaymentDetails from '@/app/components/registration/PaymentDetails';
import { toast } from '@/components/ui/use-toast';

export type StudentData = {
  // Basic Details
  referralCode?: string;
  name: string;
  email?: string;
  fatherName: string;
  motherName: string;
  dateOfBirth: string;
  dateOfJoining: string;
  gender: string;
  aadharNo: string;
  course: string;
  state: string;
  district: string;
  city: string;
  address: string;
  landmark?: string;
  pincode: string;
  phone?: string;
  mobile?: string;
  
  // Document Upload
  photo?: File;
  photoUrl?: string;
  signature?: File;
  signatureUrl?: string;
  aadharCard?: File;
  aadharCardUrl?: string;
  rollNo?: string;
  photoIdType?: string;
  photoIdNumber?: string;
  photoIdProof?: File;
  photoIdProofUrl?: string;
  qualificationType?: string;
  certificateNumber?: string;
  certificateProof?: File;
  certificateProofUrl?: string;
  previousMarksheet?: File;
  previousMarksheetUrl?: string;
  idCardUrl?: string;
  
  // Payment Details
  courseFee: number;
  admissionFee: number;
  examFee: number;
  discount: number;
  totalFee: number;
  payableAmount?: number;
  installmentCount: number;
  intervalInMonths: number;
  admissionRemark?: string;
  
  // Additional Details
  status?: string;
  registrationDate?: string;
  courseName?: string;
  courseDuration?: number;
  centerId?: string;
  password?: string;
  updatedAt?: string;
};

interface StudentRegistrationProps {
  initialData?: StudentData;
  isEditing?: boolean;
  studentId?: string;
}

const StudentRegistration = ({ initialData, isEditing = false, studentId }: StudentRegistrationProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [studentData, setStudentData] = useState<StudentData>(initialData || {
    name: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    dateOfJoining: '',
    gender: '',
    aadharNo: '',
    course: '',
    state: '',
    district: '',
    city: '',
    address: '',
    pincode: '',
    courseFee: 0,
    admissionFee: 0,
    examFee: 0,
    discount: 0,
    totalFee: 0,
    installmentCount: 1,
    intervalInMonths: 0,
  });

  const validateBasicDetails = () => {
    const requiredFields = [
      'name',
      'fatherName',
      'motherName',
      'dateOfBirth',
      'dateOfJoining',
      'gender',
      'aadharNo',
      'course',
      'state',
      'district',
      'city',
      'address',
      'pincode'
    ];

    const missingFields = requiredFields.filter(field => !studentData[field as keyof StudentData]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Required Fields",
        description: `Please fill in all required fields: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const validateDocuments = () => {
    // In edit mode, don't require documents if they already exist as URLs
    if (isEditing) {
      const requiredDocs = ['photo', 'signature', 'aadharCard', 'previousMarksheet'];
      const missingDocs = requiredDocs.filter(doc => {
        const fileKey = doc as keyof StudentData;
        const urlKey = `${doc}Url` as keyof StudentData;
        return !studentData[fileKey] && !studentData[urlKey];
      });
      
      if (missingDocs.length > 0) {
        toast({
          title: "Missing Required Documents",
          description: `Please upload all required documents: ${missingDocs.join(', ')}`,
          variant: "destructive"
        });
        return false;
      }
      return true;
    }

    // For new registration, require actual files
    const requiredDocs = ['photo', 'signature', 'aadharCard', 'previousMarksheet'];
    const missingDocs = requiredDocs.filter(doc => !studentData[doc as keyof StudentData]);
    
    if (missingDocs.length > 0) {
      toast({
        title: "Missing Required Documents",
        description: `Please upload all required documents: ${missingDocs.join(', ')}`,
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateBasicDetails()) {
      return;
    }
    if (currentStep === 2 && !validateDocuments()) {
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const updateStudentData = (data: Partial<StudentData>) => {
    setStudentData((prev) => ({ ...prev, ...data }));
  };

  const handleSubmit = async () => {
    try {
      // Final validation before submission
      const requiredFields = [
        'name', 'fatherName', 'motherName', 'dateOfBirth', 'dateOfJoining', 
        'gender', 'aadharNo', 'course', 'state', 'district', 'city', 
        'address', 'pincode'
      ];
      
      const missingFields = requiredFields.filter(field => !studentData[field as keyof StudentData]);
      
      if (missingFields.length > 0) {
        toast({
          title: "Missing Required Fields",
          description: `Please fill in all required fields: ${missingFields.join(', ')}`,
          variant: "destructive"
        });
        // Go back to the first step if basic details are missing
        setCurrentStep(1);
        return;
      }

      // The actual form submission is handled in the PaymentDetails component
      // This function is just called as a callback after successful submission
      
      toast({
        title: isEditing ? "Student Updated" : "Student Registered",
        description: `${studentData.name} has been ${isEditing ? 'updated' : 'registered'} successfully.`,
      });
      
      // Redirect to students list
      window.location.href = '/admin/students';
    } catch (error: any) {
      console.error(isEditing ? "Error updating student:" : "Error registering student:", error);
      toast({
        title: "Error",
        description: error.message || `An error occurred while ${isEditing ? 'updating' : 'registering'} the student`,
        variant: "destructive",
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicDetails
            data={studentData}
            updateData={updateStudentData}
            onNext={handleNext}
            isEditing={isEditing}
          />
        );
      case 2:
        return (
          <DocumentUpload
            data={studentData}
            updateData={updateStudentData}
            onNext={handleNext}
            onBack={handlePrevious}
            isEditing={isEditing}
          />
        );
      case 3:
        return (
          <PaymentDetails
            data={studentData}
            updateData={updateStudentData}
            onBack={handlePrevious}
            onSubmit={handleSubmit}
            isEditing={isEditing}
            studentId={studentId}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {isEditing ? 'Edit Student' : 'Student Registration'}
        </h2>
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="flex">
            <div
              className={`flex-1 px-6 py-4 text-center ${
                currentStep === 1
                  ? 'bg-orange-500 text-white'
                  : currentStep > 1
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Step 1 Basic Details
            </div>
            <div
              className={`flex-1 px-6 py-4 text-center ${
                currentStep === 2
                  ? 'bg-orange-500 text-white'
                  : currentStep > 2
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Step 2 Document Upload
            </div>
            <div
              className={`flex-1 px-6 py-4 text-center ${
                currentStep === 3
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              Step 3 Payment Details
            </div>
          </div>
        </div>
      </div>

      {renderStep()}
    </div>
  );
}

export default StudentRegistration; 
'use client';

import { useState, useEffect } from 'react';
import { StudentData } from '../StudentRegistration';
import { indianStates } from '@/lib/constants/states';

interface BasicDetailsProps {
  data: StudentData;
  updateData: (data: Partial<StudentData>) => void;
  onNext: () => void;
  isEditing?: boolean;
}

const BasicDetails = ({ data, updateData, onNext, isEditing }: BasicDetailsProps) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        const result = await response.json();
        if (result.success) {
          setCourses(result.data);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Update districts when state changes
  useEffect(() => {
    if (data.state) {
      const stateData = indianStates.find(s => s.state === data.state);
      if (stateData) {
        setDistricts(stateData.districts);
      }
    }
  }, [data.state]);

  const validateForm = () => {
    const requiredFields = {
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

    const missingFields = [];
    for (const [field, label] of Object.entries(requiredFields)) {
      const value = data[field as keyof StudentData];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(label);
      }
    }

    if (missingFields.length > 0) {
      setError(`Please fill in the following fields: ${missingFields.join(', ')}`);
      return false;
    }

    setError(''); // Clear any previous error
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
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
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="space-y-10">
          {/* Personal Information Section */}
          <div>
            <div className="flex items-center mb-6">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
              {/* Referral Code */}
              <div className="col-span-1">
                <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Referral Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="referralCode"
                    value={data.referralCode || ''}
                    onChange={(e) => updateData({ referralCode: e.target.value })}
                    className="h-12 px-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ease-in-out"
                    placeholder="Enter referral code"
                  />
                </div>
              </div>

              {/* Name */}
              <div className="col-span-1">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    required
                    value={data.name}
                    onChange={(e) => updateData({ name: e.target.value })}
                    className="h-12 px-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ease-in-out"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="col-span-1">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={data.email || ''}
                    onChange={(e) => updateData({ email: e.target.value })}
                    className="h-12 px-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ease-in-out"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              {/* Father's Name */}
              <div className="col-span-1">
                <label htmlFor="fatherName" className="block text-sm font-medium text-gray-700 mb-2">
                  Father's Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="fatherName"
                    required
                    value={data.fatherName}
                    onChange={(e) => updateData({ fatherName: e.target.value })}
                    className="h-12 px-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ease-in-out"
                    placeholder="Enter father's name"
                  />
                </div>
              </div>

              {/* Mother's Name */}
              <div className="col-span-1">
                <label htmlFor="motherName" className="block text-sm font-medium text-gray-700 mb-2">
                  Mother's Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="motherName"
                    required
                    value={data.motherName}
                    onChange={(e) => updateData({ motherName: e.target.value })}
                    className="h-12 px-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ease-in-out"
                    placeholder="Enter mother's name"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="col-span-1">
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="dateOfBirth"
                    required
                    value={data.dateOfBirth}
                    onChange={(e) => updateData({ dateOfBirth: e.target.value })}
                    className="h-12 px-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ease-in-out"
                  />
                </div>
              </div>

              {/* Date of Joining */}
              <div className="col-span-1">
                <label htmlFor="dateOfJoining" className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Joining <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="dateOfJoining"
                    required
                    value={data.dateOfJoining}
                    onChange={(e) => updateData({ dateOfJoining: e.target.value })}
                    className="h-12 px-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ease-in-out"
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="col-span-1">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="gender"
                    required
                    value={data.gender?.toLowerCase() || ''}
                    onChange={(e) => updateData({ gender: e.target.value })}
                    className="h-12 px-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ease-in-out"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Aadhar Number */}
              <div className="col-span-1">
                <label htmlFor="aadharNo" className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhar No. <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="aadharNo"
                    required
                    value={data.aadharNo}
                    onChange={(e) => updateData({ aadharNo: e.target.value })}
                    className="h-12 px-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ease-in-out"
                    placeholder="Enter Aadhar number"
                  />
                </div>
              </div>

              {/* Course */}
              <div className="col-span-1">
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
                  Course <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="course"
                    required
                    value={data.course}
                    onChange={(e) => updateData({ course: e.target.value })}
                    className="h-12 px-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ease-in-out"
                  >
                    <option value="">Select Course</option>
                    {loading ? (
                      <option value="" disabled>Loading courses...</option>
                    ) : (
                      courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Present Address Section */}
          <div>
            <div className="flex items-center mb-6">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Present Address</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
              {/* State */}
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                  State <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="state"
                    required
                    value={data.state}
                    onChange={(e) => {
                      updateData({ state: e.target.value, district: '' });
                    }}
                    className="h-12 px-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ease-in-out"
                  >
                    <option value="">Select State</option>
                    {indianStates.map((state) => (
                      <option key={state.state} value={state.state}>
                        {state.state}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* District */}
              <div>
                <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-2">
                  District <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="district"
                    required
                    value={data.district}
                    onChange={(e) => updateData({ district: e.target.value })}
                    className="h-12 px-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ease-in-out"
                  >
                    <option value="">Select District</option>
                    {districts.map((district) => (
                      <option key={district} value={district}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* City */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="city"
                    required
                    value={data.city}
                    onChange={(e) => updateData({ city: e.target.value })}
                    className="h-12 px-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ease-in-out"
                    placeholder="Enter city name"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="address"
                    required
                    value={data.address}
                    onChange={(e) => updateData({ address: e.target.value })}
                    className="h-12 px-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ease-in-out"
                    placeholder="Enter full address"
                  />
                </div>
              </div>

              {/* Landmark */}
              <div>
                <label htmlFor="landmark" className="block text-sm font-medium text-gray-700 mb-2">
                  Landmark
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="landmark"
                    value={data.landmark || ''}
                    onChange={(e) => updateData({ landmark: e.target.value })}
                    className="h-12 px-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ease-in-out"
                    placeholder="Enter landmark"
                  />
                </div>
              </div>

              {/* Pincode */}
              <div>
                <label htmlFor="pincode" className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="pincode"
                    required
                    value={data.pincode}
                    onChange={(e) => updateData({ pincode: e.target.value })}
                    className="h-12 px-4 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 ease-in-out"
                    placeholder="Enter pincode"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress and Next Button */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <div className="w-12 h-1 bg-gray-200"></div>
              <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
              <div className="w-12 h-1 bg-gray-200"></div>
              <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
            </div>
            <div className="flex justify-end pt-6">
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {isEditing ? 'Next: Documents' : 'Next Step'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BasicDetails; 
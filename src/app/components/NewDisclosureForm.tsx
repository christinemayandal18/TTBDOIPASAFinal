import { useState } from 'react';
import { useNavigate } from 'react-router';
import UserNav from './UserNav';
import { useDatabase } from '../context/DatabaseContext';
import { toast } from 'sonner';

export default function NewDisclosureForm() {
  const navigate = useNavigate();
  const { addApplication } = useDatabase();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problemSolved: '',
    inventorName: 'Dr. Juan Inventor',
    college: 'College of Agriculture and Food Science',
    department: 'Institute of Crop Science',
    ipType: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ipType) {
      toast.error("Please select an IP type");
      return;
    }

    const newApp = {
      title: formData.title,
      dateDisclosed: new Date().toISOString().split('T')[0],
      ipType: formData.ipType,
      inventorName: formData.inventorName,
      college: formData.college,
      department: formData.department
    };

    addApplication(newApp);
    toast.success("Disclosure submitted successfully! A case handler will review and conduct prior art search.");
    navigate('/inventor/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex pt-14">
      <UserNav />
      <div className="max-w-[800px] flex-1 min-w-0 p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 text-gray-900">New IP Disclosure</h1>
          <p className="text-gray-600">Provide the specifications of your invention. Our system will analyze it to determine the best IP protection route.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Inventor Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Inventor</label>
                  <input type="text" name="inventorName" value={formData.inventorName} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-salmon-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
                  <select name="college" value={formData.college} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-salmon-500 outline-none bg-white">
                    <option>College of Agriculture and Food Science</option>
                    <option>College of Engineering and Agro-Industrial Technology</option>
                    <option>College of Forestry and Natural Resources</option>
                    <option>College of Arts and Sciences</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department/Institute</label>
                  <input type="text" name="department" value={formData.department} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-salmon-500 outline-none" required />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">Invention Specifications</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Working Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Automated Plant Disease Detection System" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-salmon-500 outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">IP Protection Type</label>
                <select name="ipType" value={formData.ipType} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-salmon-500 outline-none bg-white" required>
                  <option value="">Select IP Type...</option>
                  <option value="Patent">Patent</option>
                  <option value="Utility Model">Utility Model</option>
                  <option value="Trademark">Trademark</option>
                  <option value="Copyright">Copyright</option>

                </select>
                <p className="text-xs text-gray-500 mt-1">Case handlers will assess your selection and conduct prior art search upon assignment</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brief Description / Abstract</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4} placeholder="Describe what it is, how it works, and its main components..." className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-salmon-500 outline-none resize-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Problem Solved</label>
                <textarea name="problemSolved" value={formData.problemSolved} onChange={handleInputChange} rows={3} placeholder="What specific problem does this solve?" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-salmon-500 outline-none resize-none" required />
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
              <button type="button" onClick={() => navigate('/inventor/dashboard')} className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 text-sm font-medium text-white bg-salmon-600 rounded-lg hover:bg-salmon-700 transition-colors"
              >
                Submit Disclosure
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
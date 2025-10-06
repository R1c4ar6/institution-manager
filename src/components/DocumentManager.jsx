import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { useAuth } from '../context/AuthContext';

const DocumentManager = ({ student }) => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');
  const { employee } = useAuth();
  const bucketName = 'documents';

  useEffect(() => {
    if (student) {
      fetchDocuments();
    }
  }, [student]);

  const fetchDocuments = async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('student_id', student.id)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
    } else {
      setDocuments(data || []);
    }
  };

  const handleFileUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `${student.id}/${fileName}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (uploadError) throw uploadError;

      // Get private URL
      const {data: signedData, error: signedError} = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 60 * 60); // URL valid for 1 hour

      if (signedError) throw signedError;
      let fileUrl=signedData?.signedUrl;

      // Create document record
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          student_id: student.id,
          file_url: fileUrl,
          file_name: file.name,
          description: description,
          uploaded_by: employee.id,
        });

      if (dbError) throw dbError;

      // Refresh documents list
      await fetchDocuments();
      setDescription('');
      e.target.value = ''; // Reset file input
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file: ' + error?.message || error);
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (documentId, filePath) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;

      // Refresh documents list
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Error deleting document: ' + error.message);
    }
  };

  if (!student) {
    return <div className="text-center text-gray-500">Select a student to manage documents</div>;
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Documents for {student.name}
        </h3>
      </div>

      {/* Upload Section */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Document description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex items-center space-x-4">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={uploading}
              className="flex-1"
            />
            <button
              disabled={uploading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {documents.map((document) => (
          <div key={document.id} className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">{document.file_name}</h4>
                <p className="text-sm text-gray-500">{document.description}</p>
                <p className="text-xs text-gray-400">
                  Uploaded on {new Date(document.uploaded_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={document.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                >
                  View
                </a>
                <button
                  onClick={() => deleteDocument(document.id, document.file_url.split('/').pop())}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {documents.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500">
            No documents uploaded yet
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentManager;
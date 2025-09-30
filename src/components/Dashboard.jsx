import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalDocuments: 0,
    recentDocuments: []
  });
  const [loading, setLoading] = useState(true);
  const { employee } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch student statistics
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('id, status');

      if (studentsError) throw studentsError;

      // Fetch document statistics
      const { data: documents, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .order('uploaded_at', { ascending: false })
        .limit(5);

      if (docsError) throw docsError;

      // Calculate stats
      const totalStudents = students?.length || 0;
      const activeStudents = students?.filter(s => s.status === 'active').length || 0;
      const totalDocuments = await getTotalDocumentsCount();

      setStats({
        totalStudents,
        activeStudents,
        totalDocuments,
        recentDocuments: documents || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalDocumentsCount = async () => {
    const { count, error } = await supabase
      .from('documents')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count || 0;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {employee?.name}!
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here's what's happening with your students today.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Total Students */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Students
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.totalStudents}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <Link to="/students" className="font-medium text-blue-600 hover:text-blue-500">
                View all students
              </Link>
            </div>
          </div>
        </div>

        {/* Active Students */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active Students
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.activeStudents}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <span className={`font-medium ${
                (stats.activeStudents / stats.totalStudents) > 0.7 
                  ? 'text-green-600' 
                  : (stats.activeStudents / stats.totalStudents) > 0.4 
                  ? 'text-yellow-600' 
                  : 'text-red-600'
              }`}>
                {stats.totalStudents > 0 
                  ? `${Math.round((stats.activeStudents / stats.totalStudents) * 100)}% active`
                  : 'No students'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Total Documents */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Documents
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900">
                    {stats.totalDocuments}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <span className="font-medium text-gray-600">
                {stats.totalStudents > 0 
                  ? `Avg ${Math.round(stats.totalDocuments / stats.totalStudents)} per student`
                  : 'No documents'
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recently Uploaded Documents
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Latest documents uploaded across all students.
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          {stats.recentDocuments.length === 0 ? (
            <div className="text-center py-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by uploading a document to a student.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {stats.recentDocuments.map((doc) => (
                <li key={doc.id} className="py-4">
                  <div className="flex space-x-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">{doc.file_name}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {doc.description}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>Student ID: {doc.student_id.substring(0, 8)}...</span>
                        <span>•</span>
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-500"
                        >
                          View Document
                        </a>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {stats.recentDocuments.length > 0 && (
            <div className="mt-4 text-sm">
              <Link to="/students" className="font-medium text-blue-600 hover:text-blue-500">
                View all documents →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              to="/students"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Manage Students
            </Link>
            <Link
              to="/students"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Upload Documents
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
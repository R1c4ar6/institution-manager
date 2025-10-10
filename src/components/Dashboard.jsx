import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StudentList from './StudentList';
import DocumentManager from './DocumentManager';
import StudentForm from './StudentForm';

const Dashboard = () => {
  const { employee, logout } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleLogout = async () => {
    await logout();
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setShowStudentForm(false);
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowStudentForm(true);
    setSelectedStudent(null);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowStudentForm(true);
    setSelectedStudent(null);
  };

  const handleStudentSaved = () => {
    setShowStudentForm(false);
    setEditingStudent(null);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-500">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Portal</h1>
              <p className="text-sm text-gray-500">Welcome, {employee?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-400 hover:bg-red-500"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Estudiantes</h2>
              <button
                onClick={handleAddStudent}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Agregar Estudiante
              </button>
            </div>

            {showStudentForm ? (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">
                  {editingStudent ? 'Editar Estudiante' : 'Agregar Estudiante'}
                </h3>
                <StudentForm
                  student={editingStudent}
                  onSave={handleStudentSaved}
                  onCancel={() => setShowStudentForm(false)}
                />
              </div>
            ) : (
              <StudentList
                onSelectStudent={handleStudentSelect}
                refresh={refreshTrigger}
              />
            )}
          </div>

          {/* Right Column */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Administrar documentos</h2>
            {selectedStudent && (
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Managing: {selectedStudent.name}</h3>
                  <button
                    onClick={() => handleEditStudent(selectedStudent)}
                    className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                  >
                    Editar Estudiante
                  </button>
                </div>
              </div>
            )}
            <DocumentManager student={selectedStudent} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
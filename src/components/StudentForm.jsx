import React, { useState, useEffect } from 'react';
import { supabase } from '../config/supabaseClient';

const StudentForm = ({ student, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    enroll_date: '',
    status: true,
    assigned_employee: ''
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEmployees();
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        enroll_date: student.enroll_date || '',
        status: student.status ?? true,
        assigned_employee: student.assigned_employee || ''
      });
    }
  }, [student]);

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from('employees')
      .select('id, name')
      .order('name');

    if (!error) {
      setEmployees(data || []);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (student) {
        // Update existing student
        const { error } = await supabase
          .from('students')
          .update(formData)
          .eq('id', student.id);

        if (error) throw error;
      } else {
        // Create new student
        const { error } = await supabase
          .from('students')
          .insert([formData]);

        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Error saving student: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre</label>
        <input
          type="text"
          name="name"
          required
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          value={formData.name}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Fecha de ingreso</label>
        <input
          type="date"
          name="enroll_date"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          value={formData.enroll_date}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Asignar encargado</label>
        <select
          name="assigned_employee"
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          value={formData.assigned_employee}
          onChange={handleChange}
        >
          <option value="">Sin encargado</option>
          {employees.map(emp => (
            <option key={emp.id} value={emp.id}>{emp.name}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="status"
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          checked={formData.status}
          onChange={handleChange}
        />
        <label className="ml-2 block text-sm text-gray-900">Activo</label>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : (student ? 'Guardar' : 'Agregar')}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
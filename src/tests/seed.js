const { createClient } = require('@supabase/supabase-js');
const { faker } = require('@faker-js/faker');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  // Create employees
  const employees = Array.from({ length: 5 }).map(() => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
  }));

  await supabase.from('employees').insert(employees);

  // Create students
  const students = Array.from({ length: 20 }).map(() => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    enrollment_date: faker.date.past().toISOString().split('T')[0],
    status: faker.helpers.arrayElement(['active', 'inactive']),
    assigned_employee_id: faker.helpers.arrayElement(employees).id,
  }));

  await supabase.from('students').insert(students);

  // Create documents
  const documents = Array.from({ length: 40 }).map(() => {
    const student = faker.helpers.arrayElement(students);
    const employee = faker.helpers.arrayElement(employees);
    return {
      id: faker.string.uuid(),
      student_id: student.id,
      file_url: faker.internet.url(),
      file_name: faker.system.fileName(),
      uploaded_at: faker.date.recent().toISOString(),
      uploaded_by: employee.id,
      description: faker.lorem.sentence(),
    };
  });

  await supabase.from('documents').insert(documents);

  console.log('Seeding complete!');
}

seed().catch(console.error);
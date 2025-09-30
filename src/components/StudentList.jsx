// import { useEffect, useState } from 'react'
// import { supabase } from '../config/supabaseClient'

// function StudentsList() {
//   const [students, setStudents] = useState([])

//   useEffect(() => {
//     async function loadStudents() {
//       const { data, error } = await supabase.from('students').select('*')
//       if (error) console.error(error)
//       else setStudents(data)
//     }
//     loadStudents()
//   }, [])

//   return (
//     <div>
//       <h2>Students</h2>
//       {students.map((s) => (
//         <div key={s.id}>{s.name} - {s.email}</div>
//       ))}
//     </div>
//   )
// }
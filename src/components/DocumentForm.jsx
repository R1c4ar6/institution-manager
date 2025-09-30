const uploadDocument = async (file, studentId) => {
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(`${studentId}/${file.name}`, file)

  if (data) {
    // Save file path in 'documents' table
    await supabase.from('documents').insert({
      student_id: studentId,
      file_url: data.path
    })
  }
}
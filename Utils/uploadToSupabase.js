import supabase from "../Config/supabase.js";

export const uploadToSupabase = async (file, folder) => {
  const fileName = `${Date.now()}-${file.originalname}`;

  const { error } = await supabase.storage
    .from("course-assestments")
    .upload(`${folder}/${fileName}`, file.buffer, {
      contentType: file.mimetype
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("course-assestments")
    .getPublicUrl(`${folder}/${fileName}`);

  return data.publicUrl;
};
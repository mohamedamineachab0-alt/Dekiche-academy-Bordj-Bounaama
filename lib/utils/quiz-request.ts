import { compressImageForAi } from "@/lib/utils/image-compression";

function isImageFile(file: File) {
  return file.type.startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|bmp|tif|tiff)$/i.test(file.name);
}

async function prepareFile(file: File): Promise<File> {
  if (!isImageFile(file)) return file;
  const base64 = await compressImageForAi(file);
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([bytes], name, { type: "image/jpeg" });
}

export async function buildQuizGenerationFormData(params: {
  files?: File[];
  numberOfQuestions: number;
  totalPoints: number;
  language?: string;
  title?: string;
  subjectName?: string;
  level?: string;
  persist?: boolean;
  lessonId?: string;
}) {
  const formData = new FormData();
  formData.append("numberOfQuestions", String(params.numberOfQuestions));
  formData.append("totalPoints", String(params.totalPoints));
  if (params.language) formData.append("language", params.language);
  if (params.title) formData.append("title", params.title);
  if (params.subjectName) formData.append("subjectName", params.subjectName);
  if (params.level) formData.append("level", params.level);
  if (params.persist) formData.append("persist", "true");
  if (params.lessonId) formData.append("lessonId", params.lessonId);

  for (const file of params.files || []) {
    formData.append("files", await prepareFile(file));
  }

  return formData;
}

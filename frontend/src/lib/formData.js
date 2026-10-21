// Wraps a file in FormData under the "file" field the upload endpoints expect
export const toFileFormData = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return formData;
};

export const convertFileToBase64 = async (file: File): Promise<string> => {
  const reader = new FileReader();
  reader.readAsDataURL(file);

  const base64: string = await new Promise((resolve, reject) => {
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

  return base64;
};

export const convertToDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split('/');
  const isoDate = `${year}-${month}-${day}`; // "2000-02-20"
  return new Date(isoDate);
};

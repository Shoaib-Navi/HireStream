import multer from "multer";

const storage = multer.memoryStorage();
export const singleUpload = multer({storage}).single("file");   //same as given in input type="file"
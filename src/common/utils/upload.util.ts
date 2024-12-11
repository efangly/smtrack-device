import { BadRequestException } from '@nestjs/common';
import axios from 'axios';

export const uploadFile = async (file: Express.Multer.File, path: string): Promise<string> => {
  const formData = new FormData();
  const blob = new Blob([file.buffer], { type: file.mimetype });
  formData.append('path', path);
  formData.append('file', blob, file.originalname);
  const response = await axios.post(`${process.env.UPLOAD_PATH}/api/image`, formData, 
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  if (!response.data || !response.data.filePath) {
    throw new BadRequestException('Failed to upload image');
  }
  return `${process.env.UPLOAD_PATH}/${response.data.filePath}`;
}
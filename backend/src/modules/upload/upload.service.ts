import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private readonly uploadDir = './uploads';

  constructor() {
    // Créer le dossier principal s'il n'existe pas
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file: Express.Multer.File, folder: string): Promise<string> {
    const folderPath = path.join(this.uploadDir, folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const ext = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 8)}${ext}`;
    const filePath = path.join(folderPath, fileName);
    
    fs.writeFileSync(filePath, file.buffer);
    
    return `/uploads/${folder}/${fileName}`;
  }

  async saveProfilePhoto(file: Express.Multer.File, userId: string): Promise<string> {
    return this.saveFile(file, `profiles/${userId}`);
  }

  async saveCV(file: Express.Multer.File, userId: string): Promise<string> {
    return this.saveFile(file, `cvs/${userId}`);
  }

  async saveProjectImage(file: Express.Multer.File, projectId: string): Promise<string> {
    return this.saveFile(file, `projects/${projectId}`);
  }

  async saveEventImage(file: Express.Multer.File, eventId: string): Promise<string> {
    return this.saveFile(file, `events/${eventId}`);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    const filePath = path.join(this.uploadDir, fileUrl.replace('/uploads/', ''));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
}
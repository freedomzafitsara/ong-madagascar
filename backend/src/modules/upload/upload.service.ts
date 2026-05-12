// backend/src/modules/upload/upload.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import * as fs from 'fs';      // ← AJOUTER CET IMPORT
import * as path from 'path';  // ← AJOUTER CET IMPORT

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async updateUserPhoto(userId: string, photoUrl: string): Promise<User> {
    await this.userRepository.update(userId, { avatar_url: photoUrl });
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async saveFile(file: Express.Multer.File): Promise<string> {
    const baseUrl = process.env.API_URL || 'http://localhost:4001';
    return `${baseUrl}/uploads/${file.filename}`;
  }

  async deleteFile(filename: string): Promise<boolean> {
    const filePath = path.join(process.cwd(), 'uploads', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }
}
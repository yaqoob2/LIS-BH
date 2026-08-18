import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class StorageService {
  private readonly supabase: SupabaseClient;
  private readonly bucket: string;
  private readonly caseDocumentsBucket: string;

  constructor(private readonly configService: ConfigService) {
    const supabaseUrl = this.configService.getOrThrow<string>('SUPABASE_URL');

    const secretKey = this.configService.getOrThrow<string>(
      'SUPABASE_SECRET_KEY',
    );

    this.bucket = this.configService.getOrThrow<string>(
      'SUPABASE_STORAGE_BUCKET',
    );

    this.caseDocumentsBucket = this.configService.getOrThrow<string>(
      'SUPABASE_CASE_DOCUMENTS_BUCKET',
    );

    this.supabase = createClient(supabaseUrl, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  // LEGAL RESOURCES

  async uploadFile(
    filePath: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      throw new Error(`File upload failed: ${error.message}`);
    }

    return filePath;
  }

  async deleteFile(filePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.bucket)
      .remove([filePath]);

    if (error) {
      throw new Error(`File deletion failed: ${error.message}`);
    }
  }

  async downloadFile(filePath: string): Promise<Buffer> {
    const { data, error } = await this.supabase.storage
      .from(this.bucket)
      .download(filePath);

    if (error || !data) {
      throw new Error(
        `File download failed: ${error?.message ?? 'Unknown error'}`,
      );
    }

    const arrayBuffer = await data.arrayBuffer();

    return Buffer.from(arrayBuffer);
  }

  // CASE DOCUMENTS

  async uploadCaseDocument(
    filePath: string,
    fileBuffer: Buffer,
    contentType: string,
  ): Promise<string> {
    const { error } = await this.supabase.storage
      .from(this.caseDocumentsBucket)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: false,
      });

    if (error) {
      throw new Error(`Case document upload failed: ${error.message}`);
    }

    return filePath;
  }

  async downloadCaseDocument(filePath: string): Promise<Buffer> {
    const { data, error } = await this.supabase.storage
      .from(this.caseDocumentsBucket)
      .download(filePath);

    if (error || !data) {
      throw new Error(
        `Case document download failed: ${error?.message ?? 'Unknown error'}`,
      );
    }

    const arrayBuffer = await data.arrayBuffer();

    return Buffer.from(arrayBuffer);
  }

  async deleteCaseDocument(filePath: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(this.caseDocumentsBucket)
      .remove([filePath]);

    if (error) {
      throw new Error(`Case document deletion failed: ${error.message}`);
    }
  }
}

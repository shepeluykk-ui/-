import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface StoredFileInfo {
  id: string;
  projectId: string;
  documentId: string;
  versionNumber: number;
  originalFileName: string;
  storedFileName: string;
  fileSizeBytes: number;
  fileSizeMb: number;
  mimeType: string;
  sha256: string;
  absolutePath: string;
  relativePath: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFileName?: string;
  mimeType?: string;
  extension?: string;
}

export class FileStorageManager {
  private static instance: FileStorageManager;
  private baseUploadDir: string;
  private fileRegistry: Map<string, StoredFileInfo> = new Map();

  private allowedExtensions = new Set([
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.dwg', '.zip', '.jpg', '.jpeg', '.png'
  ]);

  private mimeMap: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.dwg': 'application/acad',
    '.zip': 'application/zip',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png'
  };

  private constructor() {
    this.baseUploadDir = path.join(process.cwd(), 'uploads', 'documents');
    this.ensureDirectoryExists(this.baseUploadDir);
  }

  public static getInstance(): FileStorageManager {
    if (!FileStorageManager.instance) {
      FileStorageManager.instance = new FileStorageManager();
    }
    return FileStorageManager.instance;
  }

  public getBaseUploadDir(): string {
    return this.baseUploadDir;
  }

  private ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  public validateFile(originalName: string, bufferOrSize: Buffer | number): FileValidationResult {
    if (!originalName || typeof originalName !== 'string') {
      return { valid: false, error: 'Имя файла не указано' };
    }

    // Path traversal protection
    if (originalName.includes('..') || originalName.includes('/') || originalName.includes('\\') || originalName.includes('\0')) {
      return { valid: false, error: 'Недопустимое имя файла (обнаружены спецсимволы пути)' };
    }

    const ext = path.extname(originalName).toLowerCase();
    if (!this.allowedExtensions.has(ext)) {
      return {
        valid: false,
        error: `Формат файла ${ext} не поддерживается. Разрешены: PDF, DOC, DOCX, XLS, XLSX, DWG, ZIP, JPG, PNG`
      };
    }

    const sizeBytes = typeof bufferOrSize === 'number' ? bufferOrSize : bufferOrSize.length;
    const maxSizeBytes = 100 * 1024 * 1024; // 100 MB max
    if (sizeBytes <= 0) {
      return { valid: false, error: 'Файл пуст (0 байт)' };
    }
    if (sizeBytes > maxSizeBytes) {
      return { valid: false, error: 'Размер файла превышает лимит 100 МБ' };
    }

    // Sanitize base name
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9а-яА-ЯёЁ_\-.]/g, '_');
    const sanitizedFileName = `${baseName || 'document'}${ext}`;
    const mimeType = this.mimeMap[ext] || 'application/octet-stream';

    return {
      valid: true,
      sanitizedFileName,
      mimeType,
      extension: ext
    };
  }

  public calculateSha256(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  public async saveBinaryDocument(params: {
    projectId: string;
    documentId: string;
    versionNumber: number;
    originalFileName: string;
    fileBuffer: Buffer;
    uploadedBy: string;
  }): Promise<StoredFileInfo> {
    const { projectId, documentId, versionNumber, originalFileName, fileBuffer, uploadedBy } = params;

    const validation = this.validateFile(originalFileName, fileBuffer);
    if (!validation.valid) {
      throw new Error(validation.error || 'Ошибка валидации файла');
    }

    const cleanProjectId = projectId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanDocId = documentId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const targetDir = path.join(this.baseUploadDir, cleanProjectId, cleanDocId);
    this.ensureDirectoryExists(targetDir);

    const uuid = crypto.randomUUID().slice(0, 8);
    const storedFileName = `${uuid}-${validation.sanitizedFileName}`;
    const absolutePath = path.join(targetDir, storedFileName);
    const relativePath = path.relative(process.cwd(), absolutePath);

    // Save physical file
    await fs.promises.writeFile(absolutePath, fileBuffer);

    const sha256 = this.calculateSha256(fileBuffer);
    const fileSizeBytes = fileBuffer.length;
    const fileSizeMb = parseFloat((fileSizeBytes / (1024 * 1024)).toFixed(2));
    const mimeType = validation.mimeType || 'application/octet-stream';

    const info: StoredFileInfo = {
      id: `file-${Date.now()}-${uuid}`,
      projectId,
      documentId,
      versionNumber,
      originalFileName: validation.sanitizedFileName!,
      storedFileName,
      fileSizeBytes,
      fileSizeMb: Math.max(0.01, fileSizeMb),
      mimeType,
      sha256,
      absolutePath,
      relativePath,
      uploadedBy,
      uploadedAt: new Date().toISOString()
    };

    // Store in memory registry indexed by documentId + versionNumber and by documentId
    this.fileRegistry.set(`${documentId}:v${versionNumber}`, info);
    this.fileRegistry.set(documentId, info);

    return info;
  }

  public getStoredFileInfo(documentId: string, versionNumber?: number): StoredFileInfo | null {
    if (versionNumber) {
      return this.fileRegistry.get(`${documentId}:v${versionNumber}`) || this.fileRegistry.get(documentId) || null;
    }
    return this.fileRegistry.get(documentId) || null;
  }

  public async getFileBufferOrGenerateSample(params: {
    documentId: string;
    projectId?: string;
    title?: string;
    code?: string;
    fileName?: string;
    versionNumber?: number;
  }): Promise<{ buffer: Buffer; mimeType: string; fileName: string; sha256: string }> {
    const { documentId, projectId = 'proj-1', title = 'Документ архива', code = 'РД-2025', fileName = 'document.pdf', versionNumber = 1 } = params;

    const stored = this.getStoredFileInfo(documentId, versionNumber);
    if (stored && fs.existsSync(stored.absolutePath)) {
      const buffer = await fs.promises.readFile(stored.absolutePath);
      return {
        buffer,
        mimeType: stored.mimeType,
        fileName: stored.originalFileName,
        sha256: stored.sha256
      };
    }

    // If file is not in registry (e.g. initial seed mock), generate an authentic sample binary PDF/Text so download works seamlessly
    const ext = path.extname(fileName).toLowerCase() || '.pdf';
    const mimeType = this.mimeMap[ext] || 'application/pdf';

    let buffer: Buffer;
    if (ext === '.pdf') {
      // Create valid minimal PDF representation containing document metadata
      const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 180 >>
stream
BT
/F1 18 Tf
50 720 Td
(SK-KIT Electronic Archive Document) Tj
/F1 12 Tf
50 690 Td
(Code: ${code}) Tj
50 670 Td
(Title: ${title}) Tj
50 650 Td
(Project: ${projectId}) Tj
50 630 Td
(Generated: ${new Date().toISOString()}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000234 00000 n 
0000000465 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
538
%%EOF`;
      buffer = Buffer.from(pdfContent, 'utf-8');
    } else {
      const textHeader = `СК-КИТ ЭЛЕКТРОННЫЙ АРХИВ\nШифр: ${code}\nНаименование: ${title}\nПроект: ${projectId}\nДата: ${new Date().toISOString()}\nФайл: ${fileName}\n`;
      buffer = Buffer.from(textHeader, 'utf-8');
    }

    const sha256 = this.calculateSha256(buffer);
    return {
      buffer,
      mimeType,
      fileName,
      sha256
    };
  }
}

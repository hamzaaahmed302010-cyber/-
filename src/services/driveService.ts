import type { AppData } from '../types';

const BACKUP_FILENAME = 'بيتي_وحياتي_نسخة_احتياطية.json';

export interface DriveFileInfo {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
}

/**
 * Searches for existing backup file created by this app in user's Google Drive
 */
export async function findDriveBackupFile(accessToken: string): Promise<DriveFileInfo | null> {
  const query = encodeURIComponent(`name = '${BACKUP_FILENAME}' and trashed = false`);
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size)&spaces=drive`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`تعذر الاتصال بـ Google Drive: ${errorText}`);
  }

  const result = await response.json();
  if (result.files && result.files.length > 0) {
    return result.files[0];
  }
  return null;
}

/**
 * Lists all backup files in Google Drive
 */
export async function listDriveBackups(accessToken: string): Promise<DriveFileInfo[]> {
  const query = encodeURIComponent(`name contains 'بيتي_وحياتي' and trashed = false`);
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size)&orderBy=modifiedTime desc`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`تعذر جلب ملفات النسخ الاحتياطي: ${errorText}`);
  }

  const result = await response.json();
  return result.files || [];
}

/**
 * Saves or updates application backup data in Google Drive
 */
export async function saveBackupToDrive(
  data: AppData,
  accessToken: string
): Promise<{ fileId: string; modifiedTime: string }> {
  const existingFile = await findDriveBackupFile(accessToken);

  const payload: AppData = {
    ...data,
    lastBackupDate: new Date().toISOString(),
  };

  const fileMetadata = {
    name: BACKUP_FILENAME,
    mimeType: 'application/json',
    description: 'نسخة احتياطية لبيانات تطبيق بيتي وحياتي (الخزين، الميزانية، الأولاد، الصلوات، العادات، والمذكرات)',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(fileMetadata) +
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(payload, null, 2) +
    closeDelimiter;

  let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
  let method = 'POST';

  if (existingFile) {
    url = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`;
    method = 'PATCH';
  }

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`فشل رفع النسخة الاحتياطية إلى Google Drive: ${errorText}`);
  }

  const uploadedFile = await response.json();
  return {
    fileId: uploadedFile.id,
    modifiedTime: uploadedFile.modifiedTime || new Date().toISOString(),
  };
}

/**
 * Downloads and restores application backup data from Google Drive
 */
export async function restoreBackupFromDrive(
  fileId: string,
  accessToken: string
): Promise<AppData> {
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`تعذر استرجاع ملف النسخة الاحتياطية من Google Drive: ${errorText}`);
  }

  const rawData = await response.json();

  if (!rawData.pantry || !rawData.budget) {
    throw new Error('ملف النسخة الاحتياطية غير صالح أو ناقص البيانات الأساسية.');
  }

  return rawData as AppData;
}

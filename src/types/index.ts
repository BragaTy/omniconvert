export type FileCategory = 'image' | 'document' | 'data' | 'audio' | 'archive' | 'other';

export interface FormatOption {
  extension: string;
  label: string;
  mimeType: string;
  category: FileCategory;
  description: string;
}

export interface ConversionOptions {
  // Image options
  imageQuality?: number; // 0.1 to 1.0
  imageWidth?: number;
  imageHeight?: number;
  maintainAspectRatio?: boolean;
  grayscale?: boolean;
  backgroundColor?: string; // e.g. '#ffffff' for transparent png to jpg

  // PDF options
  pdfOrientation?: 'portrait' | 'landscape';
  pdfPageSize?: 'a4' | 'letter';
  pdfMargin?: number;

  // Data / Text options
  csvDelimiter?: string;
  jsonIndent?: number;
  yamlIndent?: number;
  
  // Audio options
  audioSampleRate?: number;
  audioChannels?: 1 | 2;
}

export type ConversionStatus = 'idle' | 'converting' | 'success' | 'error';

export interface FileItem {
  id: string;
  file: File;
  name: string;
  size: number;
  extension: string;
  category: FileCategory;
  targetFormat: string;
  status: ConversionStatus;
  progress: number;
  resultBlob?: Blob;
  resultUrl?: string;
  resultName?: string;
  resultSize?: number;
  errorMessage?: string;
  previewUrl?: string;
  options: ConversionOptions;
}

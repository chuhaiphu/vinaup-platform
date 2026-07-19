export class UploadImageResponse {
  filename!: string;
  originalName!: string;
  mimetype!: string;
  size!: number;
  width?: number;
  height?: number;
  url!: string;
  path!: string;
  uploadedAt!: string;
}

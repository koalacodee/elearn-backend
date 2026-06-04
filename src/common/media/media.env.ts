import { registerAs } from '@nestjs/config';

const DEFAULT_MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export default registerAs('media', () => ({
  maxVideoBytes: parseInt(
    process.env.MEDIA_MAX_UPLOAD_BYTES ?? String(DEFAULT_MAX_UPLOAD_BYTES),
    10,
  ),
}));

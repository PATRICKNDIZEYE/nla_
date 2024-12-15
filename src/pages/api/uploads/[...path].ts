import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path: filePath } = req.query;
  
  if (!filePath || !Array.isArray(filePath)) {
    return res.status(400).json({ message: 'Invalid file path' });
  }

  const fullPath = path.join(process.cwd(), 'public', 'uploads', ...filePath);

  try {
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    const fileContent = fs.readFileSync(fullPath);
    const contentType = path.extname(fullPath).toLowerCase() === '.pdf' 
      ? 'application/pdf'
      : path.extname(fullPath).toLowerCase() === '.doc' || path.extname(fullPath).toLowerCase() === '.docx'
        ? 'application/msword'
        : 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${path.basename(fullPath)}"`);
    return res.send(fileContent);
  } catch (error) {
    console.error('Error serving file:', error);
    return res.status(500).json({ message: 'Error serving file' });
  }
} 
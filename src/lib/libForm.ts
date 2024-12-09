import type { NextApiRequest } from "next";
import amime from "mime";
import { join } from "path";
import formidable from "formidable";
import { mkdir, stat } from "fs/promises";
import fs from "fs";

export const mime = amime;

export const parseForm = async (
  req: NextApiRequest
): Promise<{
  fields: formidable.Fields;
  files: formidable.Files;
}> => {
  return await new Promise(async (resolve, reject) => {
    const uploadDir = join(
      process.env.ROOT_DIR || process.cwd(),
      `/public/uploads`
    );
    try {
      await stat(uploadDir);
    } catch (e: any) {
      if (e.code === "ENOENT") {
        await mkdir(uploadDir, { recursive: true });
      } else {
        console.error(e);
        reject(e);
        return;
      }
    }

    const form = formidable({
      multiples: false,
      maxFiles: 10,
      maxFileSize: 50 * 1024 * 1024,
      uploadDir,
      filename: (_name, _ext, part) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filename = `${part.name || "unknown"}-${uniqueSuffix}.${
          mime.getExtension(part.mimetype || "") || "unknown"
        }`;
        return filename;
      },
    //   filter: (part) => {
    //     return (
    //       part.name === "media"
    //       //  && (part.mimetype?.includes('image') || false)
    //     );
    //   },
    });

    form.parse(req, function (err, fields, files) {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
};

export default function removeFile(filePath: string | string[]) {
  try {
    if (Array.isArray(filePath)) {
      for (let i = 0; i < filePath.length; i += 1) {
        fs.unlinkSync(`public/${filePath[0]}`);
      }
    } else {
      fs.unlinkSync(`public/${filePath}`);
    }
  } catch (error: any) {
    console.error(error?.message);
  }
}

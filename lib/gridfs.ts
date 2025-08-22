/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from "mongoose";
import { GridFSBucket } from "mongodb";

let gridFSBucket: GridFSBucket;

export const initGridFS = () => {
  if (!gridFSBucket) {
    if (!mongoose.connection.db) {
      throw new Error("Mongoose connection is not ready.");
    }
    gridFSBucket = new mongoose.mongo.GridFSBucket(
      mongoose.connection.db as any,
      {
        bucketName: "uploads",
      }
    );
  }

  return { gridFSBucket };
};

export const uploadToGridFS = async (file: Express.Multer.File) => {
  const { gridFSBucket } = initGridFS();

  const uploadStream = gridFSBucket.openUploadStream(file.originalname, {
    metadata: {
      contentType: file.mimetype,
      size: file.size,
    },
  });

  return new Promise((resolve, reject) => {
    uploadStream.write(file.buffer);
    uploadStream.end((error: any) => {
      if (error) {
        reject(error);
      } else {
        resolve({
          id: uploadStream.id,
          filename: file.originalname,
          contentType: file.mimetype,
          size: file.size,
        });
      }
    });
  });
};

export const getFileFromGridFS = async (fileId: string) => {
  const { gridFSBucket } = initGridFS();

  try {
    const downloadStream = gridFSBucket.openDownloadStream(
      new mongoose.Types.ObjectId(fileId)
    );

    return new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      downloadStream.on("data", (chunk) => chunks.push(chunk));
      downloadStream.on("end", () => resolve(Buffer.concat(chunks)));
      downloadStream.on("error", reject);
    });
  } catch (error) {
    throw new Error("File not found");
  }
};

export const deleteFileFromGridFS = async (fileId: string) => {
  const { gridFSBucket } = initGridFS();

  try {
    await gridFSBucket.delete(new mongoose.Types.ObjectId(fileId));
  } catch (error) {
    throw new Error("Failed to delete file");
  }
};

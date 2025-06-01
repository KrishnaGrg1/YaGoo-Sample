import { Request, Response } from 'express';

/**
 * Handles profile image upload.
 * Responds with file information if upload was successful,
 * otherwise returns an error if no file was uploaded.
 * 
 * @param req - Express request object, expects multer file in req.file
 * @param res - Express response object
 */
export const handleProfileUpload = (req: Request, res: Response) => {
  // Check if file was uploaded
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  // Return success response with file details
  res.json({
    message: 'File uploaded successfully.',
    filePath: req.file.path,
    fileName: req.file.filename,
  });
};

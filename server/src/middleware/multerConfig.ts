import multer from 'multer';
import fs from 'fs';

// Create directory if it doesn't exist
const ensureDirExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Maps file field names to their respective upload directories.
 */
const getUploadPath = (fieldname: string): string | null => {
  switch (fieldname) {
    case 'licensePhoto':
      return './public/assets/documents/license';
    case 'citizenshipPhoto':
      return './public/assets/documents/citizenship';
    case 'vehiclePhoto':
      return './public/assets/documents/vehicle';
    case 'vehicleNumberPlatePhoto':
      return './public/assets/documents/numberPlate';
    case 'vehicleBlueBookPhoto':
      return './public/assets/documents/blueBook';
    default:
      return null;
  }
};

const storage = multer.diskStorage({
  /**
   * Determines the destination folder based on the file's field name.
   * Creates the directory if it does not exist.
   */
  destination: (req, file, cb) => {
    const uploadPath = getUploadPath(file.fieldname);
    if (!uploadPath) {
      return cb(new Error('Unknown upload field name'), '');
    }
    ensureDirExists(uploadPath);
    cb(null, uploadPath);
  },

  /**
   * Generates a unique filename to avoid collisions.
   * Original filename is sanitized by replacing spaces with underscores and lowercased.
   */
  filename: (req, file, cb) => {
    const safeOriginalName = file.originalname.replace(/\s+/g, '_').toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}-${safeOriginalName}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max file size
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and JPG files are allowed.'));
    }
  },
});

export default upload;

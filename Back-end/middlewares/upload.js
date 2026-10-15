const multer = require('multer');
const path = require('path');
const fs = require('fs');

const getUploadDir = (folder) => {
  const baseDir = process.env.VERCEL ? path.join('/tmp', folder) : path.join('uploads', folder);
  if (!fs.existsSync(baseDir)) {
    try {
      fs.mkdirSync(baseDir, { recursive: true });
    } catch (e) {
      // ignore
    }
  }
  return baseDir;
};

// Storage for Complaints
const complaintStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, getUploadDir('complaints'));
  },
  filename: function (req, file, cb) {
    cb(null, 'complaint-' + Date.now() + path.extname(file.originalname));
  }
});

// Storage for Profiles
const profileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, getUploadDir('profiles'));
  },
  filename: function (req, file, cb) {
    cb(null, 'profile-' + Date.now() + path.extname(file.originalname));
  }
});

const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and WEBP images are allowed.'), false);
  }
};

const uploadComplaintImages = multer({
  storage: complaintStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
}).array('images', 5);

const uploadProfileImage = multer({
  storage: profileStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB
}).single('profileImage');

const handleComplaintUpload = (req, res, next) => {
  uploadComplaintImages(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_COUNT') return res.status(400).json({ success: false, message: 'Maximum 5 images allowed.' });
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, message: 'Each image must be under 5 MB.' });
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err) return res.status(400).json({ success: false, message: err.message });
    
    // Normalize paths to use forward slashes so they work everywhere
    if (req.files && req.files.length > 0) {
      req.files.forEach(f => {
        f.path = f.path.replace(/\\/g, '/');
      });
    }
    next();
  });
};

const handleProfileUpload = (req, res, next) => {
  uploadProfileImage(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message });
    if (req.file) {
      req.file.path = req.file.path.replace(/\\/g, '/');
    }
    next();
  });
};

module.exports = { handleComplaintUpload, handleProfileUpload };

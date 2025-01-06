// import multer from 'multer'
// import path from 'path'

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/profile-pics'); // Define your upload directory
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// })

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only JPEG, PNG, and JPG files are allowed'), false);
//   }
// }

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
// });

// export default upload;

import multer from "multer";

const storage = multer.diskStorage({ 
  filename: function(req, file, callback) {
    callback(null, file.originalname)
  }
})

const upload = multer({ storage, dest: 'uploads/' })

export default upload
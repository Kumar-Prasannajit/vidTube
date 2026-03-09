import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) { //specify the destination directory where the uploaded files will be stored
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); //generating unique suffix for file name example: 1623456789012-123456789
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
})

export const upload = multer({ storage: storage }); //multer instance with the defined storage configuration
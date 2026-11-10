import multer from "multer";

const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export const uploadDocument = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 1,
    },

    fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            return cb(
                new Error("Only PDF, DOCX, and TXT files are allowed")
            );
        }

        cb(null, true);
    },
}).single("file");

import { Router } from "express";
import { authenticate } from "../../../middleware/authenticate.js";
import { authorizePermissions } from "../../../middleware/authorize.js";
import { uploadDocument } from "../../../middleware/upload.js";
import { askController, deleteDocumentController, listDocumentsController, uploadDocumentController } from "../controller/rag.controller.js";


const router = Router();

router.post(
    "/documents/upload",
    authenticate,
    authorizePermissions("fake_news:documents:upload"),
    uploadDocument,
    uploadDocumentController
);



router.get(
    "/documents",
    authenticate,
    authorizePermissions("fake_news:documents:read"),
    listDocumentsController
);

router.delete(
    "/documents/:id",
    authenticate,
    authorizePermissions("fake_news:documents:delete"),
    deleteDocumentController
);

router.post(
    "/ask",
    authenticate,
    authorizePermissions("fake_news:ask"),
    askController
);

export default router;

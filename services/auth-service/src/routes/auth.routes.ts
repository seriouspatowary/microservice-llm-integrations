import { Router } from "express";
import { login, register, refreshController, logoutController} from "../controllers/auth.controller.js";
import { meController } from "../controllers/meController.controller.js";
import { authenticate } from "../middleware/authentication.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshController);
router.get("/me", authenticate, meController);

router.get("/logout", logoutController);


export default router;
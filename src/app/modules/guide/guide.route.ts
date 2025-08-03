import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { GuideController } from "./guide.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createGuideZodSchema, updateGuideZodSchema } from "./guide.validation";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.post(
  "/apply",
  checkAuth(Role.USER),
  multerUpload.single("file"),
  validateRequest(createGuideZodSchema),
  GuideController.createGuide
);
router.post(
  "/approve/:id",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateGuideZodSchema),
  GuideController.approveGuide
);

router.get("/:id", checkAuth(...Object.values(Role)), GuideController.getSingleGuide);
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  GuideController.getGuide
);

export const GuideRoutes = router;

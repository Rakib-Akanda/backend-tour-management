import { Router } from "express";
import { UserController } from "./user.cntroller";

const router = Router();
router.post("/register", UserController.createUser);
router.get("/all-users", UserController.getAllUsers);

const UserRoutes = router;
export default UserRoutes;

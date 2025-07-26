import { Router } from "express";
import { PaymentController } from "./payment.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
const router = Router();

router.post("/init-payment/:bookingId", PaymentController.initPayment); // eta extra ekta api jodi kuno karone payment fail ba cancel hoi tobe oi bookingId die abar payment korte parbe
router.post("/success", PaymentController.successPayment);
router.post("/fail", PaymentController.failPayment);
router.post("/cancel", PaymentController.cancelPayment);
router.get(
  "/invoice/:paymentId",
  checkAuth(...Object.values(Role)),
  PaymentController.getInvoiceDownloadUrl
);
export const PaymentRoutes = router;

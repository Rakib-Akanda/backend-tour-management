"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoutes = void 0;
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const router = (0, express_1.Router)();
router.post("/init-payment/:bookingId", payment_controller_1.PaymentController.initPayment); // eta extra ekta api jodi kuno karone payment fail ba cancel hoi tobe oi bookingId die abar payment korte parbe
router.post("/success", payment_controller_1.PaymentController.successPayment);
router.post("/fail", payment_controller_1.PaymentController.failPayment);
router.post("/cancel", payment_controller_1.PaymentController.cancelPayment);
exports.PaymentRoutes = router;

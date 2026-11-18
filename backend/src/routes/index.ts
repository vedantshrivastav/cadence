import { Router } from "express";
import { requireAdmin, requireAuth, requireVerifiedPhone } from "../middleware/auth.js";
import { validateBody as v } from "../middleware/validate.js";
import { devLoginEnabled } from "../config/env.js";
import * as S from "../validators/schemas.js";
import * as auth from "../controllers/auth.controller.js";
import * as pay from "../controllers/payment.controller.js";
import * as cls from "../controllers/class.controller.js";
import * as content from "../controllers/content.controller.js";
import * as admin from "../controllers/admin.controller.js";

export const api = Router();

// ---------- Public ----------
api.post("/auth/google", v(S.googleLoginSchema), auth.googleLogin);
if (devLoginEnabled) {
  api.post("/auth/dev-login", v(S.devLoginSchema), auth.devLogin);
  console.warn("⚠ DEV LOGIN ENABLED — POST /api/auth/dev-login (never enable in production)");
}
api.get("/plans", cls.listPlans);
api.get("/batches", cls.listBatches);

// ---------- Logged in (phone may not be verified yet) ----------
api.use(requireAuth);

api.get("/auth/me", auth.me);
api.patch("/auth/me", v(S.updateProfileSchema), auth.updateProfile);
api.post("/auth/verify-phone", v(S.verifyPhoneSchema), auth.verifyPhone);

// ---------- Everything below needs a verified phone (students) ----------
api.use(requireVerifiedPhone);

api.post("/payments/orders", v(S.createOrderSchema), pay.createPaymentOrder);
api.post("/payments/verify", v(S.verifyPaymentSchema), pay.verifyPayment);
api.get("/payments/me", pay.myPayments);

api.get("/classes/me", cls.myClasses);
api.post("/classes/:batchId/join", cls.joinClass);
api.get("/attendance/me", cls.myAttendance);

api.get("/announcements", content.listAnnouncements);
api.get("/resources", content.listResources);

// ---------- Admin ----------
const a = Router();
a.use(requireAdmin);

a.get("/dashboard", admin.dashboard);

a.get("/plans", admin.listAllPlans);
a.post("/plans", v(S.planSchema), admin.createPlan);
a.patch("/plans/:id", v(S.planSchema.partial()), admin.updatePlan);

a.get("/batches", admin.listAllBatches);
a.post("/batches", v(S.batchSchema), admin.createBatch);
a.patch("/batches/:id", v(S.batchSchema.partial()), admin.updateBatch);
a.delete("/batches/:id", admin.deleteBatch);
a.get("/batches/:id/attendance", admin.batchAttendance);

a.get("/students", admin.listStudents);
a.patch("/students/:id/status", admin.setStudentActive);

a.post("/subscriptions", v(S.grantSubscriptionSchema), admin.grantSubscriptionManually);
a.patch("/subscriptions/:id/batch", v(S.assignBatchSchema), admin.assignBatch);
a.post("/subscriptions/:id/cancel", admin.cancelSubscription);

a.get("/existing-students", admin.listExistingStudents);
a.post("/existing-students", v(S.existingStudentSchema), admin.addExistingStudent);
a.post("/existing-students/import", v(S.importExistingStudentsSchema), admin.importExistingStudents);
a.delete("/existing-students/:id", admin.deleteExistingStudent);

a.get("/payments", admin.listPayments);

a.post("/announcements", v(S.announcementSchema), admin.createAnnouncement);
a.patch("/announcements/:id", v(S.announcementSchema.partial()), admin.updateAnnouncement);
a.delete("/announcements/:id", admin.deleteAnnouncement);

a.get("/resources", admin.listAllResources);
a.post("/resources", v(S.resourceSchema), admin.createResource);
a.delete("/resources/:id", admin.deleteResource);

api.use("/admin", a);

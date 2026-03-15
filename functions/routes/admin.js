/**
 * =========================================================================
 * routes/admin.js — Endpoints administrativos
 * =========================================================================
 */

const express = require("express");
const router = express.Router();
const { admin, db } = require("../config");
const { requireAuth } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");
const { logError } = require("../middleware/logger");

// ===================== VALIDATION HELPERS =====================

function validateCPF(cpf) {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleaned)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cleaned[i]) * (10 - i);
  let check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  if (parseInt(cleaned[9]) !== check) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cleaned[i]) * (11 - i);
  check = 11 - (sum % 11);
  if (check >= 10) check = 0;
  return parseInt(cleaned[10]) === check;
}

function validateEmail(email) {
  if (!email || email.length > 255) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 11;
}

function validateName(name) {
  return name && name.trim().length >= 2 && name.trim().length <= 100;
}

function validatePassword(password) {
  return password && password.length >= 6 && password.length <= 128;
}

// ===================== ADMIN ACTION LOG =====================

async function logAdminAction(req, action, details = {}) {
  try {
    await db.collection("logs").add({
      type: "admin_action",
      action,
      endpoint: req.originalUrl || req.path,
      method: req.method,
      uid: req.uid || null,
      timestamp: new Date().toISOString(),
      summary: JSON.stringify(details).slice(0, 500),
      ip: req.headers["x-forwarded-for"] || req.ip || "unknown",
    });
  } catch (e) {
    console.error("logAdminAction error:", e.message);
  }
}

// ----- GET /admin/check -----
router.get("/admin/check", requireAuth, async (req, res) => {
  try {
    const doc = await db.collection("admin").doc(req.uid).get();
    return res.status(200).json({ isAdmin: doc.exists && doc.data().isadmin === true });
  } catch (error) {
    console.error("admin/check error:", error);
    await logError(req, error);
    return res.status(500).json({ isAdmin: false });
  }
});

// ----- GET /admin/stats -----
router.get("/admin/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    const usersSnap = await db.collection("professionals").get();
    let activeUsers = 0, pendingUsers = 0, blockedUsers = 0;
    const userDocs = usersSnap.docs;
    for (const doc of userDocs) {
      const d = doc.data();
      if (d.blocked) blockedUsers++;
      else if (d.subscriptionStatus === "active") activeUsers++;
      else pendingUsers++;
    }

    let totalPayments = 0, successPayments = 0, failedPayments = 0, pendingPaymentsCount = 0;
    for (const doc of userDocs) {
      const paymentsSnap = await db.collection("professionals").doc(doc.id).collection("payments").get();
      totalPayments += paymentsSnap.size;
      for (const p of paymentsSnap.docs) {
        const s = p.data().status;
        if (s === "authorized" || s === "active") successPayments++;
        else if (s === "pending") pendingPaymentsCount++;
        else failedPayments++;
      }
    }

    const contactsSnap = await db.collection("contacts").get();
    let unreadContacts = 0;
    for (const doc of contactsSnap.docs) {
      const status = doc.data().status || (doc.data().read ? "responded" : "pending");
      if (status === "pending") unreadContacts++;
    }

    const logsSnap = await db.collection("logs").get();

    const recruitersSnap = await db.collection("recruiters").get();
    let pendingWithdrawals = 0;
    for (const rDoc of recruitersSnap.docs) {
      const wSnap = await db.collection("recruiters").doc(rDoc.id).collection("withdrawals").where("status", "==", "pending").get();
      pendingWithdrawals += wSnap.size;
    }

    // Latest 5 users and recruiters
    const latestUsersSnap = await db.collection("professionals").orderBy("createdAt", "desc").limit(5).get();
    const latestUsers = latestUsersSnap.docs.map((d) => ({ uid: d.id, name: d.data().name, email: d.data().email, createdAt: d.data().createdAt }));

    const latestRecruitersSnap = await db.collection("recruiters").orderBy("createdAt", "desc").limit(5).get();
    const latestRecruiters = latestRecruitersSnap.docs.map((d) => ({ uid: d.id, name: d.data().name, email: d.data().email, approved: d.data().approved, createdAt: d.data().createdAt }));

    return res.status(200).json({
      totalUsers: userDocs.length, activeUsers, pendingUsers, blockedUsers,
      totalPayments, successPayments, failedPayments, pendingPayments: pendingPaymentsCount,
      totalContacts: contactsSnap.size, unreadContacts, totalLogs: logsSnap.size,
      totalRecruiters: recruitersSnap.size, pendingWithdrawals,
      latestUsers, latestRecruiters,
    });
  } catch (error) {
    console.error("admin/stats error:", error);
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- GET /admin/users -----
router.get("/admin/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const countSnap = await db.collection("professionals").count().get();
    const total = countSnap.data().count;
    const totalPages = Math.ceil(total / limit);
    const snap = await db.collection("professionals").orderBy("createdAt", "desc").offset((page - 1) * limit).limit(limit).get();
    const data = snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
    return res.status(200).json({ data, total, page, limit, totalPages });
  } catch (error) {
    console.error("admin/users GET error:", error);
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- POST /admin/users -----
router.post("/admin/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, whatsapp, profession, plan, paymentMethod, paidUntil, nextBillingMonths, birthDate } = req.body;

    if (!validateName(name)) return res.status(400).json({ error: "Nome deve ter entre 2 e 100 caracteres" });
    if (!validateEmail(email)) return res.status(400).json({ error: "E-mail inválido (máx. 255 caracteres)" });
    if (!validatePassword(password)) return res.status(400).json({ error: "Senha deve ter entre 6 e 128 caracteres" });
    if (whatsapp && !validatePhone(whatsapp)) return res.status(400).json({ error: "WhatsApp inválido (10-11 dígitos)" });

    const userRecord = await admin.auth().createUser({ email: email.trim(), password, displayName: name.trim() });

    let paidUntilDate;
    if (paidUntil) {
      paidUntilDate = new Date(paidUntil);
    } else {
      const months = nextBillingMonths || (plan === "6 meses" ? 6 : 1);
      paidUntilDate = new Date();
      paidUntilDate.setMonth(paidUntilDate.getMonth() + months);
    }

    await db.collection("professionals").doc(userRecord.uid).set({
      name: name.trim(), email: email.trim(),
      whatsapp: (whatsapp || "").trim(),
      profession: (profession || "").trim().slice(0, 100),
      plan: plan || "1 mês",
      birthDate: birthDate || null,
      subscriptionStatus: "active",
      about: "",
      photoURL: "",
      socialLinks: { instagram: "", facebook: "", linkedin: "", website: "" },
      paymentMethod: paymentMethod || "pix",
      totalPayments: 1,
      nextBillingMonths: nextBillingMonths || (plan === "6 meses" ? 6 : 1),
      paidUntil: paidUntilDate.toISOString(),
      blocked: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await logAdminAction(req, "user_created", { targetUid: userRecord.uid, email, plan, paymentMethod });
    return res.status(200).json({ ok: true, uid: userRecord.uid });
  } catch (error) {
    console.error("admin/users POST error:", error);
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- PUT /admin/users/:uid -----
router.put("/admin/users/:uid", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const allowedFields = ["name", "whatsapp", "profession", "about", "plan", "subscriptionStatus", "paidUntil", "socialLinks", "paymentMethod", "totalPayments", "nextBillingMonths", "blocked", "photoURL"];
    const updateData = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    // Validate fields if present
    if (req.body.name && !validateName(req.body.name)) return res.status(400).json({ error: "Nome inválido" });
    if (req.body.whatsapp && !validatePhone(req.body.whatsapp)) return res.status(400).json({ error: "WhatsApp inválido" });

    await db.collection("professionals").doc(uid).update(updateData);

    if (req.body.name) {
      try { await admin.auth().updateUser(uid, { displayName: req.body.name }); } catch (e) { /* ignore */ }
    }

    await logAdminAction(req, "user_updated", { targetUid: uid, fields: Object.keys(updateData) });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("admin/users PUT error:", error);
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- POST /admin/users/:uid/photo -----
router.post("/admin/users/:uid/photo", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const { photo, contentType } = req.body;

    if (!photo) return res.status(400).json({ error: "Foto não enviada" });
    if (photo.length > 5 * 1024 * 1024) return res.status(400).json({ error: "Foto muito grande (máx 5MB)" });

    const bucket = admin.storage().bucket();
    const ext = contentType === "image/png" ? "png" : "jpg";
    const filePath = `profile-photos/${uid}.${ext}`;
    const file = bucket.file(filePath);

    const buffer = Buffer.from(photo, "base64");
    await file.save(buffer, {
      metadata: { contentType: contentType || "image/jpeg" },
      public: true,
    });

    const photoURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    await admin.auth().updateUser(uid, { photoURL });
    await db.collection("professionals").doc(uid).update({
      photoURL,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await logAdminAction(req, "user_photo_updated", { targetUid: uid });
    return res.status(200).json({ ok: true, photoURL });
  } catch (error) {
    console.error("admin/users photo error:", error);
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- DELETE /admin/users/:uid -----
router.delete("/admin/users/:uid", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;

    const paymentsSnap = await db.collection("professionals").doc(uid).collection("payments").get();
    const batch = db.batch();
    paymentsSnap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    await db.collection("professionals").doc(uid).delete();

    try {
      await admin.auth().deleteUser(uid);
    } catch (e) {
      console.warn("Auth user delete failed (may not exist):", e.message);
    }

    await logAdminAction(req, "user_deleted", { targetUid: uid });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("admin/users DELETE error:", error);
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- POST /admin/users/:uid/renew -----
router.post("/admin/users/:uid/renew", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const { months, paidUntil, paymentMethod } = req.body;

    const doc = await db.collection("professionals").doc(uid).get();
    if (!doc.exists) return res.status(404).json({ error: "Usuário não encontrado" });

    const data = doc.data();

    let paidUntilDate;
    if (paidUntil) {
      paidUntilDate = new Date(paidUntil);
    } else {
      const renewMonths = months || data.nextBillingMonths || 1;
      paidUntilDate = new Date();
      paidUntilDate.setMonth(paidUntilDate.getMonth() + renewMonths);
    }

    await db.collection("professionals").doc(uid).update({
      subscriptionStatus: "active",
      paidUntil: paidUntilDate.toISOString(),
      totalPayments: (data.totalPayments || 0) + 1,
      paymentMethod: paymentMethod || data.paymentMethod || "pix",
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await db.collection("professionals").doc(uid).collection("payments").add({
      type: "manual_renewal",
      status: "active",
      email: data.email,
      amount: null,
      paymentMethod: paymentMethod || data.paymentMethod || "pix",
      paidAt: new Date().toISOString(),
      paidUntil: paidUntilDate.toISOString(),
      renewedBy: req.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    await logAdminAction(req, "user_renewed", { targetUid: uid, paidUntil: paidUntilDate.toISOString(), paymentMethod });
    return res.status(200).json({ ok: true, paidUntil: paidUntilDate.toISOString() });
  } catch (error) {
    console.error("admin/users renew error:", error);
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- PUT /admin/users/:uid/block -----
router.put("/admin/users/:uid/block", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const doc = await db.collection("professionals").doc(uid).get();
    if (!doc.exists) return res.status(404).json({ error: "Usuário não encontrado" });

    const blocked = !doc.data().blocked;
    await db.collection("professionals").doc(uid).update({
      blocked,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Also disable/enable in Firebase Auth
    try { await admin.auth().updateUser(uid, { disabled: blocked }); } catch (e) { console.warn("Auth disable error:", e.message); }

    await logAdminAction(req, blocked ? "user_blocked" : "user_unblocked", { targetUid: uid });
    return res.status(200).json({ ok: true, blocked });
  } catch (error) {
    console.error("admin/users block error:", error);
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- GET /admin/payments -----
router.get("/admin/payments", requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const usersSnap = await db.collection("professionals").get();
    const payments = [];

    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data();
      const paymentsSnap = await db.collection("professionals").doc(userDoc.id).collection("payments").orderBy("paidAt", "desc").get();

      for (const pDoc of paymentsSnap.docs) {
        const pData = pDoc.data();
        payments.push({
          id: pDoc.id,
          professionalUid: userDoc.id,
          professionalName: userData.name,
          professionalEmail: userData.email,
          ...pData,
          paidAt: pData.paidAt?.toDate?.()?.toISOString?.() || pData.paidAt || null,
        });
      }
    }

    payments.sort((a, b) => (b.paidAt || "").localeCompare(a.paidAt || ""));
    const total = payments.length;
    const totalPages = Math.ceil(total / limit);
    const data = payments.slice((page - 1) * limit, page * limit);
    return res.status(200).json({ data, total, page, limit, totalPages });
  } catch (error) {
    console.error("admin/payments error:", error);
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- GET /admin/logs -----
router.get("/admin/logs", requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

    // Get all logs, sort in-memory (timestamp is a string field, not Firestore timestamp)
    const allSnap = await db.collection("logs").get();
    const allLogs = allSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    allLogs.sort((a, b) => (b.timestamp || "").localeCompare(a.timestamp || ""));

    const total = allLogs.length;
    const totalPages = Math.ceil(total / limit);
    const data = allLogs.slice((page - 1) * limit, page * limit);
    return res.status(200).json({ data, total, page, limit, totalPages });
  } catch (error) {
    console.error("admin/logs error:", error);
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- GET /admin/contacts -----
router.get("/admin/contacts", requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const countSnap = await db.collection("contacts").count().get();
    const total = countSnap.data().count;
    const totalPages = Math.ceil(total / limit);
    const snap = await db.collection("contacts").orderBy("createdAt", "desc").offset((page - 1) * limit).limit(limit).get();
    const data = snap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        ...d,
        // Migrate old boolean read to status
        status: d.status || (d.read ? "responded" : "pending"),
      };
    });
    return res.status(200).json({ data, total, page, limit, totalPages });
  } catch (error) {
    console.error("admin/contacts error:", error);
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- GET /admin/admins -----
router.get("/admin/admins", requireAuth, requireAdmin, async (req, res) => {
  try {
    const snap = await db.collection("admin").where("isadmin", "==", true).get();
    const admins = [];
    for (const doc of snap.docs) {
      let email = "";
      try {
        const userRecord = await admin.auth().getUser(doc.id);
        email = userRecord.email || "";
      } catch { /* user may not exist */ }
      admins.push({ uid: doc.id, email });
    }
    return res.status(200).json(admins);
  } catch (error) {
    console.error("admin/admins GET error:", error);
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- POST /admin/admins -----
router.post("/admin/admins", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "E-mail é obrigatório" });

    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch {
      return res.status(404).json({ error: "Usuário não encontrado com este e-mail" });
    }

    await db.collection("admin").doc(userRecord.uid).set({ isadmin: true }, { merge: true });
    await logAdminAction(req, "admin_added", { targetUid: userRecord.uid, email });
    return res.status(200).json({ ok: true, uid: userRecord.uid });
  } catch (error) {
    console.error("admin/admins POST error:", error);
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- DELETE /admin/admins/:uid -----
router.delete("/admin/admins/:uid", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    if (uid === req.uid) {
      return res.status(400).json({ error: "Você não pode remover a si mesmo" });
    }
    await db.collection("admin").doc(uid).delete();
    await logAdminAction(req, "admin_removed", { targetUid: uid });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("admin/admins DELETE error:", error);
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- PUT /admin/contacts/:id -----
router.put("/admin/contacts/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["pending", "responded", "ignored"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Status inválido. Use: pending, responded ou ignored" });
    }
    await db.collection("contacts").doc(id).update({ status, read: status !== "pending" });
    await logAdminAction(req, "contact_updated", { contactId: id, status });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("admin/contacts PUT error:", error);
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ===================== RECRUITER ADMIN ENDPOINTS =====================

// ----- GET /admin/recruiters -----
router.get("/admin/recruiters", requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const countSnap = await db.collection("recruiters").count().get();
    const total = countSnap.data().count;
    const totalPages = Math.ceil(total / limit);
    const snap = await db.collection("recruiters").orderBy("createdAt", "desc").offset((page - 1) * limit).limit(limit).get();
    const data = snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
    return res.status(200).json({ data, total, page, limit, totalPages });
  } catch (error) {
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- PUT /admin/recruiters/:uid -----
router.put("/admin/recruiters/:uid", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const allowed = ["name", "whatsapp", "profession", "address", "pixKey", "commissionPercent", "blocked", "totalCommission", "availableBalance"];
    const updateData = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    for (const field of allowed) {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    }

    if (req.body.name && !validateName(req.body.name)) return res.status(400).json({ error: "Nome inválido" });
    if (req.body.whatsapp && !validatePhone(req.body.whatsapp)) return res.status(400).json({ error: "WhatsApp inválido" });

    await db.collection("recruiters").doc(uid).update(updateData);
    await logAdminAction(req, "recruiter_updated", { targetUid: uid, fields: Object.keys(updateData) });
    return res.status(200).json({ ok: true });
  } catch (error) {
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- DELETE /admin/recruiters/:uid -----
router.delete("/admin/recruiters/:uid", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const clientsSnap = await db.collection("recruiters").doc(uid).collection("clients").get();
    const withdrawalsSnap = await db.collection("recruiters").doc(uid).collection("withdrawals").get();
    const batch = db.batch();
    clientsSnap.docs.forEach((doc) => batch.delete(doc.ref));
    withdrawalsSnap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    await db.collection("recruiters").doc(uid).delete();
    try { await admin.auth().deleteUser(uid); } catch (e) { /* ignore */ }
    await logAdminAction(req, "recruiter_deleted", { targetUid: uid });
    return res.status(200).json({ ok: true });
  } catch (error) {
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- PUT /admin/recruiters/:uid/approve -----
router.put("/admin/recruiters/:uid/approve", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const doc = await db.collection("recruiters").doc(uid).get();
    if (!doc.exists) return res.status(404).json({ error: "Recrutador não encontrado" });
    const approved = !doc.data().approved;
    await db.collection("recruiters").doc(uid).update({ approved, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    await logAdminAction(req, approved ? "recruiter_approved" : "recruiter_unapproved", { targetUid: uid });
    return res.status(200).json({ ok: true, approved });
  } catch (error) {
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- PUT /admin/recruiters/:uid/block -----
router.put("/admin/recruiters/:uid/block", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const doc = await db.collection("recruiters").doc(uid).get();
    if (!doc.exists) return res.status(404).json({ error: "Recrutador não encontrado" });
    const blocked = !doc.data().blocked;
    await db.collection("recruiters").doc(uid).update({ blocked, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

    // Also disable/enable in Firebase Auth
    try { await admin.auth().updateUser(uid, { disabled: blocked }); } catch (e) { console.warn("Auth disable error:", e.message); }

    await logAdminAction(req, blocked ? "recruiter_blocked" : "recruiter_unblocked", { targetUid: uid });
    return res.status(200).json({ ok: true, blocked });
  } catch (error) {
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- GET /admin/recruiters/:uid/clients -----
router.get("/admin/recruiters/:uid/clients", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const snap = await db.collection("recruiters").doc(uid).collection("clients").orderBy("createdAt", "desc").get();
    const clients = snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
    return res.status(200).json(clients);
  } catch (error) {
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- POST /admin/recruiters/:uid/photo -----
router.post("/admin/recruiters/:uid/photo", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const { photo, contentType } = req.body;
    if (!photo) return res.status(400).json({ error: "Foto não enviada" });
    if (photo.length > 5 * 1024 * 1024) return res.status(400).json({ error: "Foto muito grande (máx 5MB)" });

    const bucket = admin.storage().bucket();
    const ext = contentType === "image/png" ? "png" : "jpg";
    const filePath = `recruiter-photos/${uid}.${ext}`;
    const file = bucket.file(filePath);
    const buffer = Buffer.from(photo, "base64");
    await file.save(buffer, { metadata: { contentType: contentType || "image/jpeg" }, public: true });
    const photoURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

    await admin.auth().updateUser(uid, { photoURL });
    await db.collection("recruiters").doc(uid).update({ photoURL, updatedAt: admin.firestore.FieldValue.serverTimestamp() });

    await logAdminAction(req, "recruiter_photo_updated", { targetUid: uid });
    return res.status(200).json({ ok: true, photoURL });
  } catch (error) {
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ===================== WITHDRAWAL ADMIN ENDPOINTS =====================

// ----- GET /admin/withdrawals -----
router.get("/admin/withdrawals", requireAuth, requireAdmin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const recruitersSnap = await db.collection("recruiters").get();
    const withdrawals = [];
    for (const rDoc of recruitersSnap.docs) {
      const rData = rDoc.data();
      const wSnap = await db.collection("recruiters").doc(rDoc.id).collection("withdrawals").orderBy("requestedAt", "desc").get();
      for (const wDoc of wSnap.docs) {
        withdrawals.push({
          id: wDoc.id,
          recruiterUid: rDoc.id,
          recruiterName: rData.name,
          recruiterEmail: rData.email,
          recruiterPixKey: rData.pixKey,
          ...wDoc.data(),
        });
      }
    }
    withdrawals.sort((a, b) => (b.requestedAt || "").localeCompare(a.requestedAt || ""));
    const total = withdrawals.length;
    const totalPages = Math.ceil(total / limit);
    const data = withdrawals.slice((page - 1) * limit, page * limit);
    return res.status(200).json({ data, total, page, limit, totalPages });
  } catch (error) {
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- PUT /admin/withdrawals/:recruiterUid/:id -----
router.put("/admin/withdrawals/:recruiterUid/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { recruiterUid, id } = req.params;
    const { status, receipt, receiptContentType } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Status inválido" });
    }

    const updateData = {
      status,
      processedAt: new Date().toISOString(),
      processedBy: req.uid,
    };

    if (status === "approved" && receipt) {
      const bucket = admin.storage().bucket();
      const ext = receiptContentType === "image/png" ? "png" : "jpg";
      const filePath = `withdrawal-receipts/${recruiterUid}_${id}.${ext}`;
      const file = bucket.file(filePath);
      const buffer = Buffer.from(receipt, "base64");
      await file.save(buffer, { metadata: { contentType: receiptContentType || "image/jpeg" }, public: true });
      updateData.receiptURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    }

    await db.collection("recruiters").doc(recruiterUid).collection("withdrawals").doc(id).update(updateData);

    if (status === "rejected") {
      const wDoc = await db.collection("recruiters").doc(recruiterUid).collection("withdrawals").doc(id).get();
      const amount = wDoc.data().amount || 0;
      await db.collection("recruiters").doc(recruiterUid).update({
        availableBalance: admin.firestore.FieldValue.increment(amount),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await logAdminAction(req, `withdrawal_${status}`, { recruiterUid, withdrawalId: id });
    return res.status(200).json({ ok: true });
  } catch (error) {
    await logError(req, error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;

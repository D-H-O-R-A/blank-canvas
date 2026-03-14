/**
 * =========================================================================
 * routes/admin.js — Endpoints administrativos
 * =========================================================================
 *
 * Todas as rotas exigem JWT + verificação de admin (doc admin/{uid}.isAdmin).
 * Exceção: GET /admin/check exige apenas JWT.
 *
 * GET /admin/check
 *   Verifica se o usuário é admin. Retorna: { isAdmin: boolean }
 *
 * GET /admin/stats
 *   Contadores gerais do sistema (usuários, pagamentos, contatos, logs).
 *
 * GET /admin/users
 *   Lista todos os profissionais cadastrados.
 *
 * POST /admin/users
 *   Cria novo profissional (admin cria conta + perfil).
 *   Body: { name, email, password, whatsapp?, profession?, plan? }
 *
 * PUT /admin/users/:uid
 *   Atualiza dados de qualquer profissional.
 *   Body: { name?, whatsapp?, profession?, about?, plan?, subscriptionStatus?, paidUntil?, socialLinks? }
 *
 * GET /admin/payments
 *   Lista todos os pagamentos de todos os profissionais.
 *
 * GET /admin/logs
 *   Lista últimos 500 logs internos.
 *
 * GET /admin/contacts
 *   Lista todos os formulários de contato.
 *
 * PUT /admin/contacts/:id
 *   Marca contato como lido/não lido. Body: { read: boolean }
 * =========================================================================
 */

const express = require("express");
const router = express.Router();
const { admin, db } = require("../config");
const { requireAuth } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");

// ----- GET /admin/check -----
router.get("/admin/check", requireAuth, async (req, res) => {
  try {
    const doc = await db.collection("admin").doc(req.uid).get();
    return res.status(200).json({ isAdmin: doc.exists && doc.data().isadmin === true });
  } catch (error) {
    console.error("admin/check error:", error);
    return res.status(500).json({ isAdmin: false });
  }
});

// ----- GET /admin/stats -----
router.get("/admin/stats", requireAuth, requireAdmin, async (req, res) => {
  try {
    const usersSnap = await db.collection("professionals").get();
    let activeUsers = 0;
    let pendingUsers = 0;
    const userDocs = usersSnap.docs;
    for (const doc of userDocs) {
      const d = doc.data();
      if (d.subscriptionStatus === "active") activeUsers++;
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
      if (!doc.data().read) unreadContacts++;
    }

    const logsSnap = await db.collection("logs").get();

    return res.status(200).json({
      totalUsers: userDocs.length,
      activeUsers,
      pendingUsers,
      totalPayments,
      successPayments,
      failedPayments,
      pendingPayments: pendingPaymentsCount,
      totalContacts: contactsSnap.size,
      unreadContacts,
      totalLogs: logsSnap.size,
    });
  } catch (error) {
    console.error("admin/stats error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- GET /admin/users -----
router.get("/admin/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const snap = await db.collection("professionals").orderBy("createdAt", "desc").get();
    const users = snap.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
    return res.status(200).json(users);
  } catch (error) {
    console.error("admin/users GET error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- POST /admin/users -----
router.post("/admin/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, whatsapp, profession, plan } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Nome, e-mail e senha são obrigatórios" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Senha deve ter pelo menos 6 caracteres" });
    }

    const userRecord = await admin.auth().createUser({ email, password, displayName: name });

    await db.collection("professionals").doc(userRecord.uid).set({
      name,
      email,
      whatsapp: whatsapp || "",
      profession: profession || "",
      plan: plan || "1 mês",
      subscriptionStatus: "pending",
      about: "",
      socialLinks: { instagram: "", facebook: "", linkedin: "", website: "" },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.status(200).json({ ok: true, uid: userRecord.uid });
  } catch (error) {
    console.error("admin/users POST error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- PUT /admin/users/:uid -----
router.put("/admin/users/:uid", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { uid } = req.params;
    const allowedFields = ["name", "whatsapp", "profession", "about", "plan", "subscriptionStatus", "paidUntil", "socialLinks"];
    const updateData = { updatedAt: admin.firestore.FieldValue.serverTimestamp() };

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    }

    await db.collection("professionals").doc(uid).update(updateData);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("admin/users PUT error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- GET /admin/payments -----
router.get("/admin/payments", requireAuth, requireAdmin, async (req, res) => {
  try {
    const usersSnap = await db.collection("professionals").get();
    const payments = [];

    for (const userDoc of usersSnap.docs) {
      const userData = userDoc.data();
      const paymentsSnap = await db
        .collection("professionals")
        .doc(userDoc.id)
        .collection("payments")
        .orderBy("paidAt", "desc")
        .get();

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
    return res.status(200).json(payments);
  } catch (error) {
    console.error("admin/payments error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- GET /admin/logs -----
router.get("/admin/logs", requireAuth, requireAdmin, async (req, res) => {
  try {
    const snap = await db.collection("logs").orderBy("timestamp", "desc").limit(500).get();
    const logs = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(logs);
  } catch (error) {
    console.error("admin/logs error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- GET /admin/contacts -----
router.get("/admin/contacts", requireAuth, requireAdmin, async (req, res) => {
  try {
    const snap = await db.collection("contacts").orderBy("createdAt", "desc").get();
    const contacts = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.status(200).json(contacts);
  } catch (error) {
    console.error("admin/contacts error:", error);
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

    await db.collection("admin").doc(userRecord.uid).set({ isAdmin: true }, { merge: true });
    return res.status(200).json({ ok: true, uid: userRecord.uid });
  } catch (error) {
    console.error("admin/admins POST error:", error);
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
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("admin/admins DELETE error:", error);
    return res.status(500).json({ error: error.message });
  }
});

// ----- PUT /admin/contacts/:id -----
router.put("/admin/contacts/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { read } = req.body;
    await db.collection("contacts").doc(id).update({ read: !!read });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("admin/contacts PUT error:", error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;

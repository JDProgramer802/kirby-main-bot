-- 🗄️ Kirby Dream Bot - Database Schema
-- PostgreSQL Schema for WhatsApp Bot

-- 📊 Users Table
CREATE TABLE IF NOT EXISTS usuarios (
    jid VARCHAR(255) PRIMARY KEY,
    nombre VARCHAR(255),
    nivel INTEGER DEFAULT 1,
    experiencia INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 500,
    bio TEXT,
    genero VARCHAR(50),
    cumpleaños DATE,
    pareja VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🏠 Groups Table
CREATE TABLE IF NOT EXISTS grupos (
    jid VARCHAR(255) PRIMARY KEY,
    nombre VARCHAR(255),
    descripcion TEXT,
    welcome BOOLEAN DEFAULT false,
    goodbye BOOLEAN DEFAULT false,
    banner_welcome TEXT,
    banner_goodbye TEXT,
    banner_menu TEXT,
    antilink BOOLEAN DEFAULT false,
    nsfw BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 💰 Economy Table
CREATE TABLE IF NOT EXISTS economia (
    id SERIAL PRIMARY KEY,
    user_jid VARCHAR(255) REFERENCES usuarios(jid),
    amount INTEGER NOT NULL,
    type VARCHAR(50), -- 'work', 'daily', 'buy', 'sell'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🤖 Subbots Table
CREATE TABLE IF NOT EXISTS subbots (
    jid VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    owner VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    banner TEXT,
    currency VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🎮 Gacha/Mascotas Table
CREATE TABLE IF NOT EXISTS mascotas (
    id SERIAL PRIMARY KEY,
    user_jid VARCHAR(255) REFERENCES usuarios(jid),
    character_name VARCHAR(255),
    character_id VARCHAR(255),
    series VARCHAR(255),
    image_url TEXT,
    rarity VARCHAR(50),
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🎨 Stickers Packs Table
CREATE TABLE IF NOT EXISTS sticker_packs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    owner VARCHAR(255),
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🎨 Stickers Table
CREATE TABLE IF NOT EXISTS stickers (
    id SERIAL PRIMARY KEY,
    pack_id INTEGER REFERENCES sticker_packs(id),
    name VARCHAR(255),
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ⚠️ Warnings Table
CREATE TABLE IF NOT EXISTS warnings (
    id SERIAL PRIMARY KEY,
    group_jid VARCHAR(255) REFERENCES grupos(jid),
    user_jid VARCHAR(255) REFERENCES usuarios(jid),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 📊 Messages Count Table
CREATE TABLE IF NOT EXISTS message_count (
    id SERIAL PRIMARY KEY,
    group_jid VARCHAR(255) REFERENCES grupos(jid),
    user_jid VARCHAR(255) REFERENCES usuarios(jid),
    count INTEGER DEFAULT 0,
    last_message TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 🎯 Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_usuarios_jid ON usuarios(jid);
CREATE INDEX IF NOT EXISTS idx_grupos_jid ON grupos(jid);
CREATE INDEX IF NOT EXISTS idx_economia_user ON economia(user_jid);
CREATE INDEX IF NOT EXISTS idx_mascotas_user ON mascotas(user_jid);
CREATE INDEX IF NOT EXISTS idx_stickers_pack ON stickers(pack_id);
CREATE INDEX IF NOT EXISTS idx_warnings_user ON warnings(user_jid);
CREATE INDEX IF NOT EXISTS idx_message_count_user ON message_count(user_jid);

-- ✅ Database Schema Created Successfully!

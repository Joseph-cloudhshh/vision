-- ============================================================
-- VisionForge AI — PostgreSQL Schema
-- Compatible with: PostgreSQL 13+
-- Run: psql -U your_user -d your_db -f visionforge.sql
-- ============================================================

-- ── Extensions ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Drop existing tables (safe re-run) ───────────────────────
DROP TABLE IF EXISTS saved_prompts CASCADE;
DROP TABLE IF EXISTS generations CASCADE;

-- ── generations ──────────────────────────────────────────────
CREATE TABLE generations (
    id               TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    type             TEXT        NOT NULL CHECK (type IN ('image', 'video')),
    prompt           TEXT        NOT NULL,
    negative_prompt  TEXT,
    status           TEXT        NOT NULL DEFAULT 'pending'
                                 CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    output_url       TEXT,
    thumbnail_url    TEXT,
    settings         JSONB,
    favorite         BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── saved_prompts ─────────────────────────────────────────────
CREATE TABLE saved_prompts (
    id         TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    title      TEXT        NOT NULL,
    prompt     TEXT        NOT NULL,
    category   TEXT        NOT NULL DEFAULT 'general',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX idx_generations_type        ON generations (type);
CREATE INDEX idx_generations_status      ON generations (status);
CREATE INDEX idx_generations_favorite    ON generations (favorite);
CREATE INDEX idx_generations_created_at  ON generations (created_at DESC);
CREATE INDEX idx_generations_type_status ON generations (type, status);

CREATE INDEX idx_saved_prompts_category   ON saved_prompts (category);
CREATE INDEX idx_saved_prompts_created_at ON saved_prompts (created_at DESC);

-- Full-text search on prompt text
CREATE INDEX idx_generations_prompt_fts
    ON generations USING GIN (to_tsvector('english', prompt));

CREATE INDEX idx_saved_prompts_fts
    ON saved_prompts USING GIN (to_tsvector('english', title || ' ' || prompt));

-- ── Auto-update updated_at trigger ───────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generations_updated_at
    BEFORE UPDATE ON generations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_saved_prompts_updated_at
    BEFORE UPDATE ON saved_prompts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ── Seed: saved_prompts ───────────────────────────────────────
INSERT INTO saved_prompts (title, prompt, category) VALUES
    ('Cyberpunk City Rain',
     'A rain-soaked cyberpunk city street at night, neon reflections on wet pavement, towering holographic billboards, dense fog, cinematic lighting, ultra detailed',
     'landscape'),

    ('Ethereal Forest Spirit',
     'A glowing ethereal spirit drifting through an ancient forest, bioluminescent plants, god rays piercing through dense canopy, fantasy art style, highly detailed',
     'fantasy'),

    ('Astronaut on Mars',
     'Lone astronaut standing on the Martian surface at golden hour, dramatic red sky, distant dust storm, photorealistic, NASA suit, cinematic composition',
     'portrait'),

    ('Abstract Ocean Waves',
     'Abstract interpretation of ocean waves, fluid dynamics, deep blues and teals, golden foam crests, long exposure photography style, minimalist',
     'abstract'),

    ('Samurai in Snow',
     'A lone samurai standing in a blizzard, cherry blossom petals frozen mid-air, feudal Japan architecture in background, cinematic, dramatic shadows, anime style',
     'character'),

    ('Underwater City',
     'Massive ancient city submerged beneath crystal clear ocean water, sunlight filtering through the surface, schools of tropical fish weaving through stone arches, photorealistic',
     'landscape'),

    ('Dragon over Mountains',
     'A colossal dragon soaring over snow-capped mountain peaks at sunrise, wings spread wide casting shadows below, epic fantasy scale, oil painting style, stunning detail',
     'fantasy'),

    ('Neon Portal',
     'A glowing neon portal suspended in a dark void, geometric energy patterns emanating outward, electric purple and cyan colors, sci-fi, 3D render style',
     'abstract'),

    ('Victorian Clockwork Robot',
     'A steampunk mechanical humanoid robot in Victorian-era London, brass gears and copper pipes, bowler hat, foggy gaslit streets, highly detailed illustration',
     'character'),

    ('Timelapse City',
     'Aerial timelapse of a futuristic megacity at dusk transitioning to night, light trails from flying vehicles, towering skyscrapers with LED facades, cinematic drone shot',
     'video');

-- ── Seed: generations (demo history) ─────────────────────────
INSERT INTO generations (type, prompt, status, output_url, thumbnail_url, settings, favorite) VALUES
    ('image',
     'A rain-soaked cyberpunk city street at night, neon reflections on wet pavement',
     'completed',
     'https://picsum.photos/seed/gen1/1024/1024',
     'https://picsum.photos/seed/gen1/400/400',
     '{"style":"cyberpunk","aspectRatio":"1:1","quality":"hd","numOutputs":1}',
     TRUE),

    ('image',
     'Ethereal forest spirit glowing among ancient trees, bioluminescent plants',
     'completed',
     'https://picsum.photos/seed/gen2/1024/576',
     'https://picsum.photos/seed/gen2/400/225',
     '{"style":"fantasy","aspectRatio":"16:9","quality":"ultra","numOutputs":1}',
     FALSE),

    ('image',
     'Lone astronaut standing on the Martian surface at golden hour, dramatic red sky',
     'completed',
     'https://picsum.photos/seed/gen3/576/1024',
     'https://picsum.photos/seed/gen3/225/400',
     '{"style":"realistic","aspectRatio":"9:16","quality":"hd","numOutputs":1}',
     TRUE),

    ('video',
     'A cinematic drone shot sweeping over a misty mountain range at sunrise',
     'completed',
     'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
     'https://picsum.photos/seed/gen4/400/225',
     '{"duration":4,"resolution":"1080p","motionIntensity":"moderate","motionType":"dolly"}',
     FALSE),

    ('image',
     'Victorian steampunk clockwork robot in foggy London streets',
     'completed',
     'https://picsum.photos/seed/gen5/1024/1024',
     'https://picsum.photos/seed/gen5/400/400',
     '{"style":"3d-render","aspectRatio":"1:1","quality":"hd","numOutputs":1}',
     FALSE),

    ('image',
     'Abstract ocean waves with fluid dynamics, deep blues and teals, minimalist style',
     'completed',
     'https://picsum.photos/seed/gen6/1024/768',
     'https://picsum.photos/seed/gen6/400/300',
     '{"style":"watercolor","aspectRatio":"4:3","quality":"standard","numOutputs":1}',
     TRUE);

-- ── Useful views ──────────────────────────────────────────────

-- Dashboard stats view
CREATE OR REPLACE VIEW vf_stats AS
SELECT
    COUNT(*) FILTER (WHERE type = 'image' AND status = 'completed') AS total_images,
    COUNT(*) FILTER (WHERE type = 'video' AND status = 'completed') AS total_videos,
    COUNT(*) FILTER (WHERE favorite = TRUE)                          AS total_favorites,
    COUNT(*) FILTER (WHERE status = 'failed')                        AS total_failed,
    COUNT(*)                                                          AS total_all,
    MAX(created_at)                                                   AS last_generated_at
FROM generations;

-- Recent completions view
CREATE OR REPLACE VIEW vf_recent AS
SELECT
    id, type, prompt, status, output_url, thumbnail_url, favorite, created_at
FROM generations
WHERE status = 'completed'
ORDER BY created_at DESC
LIMIT 20;

-- ── Helpful queries (reference) ───────────────────────────────
/*

-- Get dashboard stats:
SELECT * FROM vf_stats;

-- Get recent 8 generations:
SELECT * FROM vf_recent LIMIT 8;

-- Full-text search generations:
SELECT * FROM generations
WHERE to_tsvector('english', prompt) @@ plainto_tsquery('english', 'cyberpunk city')
ORDER BY created_at DESC;

-- Full-text search prompts:
SELECT * FROM saved_prompts
WHERE to_tsvector('english', title || ' ' || prompt) @@ plainto_tsquery('english', 'forest spirit')
ORDER BY created_at DESC;

-- Get favorites:
SELECT * FROM generations
WHERE favorite = TRUE AND status = 'completed'
ORDER BY created_at DESC;

-- Get by type:
SELECT * FROM generations
WHERE type = 'video' AND status = 'completed'
ORDER BY created_at DESC;

-- Toggle favorite:
UPDATE generations SET favorite = NOT favorite WHERE id = 'your-id-here';

-- Delete a generation:
DELETE FROM generations WHERE id = 'your-id-here';

-- Get all prompt categories:
SELECT category, COUNT(*) FROM saved_prompts GROUP BY category ORDER BY COUNT(*) DESC;

*/

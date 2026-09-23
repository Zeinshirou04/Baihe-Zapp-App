# Baihe — Product

## What it is
A fan translation site for 百合 (GL) Chinese dramas. English translations of
audio dramas from the Fanjiao (饭角) app, organized per series, per episode,
and per line with timestamps.

## Screens
1. **Series grid** — poster-led browse of all series.
2. **Series detail** — poster, hanzi + Latin title, synopsis, cast, episode list
   with translation progress.
3. **Episode reader** — bilingual e-reader, not a video player. Each line shows
   hanzi, pinyin, and English, in timestamp order. Pinyin can be toggled.

## Admin (single user)
- Manage series and episodes.
- **Line editor** is the core screen: bulk-paste a transcript, edit timestamps,
  edit hanzi and translation. Pinyin is generated on save.

## Content rules
- Real series data and real translation excerpts only, never placeholders.
- Partial translation is normal (e.g. 2 of 24 episodes done); the UI must
  handle it as a designed state.

## Open questions (decide before writing the schema)
- How content gets in: manual entry via the admin vs. an import script, and
  whether Fanjiao exposes anything usable.
- How lines are stored: `start_ms`, hanzi, pinyin (per-character JSON vs. plain
  string), translation.
- Whether translation credits (translator / editor per episode) are needed.

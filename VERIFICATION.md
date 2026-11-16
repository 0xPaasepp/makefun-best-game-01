# ECHODEEP verification

Rewrite verification completed 2026-11-16.

- Full `node tools/playtest.mjs`: passed all five depths, victory, life loss, game over, restart, pause/resume; 0 console errors and 0 failed requests.
- Captures: 1-start.jpg 65,744 bytes; 2-play.jpg 50,551 bytes; 3-gate.jpg 51,421 bytes; 4-end.jpg 64,038 bytes. All are 1280x720 JPEGs under 256 KiB and were visually inspected.
- Dossier generated twice: 328,983 bytes each, byte-identical. SHA-256: `475d9aa776f6461c030f5c52dc0ca021aaea68149f30ce071ba39e139e728a9d`.
- `game/` contains 11 files and is 52 KiB; `game/index.html` is 583 bytes. No HTTP, HTTPS, or protocol-relative references found in `game/` or `main.ts`.
- `vendor/makefun-game.ts` SHA-256 matches the kit: `dc67187521b24025ff952f8c231485a6eb92d6d71d29edd2a08154ffb4376129`.

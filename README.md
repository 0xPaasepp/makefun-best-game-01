# RIFTCHART

Chart the rifts, seal the void, face the Hollow Star.

[![make.fun competition](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01)
[![Live rank](https://make.fun/badge/best-game-01/0xPaasepp/makefun-best-game-01/rank.svg)](https://make.fun/bounty/best-game-01)
[![Live reward](https://make.fun/badge/best-game-01/0xPaasepp/makefun-best-game-01/reward.svg)](https://make.fun/bounty/best-game-01)

Run `node serve.ts`, then open http://127.0.0.1:8080. The game uses original Canvas art and browser standard APIs, with no network dependencies.

WASD sails the skiff. Click numbered stars in order to seal each chart. Click enemies to zap them. Space or 1 triggers Nova Flare; 2 Chain Star clears three threats; 3 Ward blocks damage; 4 Comet Dash moves and repairs hull; 5 Starlens slows the simulation; 6 Overchart restores integrity. Abilities spend stardust. P pauses. Enter starts or restarts.

Seal six charts, then sever the five Hollow Star chords. Integrity reaching zero ends the voyage. Fast consecutive seals grow the score multiplier; damage breaks it. Each seal awards a relic and restores some integrity.

With Playwright available, `node tools/capture.mjs` tests the complete loop and regenerates exactly four live screenshots. `MAKEFUN_OUTPUT_DIR=out node main.ts` builds the dossier. Node tools use the standard library except the browser capture tool.

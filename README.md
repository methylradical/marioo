# Jump Plumber

An original browser-based 2D Canvas platformer for learning. It uses original pixel-style shapes and does not use protected character names, likenesses, official music, official sound effects, or ripped assets.

## Run

From this folder:

```bash
python -m http.server 8000
```

Then open `http://127.0.0.1:8000`.

## Controls

- `A` / `D` or arrow keys: move
- `Space`, `W`, or up arrow: jump
- Press jump again in the air: spend 1 collected coin jump
- Stomp moving objects from above to defeat them and gain power
- Reach the flag to clear the stage
- Coins give one extra air jump each and are consumed by air jumps
- Stomps increase jump height, air distance, and character size up to a cap
- Body hits shrink a powered character; body hits while unpowered cost a life
- `New Game`: clear saved progress and start from scene 1

## Scope

The game has a start screen, 10 scenes, saved progress, basement stages, coin-fueled air jumps, stomp-powered growth, moving objects, moving platforms, water, spikes, pits, lives, timer, scoring, stage progression, game over, victory, and restart. Game Over restarts from the first uncleared scene.

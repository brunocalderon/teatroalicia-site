# Submit freeze (Formgong proof-of-work)

## Symptoms

Submitting a Formgong-backed form could hang the tab: the UI stopped responding, loading state never finished, and the machine fan spiked.

## Cause

The custom submit path calls `refreshFormPowFieldBeforePost()` before POSTing to Formgong. That lives in `src/lib/form-browser-signals.ts` and implements the same proof-of-work (PoW) as `fg.js`: fetch a challenge from `https://formgong.com/pow`, hash `challenge:nonce` with SHA-256 in batches until enough leading zero bits match the difficulty, then set hidden field `_fg_pow` to `challenge~nonce`.

The bug was in the loop that counts leading zero bits in each hash. The loop advanced `zeroBits` but never advanced the byte index, so when the first hash byte was `0` (common while searching), the condition stayed true forever:

```javascript
// Broken: infinite loop on main thread
for (let z = 0; z < 256 && !bytes[z >> 3]; ) {
  zeroBits += 8
}
```

That ran synchronously inside the hash-check path, blocking the browser main thread.

## Why the 2s timeout did not unblock the UI

`refreshFormPowFieldBeforePost` uses `Promise.race` between `solveFormPow` and a 2s sleep. A timeout only stops *waiting* for the promise; it does not cancel work already running on the main thread. An infinite synchronous loop keeps the event loop busy, so the tab stays frozen even after the race “times out.”

## Fix

Advance one byte per iteration and compare explicitly to zero:

```javascript
for (let z = 0; z < 256 && bytes[z >> 3] === 0; z += 8) {
  zeroBits += 8
}
```

After this change, PoW still uses CPU briefly (by design), but it completes and submit proceeds to the Formgong POST and thank-you redirect.

## Related code

| Piece | Location |
| --- | --- |
| PoW solver and pre-POST refresh | `src/lib/form-browser-signals.ts` |
| Submit POST helper | `src/lib/form-submit.ts` |
| Formgong client signals (analytics / `_fg_*`) | `attachFormgongClientSignals` in `configurable-form.tsx` (no `fg.js`) |

Do not load `fg.js` on form pages: it starts PoW mining on `keydown` / `focusin` and competes with the custom submit path, which can peg CPU (especially while React hydrates `/i/*` islands).

If `_fg_pow` already contains `~`, the refresh helper skips solving again.

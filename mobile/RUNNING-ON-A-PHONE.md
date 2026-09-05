# Running Akaar on an Android phone

Everything in `mobile/packages` is already tested on a computer. This guide is
for the parts that only a real phone can answer: the camera, the microphone,
whether the local database is genuinely encrypted, and whether login secrets
survive an app restart.

There is a **Device checks** screen built in that answers most of those with a
single button press.

---

## What you need

| Thing | Why | Notes |
|---|---|---|
| An Android phone | The whole point | Android 7 (2016) or newer. A cheap phone is *better* for this app — it is the real target. |
| A USB cable | To install the app on the phone | Must be a data cable, not charge-only. Some cheap cables only charge. |
| Node.js 20 or newer | Builds the JavaScript | https://nodejs.org |
| pnpm | Installs the packages | `npm install -g pnpm` |
| Java JDK 17 | Android builds need it | Comes with Android Studio. |
| Android Studio | Gives you the Android SDK and drivers | https://developer.android.com/studio — you never have to open the app itself, but installing it is the least painful way to get the SDK. |

Windows, Mac and Linux all work for Android.

**iPhone is not possible right now.** It needs a Mac, and the iOS project has
not been generated yet. Android first is the right order anyway — the app is
Android-first by design.

Rough time: **1–2 hours** the first time, mostly downloads. Under a minute on
later runs.

---

## Step 1 — Turn on developer mode on the phone

1. Settings → About phone
2. Tap **Build number** seven times. It will say "You are now a developer".
3. Go back to Settings → System → Developer options
4. Turn on **USB debugging**
5. Plug the phone into the computer. A popup appears on the phone asking to
   allow USB debugging — tap **Allow** (and tick "always allow").

Check the computer can see it:

```sh
adb devices
```

You should see your phone listed with the word `device` next to it. If it says
`unauthorized`, look at the phone for the popup. If nothing is listed, try a
different cable.

## Step 2 — Get the code and install packages

```sh
git clone https://github.com/Tamanna-57/Akaar.git
cd Akaar/mobile
pnpm install
```

## Step 3 — Run it

```sh
cd apps/mobile
pnpm android
```

The first build downloads a lot and takes 10–30 minutes. Later builds take
about a minute. When it finishes, the app opens on the phone by itself.

If it fails, see Troubleshooting at the bottom.

## Step 4 — Run the device checks

On the app's first screen, below the "Shuru karein" button, there is a small
**Device checks** link (it only appears in development builds). Tap it, then
tap **Run all checks**.

Five checks run:

| Check | What a PASS proves |
|---|---|
| Secure storage (Keystore) | The phone's hardware-backed store saves and returns a secret. |
| Database key is stable | The database password is created once and does not change. If it changed, every saved draft would become unreadable. |
| Encrypted database | The database opens with that key, sets up its tables, and saves a row. |
| **Encryption is actually on** | A *wrong* password is refused. This is the one that proves the file is truly encrypted, not just claimed to be. |
| Offline outbox on real storage | Changes to the same product go out in order, and each carries its own key. |

**Then close the app completely and re-run the checks.** If "Database key is
stable" still passes, the key really survived a restart — which is the thing
that matters.

### If "Encryption is actually on" FAILS

That means a wrong password opened the database, so SQLCipher is not switched
on. Check that `apps/mobile/package.json` still contains:

```json
"op-sqlite": { "sqlcipher": true }
```

then rebuild from scratch:

```sh
cd apps/mobile/android && ./gradlew clean && cd .. && pnpm android
```

## Step 5 — Check camera and microphone by hand

These need a person, not an assertion:

- **Camera** — needs a preview screen, which is not built yet. The plumbing is
  there (`core-media`), the screen is not.
- **Microphone** — the Device checks screen has Start / Stop / Discard buttons
  that drive the recording state machine. Tap through and confirm the state
  text changes as expected.

## Step 6 — Check the screenshot block (optional)

`FLAG_SECURE` is meant to stop screenshots on screens that show costs. No cost
screen exists yet, so there is nothing to test it on. Once one does: open it,
try to take a screenshot, and the phone should refuse.

---

## Things that are deliberately switched OFF

**Certificate pinning.** `android/app/src/main/res/xml/network_security_config.xml`
is written but *not* connected in the manifest, because it still has
placeholder certificate values. If you connect it as-is, every network request
will fail with no clear error. The manifest has a comment saying exactly how
to turn it on once real values are in place.

**Talking to the real server.** Nothing connects to Supabase yet. The outbox
queues changes correctly, but there is no code to send them anywhere real. The
device checks use a stand-in that always says "accepted".

---

## Troubleshooting

**"SDK location not found"**
Create `apps/mobile/android/local.properties` with the path to your Android SDK:
```
sdk.dir=/Users/you/Library/Android/sdk        # Mac
sdk.dir=C:\\Users\\you\\AppData\\Local\\Android\\Sdk   # Windows
```

**"Unable to load script" / blank red screen**
The JavaScript server is not reachable. Run `pnpm start` in `apps/mobile` in a
second terminal, then `adb reverse tcp:8081 tcp:8081`.

**Build fails after changing packages**
```sh
cd apps/mobile/android && ./gradlew clean && cd .. && pnpm android
```

**"JAVA_HOME is not set"**
Point it at the JDK that came with Android Studio, e.g. on Mac:
```sh
export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
```

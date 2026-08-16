# LeetCode to GitHub Sync

A Chrome extension that automatically pushes your accepted LeetCode submissions to a GitHub repository you own.

Solve a problem on LeetCode, get an "Accepted" result, and the extension grabs your solution code and commits it to your repo. No copy-pasting required.

## Features

- Fully automatic: no button to click, no manual export. Just solve problems normally.
- Commits are organized by difficulty and problem: `Medium/two-sum/`.
- Every accepted submission is kept as its own timestamped file; nothing is ever overwritten, from the very first solve onward.
- Supports 14 languages (see below); anything else falls back to a `.txt` file.
- Your GitHub token stays local to your browser; it's never sent anywhere except `api.github.com`.

## Install

1. Download or clone this repository to your computer.
2. Open `chrome://extensions` in Chrome.
3. Turn on **Developer mode** (top-right toggle).
4. Click **Load unpacked** and select the folder you downloaded.
5. You should see "LeetCode to GitHub Sync" appear in your extensions list with no errors.

## Setup

### 1. Create (or pick) a GitHub repository

This is where your solutions will be committed. It can be a brand-new empty repo or an existing one, public or private, your choice.

### 2. Create a GitHub personal access token

The extension needs a token with permission to write to that specific repo.

1. Go to [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new) to create a **fine-grained** token (recommended: it can be scoped to just one repo).
2. **Repository access** → choose **"Only select repositories"** → select the repo from step 1.
   - If the repo doesn't exist yet, create it first, *then* generate the token; a fine-grained token can only list repos that already exist when you configure it.
3. **Permissions** → **Repository permissions** → find **Contents** → set it to **Read and write**.
4. Click **Generate token** and copy it. GitHub only shows it once.

*(A classic token with the `repo` scope also works, but grants access to all your repos rather than just one; the fine-grained option above is safer.)*

### 3. Configure the extension

1. Click the extension's icon in the Chrome toolbar (pin it via the puzzle-piece icon if you don't see it).
2. Fill in:
   - **GitHub username/org**: e.g. `yourusername`
   - **Repo name**: e.g. `leetcode-solutions`
   - **Personal access token**: the token from step 2
3. Click **Save**.

## Usage

Just solve problems on LeetCode as normal, on a page like `leetcode.com/problems/<slug>/`. When your submission comes back **Accepted**, the extension automatically:

1. Grabs your code, language, problem title, and difficulty.
2. Commits it to your configured repo under `<Difficulty>/<problem-slug>/`.

Every accepted submission for a problem, including the first, is committed as its own timestamped file, so nothing is ever overwritten and you can always see exactly when each solve happened:

```
Medium/two-sum/
  solution-2026-08-14_10-02-11.py
  solution-2026-08-16_14-23-05.py
  solution-2026-08-19_09-01-42.java
```

No confirmation dialog, no popup. It just happens in the background. Check your GitHub repo (or the browser console, see Troubleshooting) to confirm a push went through.

## Supported languages

Python, Java, C++, C, C#, JavaScript, TypeScript, Go, Ruby, Swift, Kotlin, Rust, Scala, PHP. Unrecognized languages fall back to a `.txt` extension.

## How it works

1. **`content-inject.js`** runs in the LeetCode page's own JS context and wraps `window.fetch` to watch for the submission-status polling request LeetCode's frontend makes (`/submissions/detail/{id}/.../check/`). When it sees `state: "SUCCESS"` and `status_msg: "Accepted"`, it broadcasts an `ACCEPTED` event via `window.postMessage`.
2. **`content-relay.js`** runs in the isolated content-script world (so it has access to `chrome.runtime`). It listens for that `ACCEPTED` event, then queries LeetCode's GraphQL API for the submission's code, language, and problem metadata.
3. **`background.js`** (the service worker) receives the solution details, reads your GitHub settings from `chrome.storage.local`, and uses the GitHub Contents API to commit the file as `solution-<timestamp>.<ext>`; every submission gets a unique filename, so nothing is ever overwritten.
4. **`options.html` / `options.js`** provide the popup UI for entering your GitHub username/org, repo name, and personal access token, stored via `chrome.storage.local`.

## Troubleshooting

Nothing gets pushed after an Accepted result? Open the browser console and check both places the extension logs to, all under the `[LC-GitHub-Sync]` prefix:

- **Page console**: on the LeetCode tab, open DevTools (`Cmd+Opt+I` / `F12`) → Console. This shows `content-inject.js` and `content-relay.js` output.
- **Service worker console**: go to `chrome://extensions`, find this extension's card, click **"service worker"** under "Inspect views"; this shows `background.js` output.
- **Extension error log**: on the same extension card, a red **Errors** button (if present) shows a persistent history of failures from the service worker, independent of whatever the live console is doing.

Common causes:

| Symptom | Likely cause |
|---|---|
| No `[LC-GitHub-Sync]` logs appear at all | Extension isn't loaded/enabled, or the page wasn't reloaded after installing/updating the extension. Reload the extension at `chrome://extensions`, then hard-reload the LeetCode tab. |
| `no csrftoken cookie found` | You're not logged into LeetCode in this browser profile. |
| `GraphQL returned errors: [...]` | LeetCode's API shape changed since this was last tested; the error message will name the specific problem. |
| `GitHub push failed: 401 ...` | Token is invalid or expired. Generate a new one. |
| `GitHub push failed: 404 ...` | Either the owner/repo name in the popup doesn't match an existing repo, or your token doesn't have access to it (fine-grained tokens must have the repo explicitly selected, and the repo must have existed *before* the token was created). |

## Security & privacy

- Your GitHub token is stored **unencrypted** in `chrome.storage.local`, local to your browser. Anyone with access to your machine/browser profile could read it. Use a token scoped to only the one repo you want to sync to (see Setup above) so a leak has limited blast radius. Never use a token with broad account-wide access for this.
- The extension only ever talks to `leetcode.com` (to detect submissions and read your code) and `api.github.com` (to push commits). It does not send data anywhere else.
- No server, no third-party service, and no analytics are involved; everything happens locally in your browser except the final commit to your own repo.

## Limitations

- Only tested against `leetcode.com` (not regional domains like `leetcode.cn`).
- Every accepted submission for a problem gets its own file, so a problem you solve repeatedly (while iterating, or across languages) will accumulate multiple files in its folder over time; nothing is pruned automatically.
- Depends on LeetCode's internal API endpoints and response shapes, which aren't public/stable; LeetCode changing them in the future may require updating the regex in `content-inject.js` or the GraphQL query in `content-relay.js`.

## Permissions

- `storage`: to save your GitHub settings locally.
- `https://leetcode.com/*`: to detect accepted submissions and fetch solution code.
- `https://api.github.com/*`: to push commits to your repo.

## License

[MIT](LICENSE)

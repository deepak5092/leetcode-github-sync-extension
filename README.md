# LeetCode to GitHub Sync

A Chrome extension that automatically pushes your accepted LeetCode submissions to a GitHub repository you own.

Solve a problem on LeetCode, get an "Accepted" result, and the extension grabs your solution code and commits it to your repo — no copy-pasting required.

## How it works

1. **`content-inject.js`** runs in the LeetCode page's own JS context and wraps `window.fetch` to watch for the submission-status polling request LeetCode's frontend makes. When it sees a response with `state: "SUCCESS"` and `status_msg: "Accepted"`, it broadcasts an `ACCEPTED` event via `window.postMessage`.
2. **`content-relay.js`** runs in the isolated content-script world (so it has access to `chrome.runtime`). It listens for that `ACCEPTED` event, then queries LeetCode's GraphQL API for the submission's code, language, and problem metadata.
3. **`background.js`** (the service worker) receives the solution details, reads your GitHub settings from `chrome.storage.local`, and uses the GitHub Contents API to create or update a file at:
   ```
   <difficulty>/<problem-slug>/solution.<ext>
   ```
   in your configured repo (e.g. `Medium/two-sum/solution.py`). If the file already exists, it fetches the current SHA first so the update doesn't fail.
4. **`options.html` / `options.js`** provide the popup UI for entering your GitHub username/org, repo name, and personal access token, stored via `chrome.storage.local`.

## Setup

1. Load the extension unpacked:
   - Go to `chrome://extensions`
   - Enable **Developer mode**
   - Click **Load unpacked** and select this project folder
2. Create a GitHub [personal access token](https://github.com/settings/tokens) with `repo` (or fine-grained **Contents: Read and write**) access to the repo you want to sync to.
3. Click the extension icon and fill in:
   - **GitHub username/org**
   - **Repo name**
   - **Personal access token**
4. Click **Save**.

## Usage

Just solve problems on LeetCode as normal. When a submission is Accepted, the extension automatically pushes the solution to your GitHub repo in the background. Check the browser console (or the repo itself) if you want to confirm a push happened — errors are logged there via `console.error`.

## Permissions

- `storage` — to save your GitHub settings locally.
- `https://leetcode.com/*` — to detect accepted submissions and fetch solution code.
- `https://api.github.com/*` — to push commits to your repo.

Your GitHub token is stored only in local extension storage (`chrome.storage.local`) and is never sent anywhere other than `api.github.com`.

## Supported languages

Python, Java, C++, C, C#, JavaScript, TypeScript, Go, Ruby, Swift, Kotlin, Rust, Scala, PHP. Unrecognized languages fall back to a `.txt` extension.

## Limitations

- Only tested against `leetcode.com` (not regional domains like `leetcode.cn`).
- No conflict resolution beyond overwriting the existing file at the same path — resubmitting a problem overwrites your previous solution.
- The GitHub token is stored in plaintext in extension storage; use a token scoped only to the target repo.

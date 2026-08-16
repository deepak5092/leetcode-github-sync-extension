# Privacy Policy — LeetCode to GitHub Sync

Last updated: 2026-08-16

## What this extension does

LeetCode to GitHub Sync is a Chrome extension that detects when you receive an "Accepted" result on leetcode.com and automatically commits your solution code to a GitHub repository that you configure.

## Data this extension accesses

- **Your LeetCode submission data**: problem title, difficulty, programming language, and your submitted source code. This is read directly from LeetCode's own pages/API while you are using leetcode.com, and is only ever sent to GitHub as the content of a commit.
- **Your GitHub personal access token**: entered by you in the extension's settings popup, used solely to authenticate commits to the repository you specify.
- **Your GitHub username/org and repository name**: entered by you in the extension's settings popup, used to construct the GitHub API requests for your commits.

## Where this data is stored

All of the above is stored locally in your browser via the `chrome.storage.local` API. It is not transmitted to, or stored on, any server operated by the developer of this extension. There is no backend, no analytics, and no third-party service involved.

## Where this data is sent

- To `leetcode.com`: only the normal page requests your browser already makes while you use the site; the extension reads responses, it does not send anything additional to LeetCode.
- To `api.github.com`: your submission code and the GitHub token you provided, solely to create or update files in the repository you configured.

No data is sent to, or shared with, any other domain, service, or third party. No data is sold or used for advertising.

## Your control over this data

- You choose which GitHub repository this extension writes to.
- You choose the scope of the GitHub token you provide (a narrowly-scoped, single-repository token is recommended in the extension's README).
- You can remove all locally stored data at any time by removing the extension, or by clearing its data via `chrome://extensions`.

## Contact

Questions about this policy can be raised via [GitHub Issues](https://github.com/deepak5092/leetcode-github-sync-extension/issues) on this project's repository.

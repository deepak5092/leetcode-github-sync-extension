# Privacy policy for LeetCode to GitHub Sync

Last updated: September 7, 2026

LeetCode to GitHub Sync ("the extension") is built to help you automatically back up your accepted LeetCode submissions to a GitHub repository you own. This policy explains what data the extension accesses, how it is used, and how it is stored.

## What the extension accesses

- **LeetCode submission content**: When you submit a solution on LeetCode and it is accepted, the extension reads the solution code and the associated problem name from the page so it can be committed to your repository.
- **GitHub account settings**: The GitHub username or organization, repository name, and personal access token that you enter into the extension's settings.

## How this data is used

- Your solution code is sent directly to the GitHub API to create a commit in the repository you specify. It is not sent to any other server or third party.
- Your GitHub username, repository name, and personal access token are used only to authenticate that request and are stored locally in your browser's storage.

## How this data is stored

- Your GitHub username, repository name, and personal access token are stored using Chrome's local extension storage, on your own device. They are not transmitted to us or to any server we control.
- We do not operate any backend server that receives or logs your data. The only network requests the extension makes are directly between your browser and GitHub's API, and between your browser and LeetCode's pages that you are already viewing.

## What we do not do

- We do not sell or share your data with third parties.
- We do not use your data for advertising or analytics.
- We do not use your data to determine creditworthiness or for lending purposes.
- We do not use your data for any purpose beyond syncing your accepted LeetCode submissions to your chosen GitHub repository.

## Your personal access token

Your GitHub personal access token is sensitive. Treat it like a password. You can revoke it at any time from your GitHub account settings, which will immediately stop the extension from being able to sync to your repository.

## Changes to this policy

If this policy changes, the update will be posted to this page with a new "Last updated" date.

## Contact

If you have questions about this policy, you can open an issue on the extension's GitHub repository: https://github.com/deepak5092/leetcode-github-sync-extension

const EXTENSIONS = {
  python3: "py",
  python: "py",
  java: "java",
  "c++": "cpp",
  c: "c",
  "c#": "cs",
  javascript: "js",
  typescript: "ts",
  golang: "go",
  go: "go",
  ruby: "rb",
  swift: "swift",
  kotlin: "kt",
  rust: "rs",
  scala: "scala",
  php: "php",
};

const LOG_PREFIX = "[LC-GitHub-Sync]";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== "PUSH_SOLUTION") return;

  pushToGitHub(message.payload)
    .then(() => {
      console.log(`${LOG_PREFIX} GitHub push succeeded for "${message.payload.title}"`);
      sendResponse({ ok: true });
    })
    .catch((err) => {
      console.error(`${LOG_PREFIX} GitHub push failed for "${message.payload.title}":`, err);
      sendResponse({ ok: false, error: String(err) });
    });

  return true; // keep the message channel open for the async response
});

async function pushToGitHub({ title, titleSlug, difficulty, lang, code }) {
  const { githubToken, githubOwner, githubRepo } = await chrome.storage.local.get([
    "githubToken",
    "githubOwner",
    "githubRepo",
  ]);

  if (!githubToken || !githubOwner || !githubRepo) {
    throw new Error("GitHub settings not configured. Open the extension popup and fill them in.");
  }

  const ext = EXTENSIONS[lang.toLowerCase()] || "txt";
  const folder = `${difficulty}/${titleSlug}`;
  const headers = {
    Authorization: `Bearer ${githubToken}`,
    Accept: "application/vnd.github+json",
  };

  // Every accepted submission, including the first, gets its own
  // timestamped file, so nothing is ever overwritten and no lookup is
  // needed to tell whether this problem was solved before.
  const filename = `solution-${formatTimestamp(new Date())}.${ext}`;
  const path = `${folder}/${filename}`;
  const apiUrl = `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/${path}`;

  const res = await fetch(apiUrl, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Add solution: ${title}`,
      content: base64EncodeUtf8(code),
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub push failed: ${res.status} ${await res.text()}`);
  }
}

function formatTimestamp(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}_${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
}

function base64EncodeUtf8(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

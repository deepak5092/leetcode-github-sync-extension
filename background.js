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

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type !== "PUSH_SOLUTION") return;

  pushToGitHub(message.payload)
    .then(() => sendResponse({ ok: true }))
    .catch((err) => {
      console.error("LeetCode -> GitHub sync failed:", err);
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
  const path = `${difficulty}/${titleSlug}/solution.${ext}`;
  const apiUrl = `https://api.github.com/repos/${githubOwner}/${githubRepo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${githubToken}`,
    Accept: "application/vnd.github+json",
  };

  // If the file already exists, GitHub requires its current sha to update it.
  let sha;
  const existing = await fetch(apiUrl, { headers });
  if (existing.status === 200) {
    sha = (await existing.json()).sha;
  }

  const res = await fetch(apiUrl, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `Add solution: ${title}`,
      content: base64EncodeUtf8(code),
      ...(sha ? { sha } : {}),
    }),
  });

  if (!res.ok) {
    throw new Error(`GitHub push failed: ${res.status} ${await res.text()}`);
  }
}

function base64EncodeUtf8(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

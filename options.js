document.addEventListener("DOMContentLoaded", async () => {
  const { githubOwner, githubRepo, githubToken } = await chrome.storage.local.get([
    "githubOwner",
    "githubRepo",
    "githubToken",
  ]);
  document.getElementById("owner").value = githubOwner || "";
  document.getElementById("repo").value = githubRepo || "";
  document.getElementById("token").value = githubToken || "";
});

document.getElementById("save").addEventListener("click", async () => {
  const githubOwner = document.getElementById("owner").value.trim();
  const githubRepo = document.getElementById("repo").value.trim();
  const githubToken = document.getElementById("token").value.trim();

  await chrome.storage.local.set({ githubOwner, githubRepo, githubToken });

  const status = document.getElementById("status");
  status.textContent = "Saved.";
  setTimeout(() => (status.textContent = ""), 1500);
});

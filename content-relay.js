// Runs in the isolated content-script world, so it has access to
// chrome.runtime (unlike content-inject.js). It listens for the
// "ACCEPTED" signal, fetches the full solution code + problem metadata
// from LeetCode's GraphQL endpoint (cookies are sent automatically since
// this is a same-origin request), then hands it off to the background
// service worker to push to GitHub.
window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data?.source !== "lc-github-sync" || event.data.type !== "ACCEPTED") return;
  fetchSubmissionDetails(event.data.submissionId);
});

async function fetchSubmissionDetails(submissionId) {
  const query = `
    query submissionDetails($submissionId: Int!) {
      submissionDetails(submissionId: $submissionId) {
        code
        lang { name }
        question { title titleSlug difficulty }
      }
    }
  `;

  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ query, variables: { submissionId: Number(submissionId) } }),
  });

  const json = await res.json();
  const details = json?.data?.submissionDetails;
  if (!details) return;

  chrome.runtime.sendMessage({
    type: "PUSH_SOLUTION",
    payload: {
      title: details.question.title,
      titleSlug: details.question.titleSlug,
      difficulty: details.question.difficulty,
      lang: details.lang.name,
      code: details.code,
    },
  });
}

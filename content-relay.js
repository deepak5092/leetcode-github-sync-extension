// Runs in the isolated content-script world, so it has access to
// chrome.runtime (unlike content-inject.js). It listens for the
// "ACCEPTED" signal, fetches the full solution code + problem metadata
// from LeetCode's GraphQL endpoint (cookies are sent automatically since
// this is a same-origin request), then hands it off to the background
// service worker to push to GitHub.
const LOG_PREFIX = "[LC-GitHub-Sync]";

window.addEventListener("message", (event) => {
  if (event.source !== window) return;
  if (event.data?.source !== "lc-github-sync" || event.data.type !== "ACCEPTED") return;
  fetchSubmissionDetails(event.data.submissionId);
});

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

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

  // LeetCode's GraphQL endpoint is behind Django's CSRF protection: a POST
  // without a matching x-csrftoken header (mirroring the csrftoken cookie)
  // is rejected.
  const csrftoken = getCookie("csrftoken");
  if (!csrftoken) {
    console.error(`${LOG_PREFIX} no csrftoken cookie found — are you logged into LeetCode in this browser profile?`);
    return;
  }

  let res;
  try {
    res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrftoken": csrftoken,
      },
      credentials: "include",
      body: JSON.stringify({ query, variables: { submissionId: Number(submissionId) } }),
    });
  } catch (err) {
    console.error(`${LOG_PREFIX} GraphQL request threw (network error):`, err);
    return;
  }

  if (!res.ok) {
    console.error(`${LOG_PREFIX} GraphQL request failed: ${res.status} ${await res.text()}`);
    return;
  }

  const json = await res.json();
  if (json.errors) {
    console.error(`${LOG_PREFIX} GraphQL returned errors:`, json.errors);
    return;
  }

  const details = json?.data?.submissionDetails;
  if (!details) {
    console.error(`${LOG_PREFIX} no submissionDetails in GraphQL response:`, json);
    return;
  }

  chrome.runtime.sendMessage(
    {
      type: "PUSH_SOLUTION",
      payload: {
        title: details.question.title,
        titleSlug: details.question.titleSlug,
        difficulty: details.question.difficulty,
        lang: details.lang.name,
        code: details.code,
      },
    },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error(`${LOG_PREFIX} sendMessage to background worker failed:`, chrome.runtime.lastError.message);
        return;
      }
      if (!response?.ok) {
        console.error(`${LOG_PREFIX} GitHub push failed:`, response?.error);
        return;
      }
      console.log(`${LOG_PREFIX} "${details.question.title}" pushed to GitHub successfully`);
    }
  );
}

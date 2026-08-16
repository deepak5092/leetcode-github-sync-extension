// Runs in the page's own JS context (world: MAIN), so it can see the
// fetch() calls LeetCode's own React app makes, including the polling
// request it uses to check whether your submission was Accepted.
(function () {
  const LOG_PREFIX = "[LC-GitHub-Sync]";
  const processed = new Set();
  const originalFetch = window.fetch;

  // LeetCode's check endpoint is "/submissions/detail/{id}/v2/check/". The
  // (?:\w+\/)* allows for that (or any future) version segment while still
  // matching the older unversioned "/check/" shape too.
  const CHECK_URL_RE = /\/submissions\/detail\/(\d+)\/(?:\w+\/)*check(?:\/|\?|#|$)/;

  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);

    try {
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url;
      const match = url && url.match(CHECK_URL_RE);

      if (match) {
        const submissionId = match[1];
        response
          .clone()
          .json()
          .then((data) => {
            if (
              data.state === "SUCCESS" &&
              data.status_msg === "Accepted" &&
              !processed.has(submissionId)
            ) {
              processed.add(submissionId);
              console.log(`${LOG_PREFIX} Accepted detected for submission ${submissionId}`);
              window.postMessage(
                { source: "lc-github-sync", type: "ACCEPTED", submissionId },
                "*"
              );
            }
          })
          .catch((err) => {
            console.warn(`${LOG_PREFIX} failed to parse check response for ${submissionId}:`, err);
          });
      }
    } catch (e) {
      // never let sync logic break the actual LeetCode page, but don't go silent either
      console.warn(`${LOG_PREFIX} fetch interception error:`, e);
    }

    return response;
  };

  console.log(`${LOG_PREFIX} fetch interception installed on`, location.href);
})();

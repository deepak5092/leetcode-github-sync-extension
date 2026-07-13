// Runs in the page's own JS context (world: MAIN), so it can see the
// fetch() calls LeetCode's own React app makes — including the polling
// request it uses to check whether your submission was Accepted.
(function () {
  const processed = new Set();
  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);

    try {
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url;
      const match = url && url.match(/\/submissions\/detail\/(\d+)\/check\//);

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
              window.postMessage(
                { source: "lc-github-sync", type: "ACCEPTED", submissionId },
                "*"
              );
            }
          })
          .catch(() => {});
      }
    } catch (e) {
      // never let sync logic break the actual LeetCode page
    }

    return response;
  };
})();

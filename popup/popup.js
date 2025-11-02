(function () {
  const form = document.getElementById("searchForm");
  const queryInput = document.getElementById("query");
  const filetypeSelect = document.getElementById("filetype");
  const siteInput = document.getElementById("site");
  const resetBtn = document.getElementById("resetBtn");

  function buildSearchUrl(query, filetypeValue, siteValue) {
    const parts = [];

    const q = (query || "").replace(/\s+/g, " ").trim();
    if (q) parts.push(q);

    const ft = (filetypeValue || "").trim();
    if (ft) parts.push(`filetype:${ft}`);

    const s = (siteValue || "").trim();
    if (s) parts.push(`site:${s}`);

    const finalQuery = parts.join(" ");
    const url = new URL("https://www.google.com/search");
    url.searchParams.set("q", finalQuery);
    return url.toString();
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const url = buildSearchUrl(
      queryInput.value,
      filetypeSelect.value,
      siteInput.value
    );

    chrome.tabs.create({ url });
  });

  resetBtn.addEventListener("click", () => {
    form.reset();
    queryInput.focus();
  });

  // UX: Autofokus für schnelles Tippen
  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => queryInput?.focus(), 50);
  });
})();

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector(
    "#backend-link"
  ).href = `chrome-extension://${chrome.runtime.id}/grouphero/dashboard.html`;
});

// set default data
let value = { data: [] };
chrome.storage.local.set({ grouphero_database_v1: value }, () => {});
chrome.storage.local.set({ grouphero_token_v1: "nothing" }, () => {});

// accept message
chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  switch (request.type) {
    case "saving":
      let currentData = null;
      chrome.storage.local.get(["grouphero_database_v1"], (result) => {
        currentData = result.grouphero_database_v1;
        currentData.data.push(request.data);
        chrome.storage.local.set({ grouphero_database_v1: currentData }, () => {
          console.log("saving", currentData);
        });
      });
      sendResponse({
        message: "Saved, buddy.",
      });

      break;
    case "clear":
      console.log("clear data");
      chrome.storage.local.set(
        { grouphero_database_v1: { data: [] } },
        () => {}
      );
      sendResponse({
        message: "Cleared, buddy.",
      });
      break;
    case "activated":
      chrome.storage.local.set(
        { grouphero_is_activated: request.apiKey },
        () => {}
      );
      sendResponse({
        message: "Activated, buddy.",
      });
      break;
    case "save_form_code":
      chrome.storage.local.set(
        { grouphero_form_code: request.formcode },
        () => {}
      );
      sendResponse({
        message: "Saved form code.",
      });
      break;
    case "check_is_activated":
      const theTokenz = chrome.identity.getAuthToken(
        { interactive: true },
        (token) => {
          chrome.storage.local.set({ grouphero_token_v1: token }, (result) => {
            console.log("result", result);
          });
        }
      );

      sendResponse({
        message: theTokenz,
      });

      break;
    case "request":
      chrome.storage.local.get(["grouphero_database_v1"], (result) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.tabs.sendMessage(
            tabs[0].id,
            { data: result.grouphero_database_v1, type: "request" },
            (response) => {
              console.log(response);
            }
          );
        });
      });

      break;
  }
  sendResponse({
    message: "Thanks for the message, buddy.",
  });
});

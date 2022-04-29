document.addEventListener("DOMContentLoaded", function (event) {
  let realData = "";

  // Listen to Requests
  chrome.runtime.onMessage.addListener(
    async (request, sender, sendResponse) => {
      if (request.type === "request") {
        buildTable(request.data.data);
        realData = request.data.data;
      }
    }
  );

  // check if activated
  setTimeout(() => {
    chrome.runtime.sendMessage(
      {
        type: "check_is_activated",
      },
      (response) => {
        console.log("hey", response);
      }
    );

    setTimeout(() => {
      chrome.runtime.sendMessage(
        {
          type: "check_is_activated",
        },
        (response) => {
          console.log("hey", response);
        }
      );
    }, 2500);
  }, 500);

  // Reload
  const reloadButton = document.querySelector("#reload");
  reloadButton.addEventListener("click", (event) => {
    getData();
  });

  // Clear Data
  document.querySelector("#clear").addEventListener("click", (event) => {
    if (
      confirm(
        "Are you sure you want to delete all the current data? Make sure you export data first!"
      )
    ) {
      chrome.runtime.sendMessage(
        {
          type: "clear",
        },
        (response) => {
          document.querySelector(
            "#data"
          ).innerHTML = `<div class="border border-gray-100 rounded p-6 text-center text-lg">
          <p>
            To get started start adding people to your Facebook group. Once you
            have collected data using the green "Approve" button on Facebook you
            can then click <strong>Reload</strong> and show the collected
            contact information here. You can also export your leads to multiple
            endpoints.
          </p>
        </div>`;
        }
      );
    }
  });

  document.querySelector("#saveSettings").addEventListener("click", (event) => {
    saveAPISettings(".apiKeySettings");
  });

  document.querySelector("#saveFormCode").addEventListener("click", (event) => {
    saveFormCode();
  });

  document
    .querySelector("#exportFormCode")
    .addEventListener("click", (event) => {
      chrome.storage.local.get(["grouphero_form_code"], (result) => {
        if (result.grouphero_form_code !== "") {
          const data = [".."];
          let formCode = result.grouphero_form_code;

          data.forEach((item) => {
            const email = extractEmails(JSON.stringify(row.questions));

            if (email.includes("@")) {
              formCode = formCode.replace("{NAME}", item.info.name);
              formCode = formCode.replace("{EMAIL}", email);
              formCode = formCode.replace(
                "<form ",
                "<form target='hidden_iframe' "
              );
              document.querySelector("#hiddenform").innerHTML = formCode;
              document.querySelector("#hiddenform form").submit();
              document.querySelector("#hiddenform").innerHTML = "";
            }
          });
        } else {
          alert("Please save your form code first!");
        }
      });
    });

  // Export to Google Sheets ID
  document
    .querySelector("#sendToGoogleSheets")
    .addEventListener("click", (event) => {
      const sheetID = document.querySelector("#googleSheetsURL").value;
      chrome.storage.local.get(["grouphero_token_v1"], (result) => {
        fetch(
          "https://sheets.googleapis.com/v4/spreadsheets/" +
            sheetID +
            "/values/A:A:append?valueInputOption=RAW&access_token=" +
            result.grouphero_token_v1,
          {
            method: "post",
            body: JSON.stringify({ values: realData }),
          }
        );
      });
    });

  // Close Popups
  document.querySelectorAll(".closePopup").forEach((element) => {
    element.addEventListener("click", (event) => {
      document.querySelector("#popupOverlay").style.display = "none";
      document.querySelector("#popupQuestionData").style.display = "none";
      document.querySelector("#popupExport").style.display = "none";
      document.querySelector("#popupExportForm").style.display = "none";
      document.querySelector("#popupSettings").style.display = "none";
    });
  });

  // Open Export Popup
  document.querySelector("#export").addEventListener("click", (event) => {
    document.querySelector("#popupOverlay").style.display = "block";
    document.querySelector("#popupExport").style.display = "block";
    getData();
    setTimeout(() => {
      document.querySelector("#exportLength").textContent = realData.length;
    }, 100);
  });

  // Open Export AR Form Popup
  document.querySelector("#exportForm").addEventListener("click", (event) => {
    document.querySelector("#popupOverlay").style.display = "block";
    document.querySelector("#popupExportForm").style.display = "block";
    getData();
    chrome.storage.local.get(["grouphero_form_code"], (result) => {
      document.querySelector("#htmlformcode").value =
        result.grouphero_form_code;
    });
  });

  // Export to CSV
  document.querySelector("#exportCSV").addEventListener("click", (event) => {
    setTimeout(() => {
      exportToCsv(
        `grouphero-contacts-${Date().toLocaleString()}.csv`,
        realData
      );
    }, 100);
  });

  // Open Settings Popup
  document.querySelector("#settings").addEventListener("click", (event) => {
    document.querySelector("#popupSettings").style.display = "block";
    document.querySelector("#popupOverlay").style.display = "block";
  });
});

// get data
function getData() {
  chrome.runtime.sendMessage(
    {
      type: "request",
    },
    (response) => {}
  );
}

// Save API settings and activate
function saveAPISettings(buttonID) {
  const url = "https://app.grouphero.io/api/v1/activate";
  const apiKey = document.querySelector(`${buttonID}`).value;
  const xhr = new XMLHttpRequest();

  if (buttonID === "#apiKey") {
    document.querySelector(".apiKeySettings").value = document.querySelector(
      `${buttonID}`
    ).value;
  } else if (buttonID === ".apiKeySettings") {
    document.querySelector("#apiKey").value = document.querySelector(
      `${buttonID}`
    ).value;
  }

  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(
    JSON.stringify({
      "api-key": apiKey,
    })
  );
  xhr.onload = function () {
    const data = JSON.parse(this.responseText);
    if (data.activated) {
      chrome.runtime.sendMessage(
        {
          type: "activated",
          apiKey: apiKey,
        },
        (response) => {}
      );
      alert("Connected to GroupHero Successfully!");
    } else {
      alert("API Failed.");
    }
  };
}

function saveFormCode() {
  chrome.runtime.sendMessage(
    {
      type: "save_form_code",
      formcode: document.querySelector("#htmlformcode").value,
    },
    (response) => {}
  );
}

// build table from JSON
function buildTable(data) {
  let tableBody = "";
  let count = 0;

  data.forEach((row, index) => {
    let tableRow = '<tr class="border border-gray-200 text-center">';
    tableRow += `<td class="p-2">${row.info.name}</td>`;
    tableRow += `<td class="p-2">${row.info.location}</td>`;
    tableRow += `<td class="p-2">${extractEmails(
      JSON.stringify(row.questions)
    )}</td>`;
    tableRow += `<td class="p-1"><button class="view_question rounded py-1 px-3 bg-gray-50 uppercase text-gray-600 border border-gray-200 font-medium" data-index="${index}">Answers</button></td>`;
    tableRow += `</tr>`;
    tableBody += tableRow;
    count++;
  });

  let finalTable = `<table class="table-auto rounded border border-gray-200 w-full">
  <thead class="bg-gray-100 border-b border-gray-100 font-medium">
    <tr>
      <th class="p-2">Name</th>
      <th class="p-2">Location</th>
      <th class="p-2">Email</th>
      <th class="p-2">Questions</th>
    </tr>
  </thead>
  <tbody>
    ${tableBody}
  </tbody>
</table>`;

  if (tableBody === "") {
    finalTable = "You have not collected any data yet...";
  }

  document.querySelector("#data").innerHTML = finalTable;

  document.querySelectorAll(".view_question").forEach((element) => {
    element.addEventListener("click", (event) => {
      openQuestionPopup(data[element.getAttribute("data-index")]);
    });
  });

  document.querySelector(
    "#rowCount"
  ).innerHTML = `<p>Showing All Members (${count})</p>`;
}

// find emails
function extractEmails(text) {
  return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
}

// open questions data popup
function openQuestionPopup(data) {
  document.querySelector("#popupOverlay").style.display = "block";
  document.querySelector("#popupQuestionData").style.display = "block";
  document.querySelector("#qa-name").textContent = data.info.name;
  document.querySelector("#qa-email").textContent = extractEmails(
    JSON.stringify(data.questions)
  );
  document.querySelector("#qa-location").textContent = data.info.location;

  let output = "";
  data.questions.forEach((question) => {
    output += `<div class="border border-gray-100 border-b-2 p-3 rounded mb-2">
      <h3 class="mb-1 font-medium">${question.question}</h3>
      <p class="">${question.answer}</p>
    </div>`;
  });
  document.querySelector("#qaData").innerHTML = output;
}

// export to CSV
function exportToCsv(filename, rows) {
  const processRow = function (row) {
    let finalVal = "";
    for (let [key, value] of Object.entries(row.info)) {
      finalVal += `${value.replace(",", "")}, `;
    }
    row.questions.forEach((question) => {
      for (let [key, value] of Object.entries(question)) {
        finalVal += `${value.replace(",", "")}, `;
      }
    });
    return finalVal + "\n";
  };

  let headers = "";
  for (let [key, value] of Object.entries(rows[0].info)) {
    headers += `${key}, `;
  }
  rows[0].questions.forEach((question) => {
    for (let [key, value] of Object.entries(question)) {
      headers += `${key}, `;
    }
  });
  headers += "\n";

  let csvFile = headers;
  for (let i = 0; i < rows.length; i++) {
    csvFile += processRow(rows[i]);
  }

  const blob = new Blob([csvFile], { type: "text/csv;charset=utf-8;" });
  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

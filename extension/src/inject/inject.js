chrome.extension.sendMessage({}, function (response) {
  var readyStateCheckInterval = setInterval(function () {
    if (document.readyState === "complete") {
      clearInterval(readyStateCheckInterval);
      let syncedMembers = 0;

      console.log("ran grouphero");

      // append banner to page
      const wrapper = document.createElement("div");
      wrapper.innerHTML = `<div>
        <span class="x_grouphero--blue-cirle"></span> GroupHero - Connected
      </div>
      <div class="x_grouphero--progressWrapper"></div>
      <div>
        Synced <span id="x_grouphero_synced_members">0</span> Members
      </div>`;
      wrapper.classList.add("x_grouphero--wrapper");

      document
        .querySelector(".dhix69tm")
        .insertAdjacentHTML("afterEnd", wrapper.outerHTML);

      // append bulk approval button
      const bulkApprove = document.createElement("button");
      bulkApprove.classList.add("x_grouphero--bulk-approve");
      bulkApprove.textContent = "Auto Approve All";
      bulkApprove.addEventListener("click", (event) => {
        runBulkApproval();
      });
      document
        .querySelector(".x_grouphero--wrapper")
        .querySelector("div:first-child")
        .appendChild(bulkApprove);

      // replace all approve buttons
      const allApproveButtons = document.querySelectorAll(
        '[aria-label="Approve"]'
      );

      allApproveButtons.forEach((button) => {
        button.style.display = "none";
        const newButton = document.createElement("button");
        newButton.classList.add("x_grouphero--approve");
        newButton.textContent = "Approve & Save";

        newButton.addEventListener("click", (event) => {
          const parent = newButton.closest(
            ".a8nywdso.f10w8fjw.rz4wbd8a.pybr56ya"
          );

          // get user data
          const userInfo = {
            name: parent.querySelector(
              "a.oajrlxb2.g5ia77u1.qu0x051f.esr5mh6w.e9989ue4.r7d6kgcz.rq0escxv.nhd2j8a9.nc684nl6.p7hjln8o.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.jb3vyjys.rz4wbd8a.qt6c0cv9.a8nywdso.i1ao9s8h.esuyzwwr.f1sip0of.lzcic4wl.gmql0nx0.gpro0wi8.lrazzd5p"
            ).textContent,
            location: parent.querySelector(
              "a.oajrlxb2.g5ia77u1.qu0x051f.esr5mh6w.e9989ue4.r7d6kgcz.rq0escxv.nhd2j8a9.nc684nl6.p7hjln8o.kvgmc6g5.cxmmr5t8.oygrvhab.hcukyx3x.jb3vyjys.rz4wbd8a.qt6c0cv9.a8nywdso.i1ao9s8h.esuyzwwr.f1sip0of.lzcic4wl.oo9gr5id.gpro0wi8.lrazzd5p"
            ).textContent,
          };

          // get questions & answers from user
          const list = parent.querySelector(
            ".dati1w0a.qt6c0cv9.hv4rvrfc.cxgpxx05 ul"
          );
          const questions = [];
          list.querySelectorAll("li").forEach((question) => {
            questions.push({
              question: question.querySelector("span").textContent,
              answer: question.querySelector("div").textContent,
            });
          });

          // show synced member count
          syncedMembers++;
          document.querySelector("#x_grouphero_synced_members").textContent =
            syncedMembers;

          // send data to background.js
          chrome.runtime.sendMessage(
            {
              type: "saving",
              data: {
                info: userInfo,
                questions: questions,
              },
            },
            (response) => {
              console.log(response);
            }
          );

          // click real approve button
          button.click();
        });
        button.after(newButton);
      });
    }

    function extractEmails(text) {
      return text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi);
    }

    function runBulkApproval() {
      document.querySelector(".x_grouphero--bulk-approve").style.display =
        "none";
      document.querySelector(
        ".x_grouphero--progressWrapper"
      ).innerHTML = `<div class="x_grouphero--progress x_grouphero--complete">
      <div class="x_grouphero--bar"></div>
    </div>`;
      const interval = setInterval(() => {
        const button = document.querySelector(".x_grouphero--approve");
        if (button) {
          button.click();
        } else {
          document.querySelector(".x_grouphero--progressWrapper").innerHTML =
            "";
          document.querySelector(".x_grouphero--bulk-approve").style.display =
            "inline-block";
          clearInterval(interval);
        }
      }, 5000);
    }

    function animateProgress() {}
  }, 500);
});

document.addEventListener("DOMContentLoaded", function () {
  const stickyQR = document.querySelector(".sticky-qr");
  const targetURL = "https://play.google.com/store/apps/details?id=com.labh.io&pcampaignid=web_share";

  if (stickyQR) {
    stickyQR.addEventListener("click", function () {
      window.open(targetURL, "_blank");
    });
  }
});

$("#close-sticky-qr-mobiile").click(function () {
  $(".sticky-qr-mobile").addClass("d-none");
});
$(".s-get-app, .sticky-qr-desktop").click(function () {
  window.open("https://api.labh.io/get-app/", "_blank");
});

document.addEventListener("DOMContentLoaded", function () {
  const bankSelect = document.getElementById("bank-name");
  const stateSelect = document.getElementById("state");
  const districtSelect = document.getElementById("district");
  const branchSelect = document.getElementById("branch");
  const findBtn = document.querySelector(".find-ifsc-btn");

  let selectedBankId = null;
  let selectedStateId = null;
  let selectedDistrictId = null;
  let branchesList = [];

  fetch("https://devapi.labh.io/open/api/banks")
    .then(res => res.json())
    .then(data => {
      if (!data?.banks?.length) return;
      const options = ['<option value="">Bank Name</option>'];
      data.banks.forEach(bank => {
        const [name, id] = bank;
        if (name) {
          options.push(`<option value="${id}">${name}</option>`);
        }
      });
      bankSelect.innerHTML = options.join('');
    })
    .catch(err => {
      console.error("Bank API error:", err);
    });

  bankSelect.addEventListener("change", function () {
    selectedBankId = this.value;
  stateSelect.innerHTML = `<option value="">Which state you belongs to</option>`;
  districtSelect.innerHTML = `<option value="">Choose District</option>`;
  branchSelect.innerHTML = `<option value="">Select your Bank Branch</option>`;

  selectedStateId = null;
  selectedDistrictId = null;
  branchesList = [];

  const resultContainer = document.querySelector(".pincode-info");
  resultContainer.classList.remove("d-block");
  resultContainer.classList.add("d-none");

    if (!selectedBankId) return;

    fetch(`https://devapi.labh.io/open/api/bank/location?bank_id=${selectedBankId}`)
      .then(res => res.json())
      .then(data => {
        if (!data?.states?.length) return;
        const options = ['<option value="">Which state you belongs to</option>'];
        data.states
          .sort((a, b) => a[0].localeCompare(b[0]))
          .forEach(state => {
            const [name, id] = state;
            if (name) {
              options.push(`<option value="${id}">${name}</option>`);
            }
          });
        stateSelect.innerHTML = options.join('');
      })
      .catch(err => {
        console.error("State API error:", err);
      });
  });

  stateSelect.addEventListener("change", function () {
    selectedStateId = this.value;
    districtSelect.innerHTML = `<option value="">Loading Districts...</option>`;
    branchSelect.innerHTML = `<option value="">Select your Bank Branch</option>`;

    if (!selectedBankId || !selectedStateId) return;

    fetch(`https://devapi.labh.io/open/api/bank/location?bank_id=${selectedBankId}&state_id=${selectedStateId}`)
      .then(res => res.json())
      .then(data => {
        if (!data?.districts?.length) return;
        const options = ['<option value="">Choose District</option>'];
        data.districts
          .sort((a, b) => a[0].localeCompare(b[0]))
          .forEach(district => {
            const [name, id] = district;
            if (name) {
              options.push(`<option value="${id}">${name}</option>`);
            }
          });
        districtSelect.innerHTML = options.join('');
      })
      .catch(err => {
        console.error("District API error:", err);
      });
  });

  districtSelect.addEventListener("change", function () {
    selectedDistrictId = this.value;
    branchSelect.innerHTML = `<option value="">Loading Branches...</option>`;

    if (!selectedBankId || !selectedStateId || !selectedDistrictId) return;

    fetch(`https://devapi.labh.io/open/api/bank/location?bank_id=${selectedBankId}&state_id=${selectedStateId}&district_id=${selectedDistrictId}`)
      .then(res => res.json())
      .then(data => {
        branchesList = data?.branches || [];
        const options = ['<option value="">Select your Bank Branch</option>'];
        branchesList
          .sort((a, b) => a.localeCompare(b))
          .forEach(branch => {
            options.push(`<option value="${branch}">${branch}</option>`);
          });
        branchSelect.innerHTML = options.join('');
      })
      .catch(err => {
        console.error("Branch API error:", err);
      });
  });

  findBtn.addEventListener("click", function () {
    const bank = bankSelect.options[bankSelect.selectedIndex].text;
    const state = stateSelect.options[stateSelect.selectedIndex].text;
    const district = districtSelect.options[districtSelect.selectedIndex].text;
    const branch = branchSelect.options[branchSelect.selectedIndex].text;

    const branchId = branchSelect.value;

    if (!selectedBankId || !selectedStateId || !selectedDistrictId || !branchId) {
      alert("Please select all fields to find IFSC code.");
      return;
    }

    const apiUrl = `https://devapi.labh.io/open/api/get-ifsc?state_id=${selectedStateId}&district_id=${selectedDistrictId}&bank_id=${selectedBankId}&branch=${encodeURIComponent(branch)}`;

    fetch(apiUrl)
    .then(res => res.json())
    .then(data => {
      if (!data?.ifsc) {
        alert("No IFSC data found.");
        return;
      }

      const ifscCode = data.ifsc;
      const bankname = data.bank_name.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      const branchname = data.branch.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      const address = data.address.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      const contact = data.contact.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || "N/A";
      const statename = data.state_name.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      const districtname = data.district_name.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      const cityName = data.city_name.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
      const center = data.center.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ') || cityName || "N/A";
      const circle = statename.toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' '); 

      const resultContainer = document.querySelector(".pincode-info");
      const container = document.querySelector(".search-results-container");
      console.log(resultContainer);
      console.log(container);
      resultContainer.classList.remove("d-none");
      resultContainer.classList.add("d-block");
      document.getElementById("headline").innerHTML = `<b>${branchname} IFSC code of ${bankname}</b>`;
      // resultContainer.innerHTML = document.getElementById("branch").innerText = branchName;
      document.getElementById("branch1").innerText = branchname;
      document.getElementById("centre1").innerText = center;
      document.getElementById("district1").innerText = districtname;
      document.getElementById("state1").innerText = statename;
      document.getElementById("city1").innerText = cityName;
      document.getElementById("circle1").innerText = circle;
      document.getElementById("ifsc1").innerText = ifscCode;
      document.getElementById("bank1").innerText = bankname;
      document.getElementById("Contact1").innerText = contact;
      document.getElementById("address1").innerText = address;     
    })
    .catch(err => {
      console.error("IFSC API error:", err);
      alert("Failed to fetch IFSC details.");
    });
  });
});

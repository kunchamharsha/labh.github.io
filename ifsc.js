const urlParams = new URLSearchParams(window.location.search);
const ifscParam = urlParams.get("code");

if (ifscParam) {
  fetch(`https://devapi.labh.io/open/ifsc/${ifscParam}`)
    .then(res => res.json())
    .then(data => {
      if (!data?.ifsc) {
        alert("Invalid IFSC code.");
        return;
      }

      const ifscCode = data.ifsc;
      const bankname = toTitleCase(data.bank_name);
      const branchname = toTitleCase(data.branch);
      const address = toTitleCase(data.address);
      const contact = data.contact || "N/A";
      const statename = toTitleCase(data.state_name);
      const districtname = toTitleCase(data.district_name || "N/A");
      const cityName = toTitleCase(data.city_name || "N/A");
      const center = toTitleCase(data.center  || cityName || "N/A");
      const circle = statename;

      const resultContainer = document.querySelector(".pincode-info");
      resultContainer.classList.remove("d-none");
      resultContainer.classList.add("d-block");

      document.getElementById("headline").innerHTML = `<b>${branchname} IFSC code of ${bankname}</b>`;
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
      console.error("IFSC fetch error:", err);
      alert("Failed to fetch IFSC details.");
    });
}

// helper
function toTitleCase(str) {
  return str.toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}


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
  window.open("https://devapi.labh.io/get-app/", "_blank");
});

document.addEventListener("DOMContentLoaded", function () {
  const bankSelect = document.getElementById("bank-name");
  const stateSelect = document.getElementById("state");
  const districtSelect = document.getElementById("district");
  const branchSelect = document.getElementById("branch");
  const findBtn = document.querySelector(".find-ifsc-btn");

  let selectedBank = "";
  let selectedState = "";
  let selectedDistrict = "";
  let branchesList = [];

  // Load Bank Names
  fetch("https://devapi.labh.io/open/api/banks")
    .then(res => res.json())
    .then(data => {
      if (!data?.banks?.length) return;

      const options = ['<option value="">Bank Name</option>'];
      data.banks.forEach(bankName => {
        options.push(`<option value="${bankName}">${bankName}</option>`);
      });

      bankSelect.innerHTML = options.join("");
    })
    .catch(err => {
      console.error("Bank API error:", err);
    });

  // Bank Select Change
  bankSelect.addEventListener("change", function () {
    selectedBank = this.value;

    stateSelect.innerHTML = `<option value="">Which state you belongs to</option>`;
    districtSelect.innerHTML = `<option value="">Choose District</option>`;
    branchSelect.innerHTML = `<option value="">Select your Bank Branch</option>`;
    branchesList = [];

    const resultContainer = document.querySelector(".pincode-info");
    resultContainer.classList.remove("d-block");
    resultContainer.classList.add("d-none");

    fetch(`https://devapi.labh.io/open/api/bank/location?bank=${selectedBank}`)
      .then(res => res.json())
      .then(data => {
        if (!data?.states?.length) return;

        const options = ['<option value="">Which state you belongs to</option>'];
        data.states
          .sort((a, b) => a.localeCompare(b))
          .forEach(stateName => {
            options.push(`<option value="${stateName}">${stateName}</option>`);
          });

        stateSelect.innerHTML = options.join('');
      })
      .catch(err => {
        console.error("State API error:", err);
      });
  });

  // State Select Change
  stateSelect.addEventListener("change", function () {
    selectedState = this.value;

    districtSelect.innerHTML = `<option value="">Loading Districts...</option>`;
    branchSelect.innerHTML = `<option value="">Select your Bank Branch</option>`;

    fetch(`https://devapi.labh.io/open/api/bank/location?bank=${selectedBank}&state=${selectedState}`)
      .then(res => res.json())
      .then(data => {
        const options = ['<option value="">Choose District</option>'];
        data.districts
          .sort((a, b) => a.localeCompare(b))
          .forEach(districtName => {
            options.push(`<option value="${districtName}">${districtName}</option>`);
          });

        districtSelect.innerHTML = options.join('');
      })
      .catch(err => {
        console.error("District API error:", err);
      });
  });

  // District Select Change
  districtSelect.addEventListener("change", function () {
    selectedDistrict = this.value;

    branchSelect.innerHTML = `<option value="">Loading Branches...</option>`;

    if (!selectedBank || !selectedState || !selectedDistrict) return;

    fetch(`https://devapi.labh.io/open/api/bank/location?bank=${selectedBank}&state=${selectedState}&district=${selectedDistrict}`)
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

  // Find IFSC Button
  findBtn.addEventListener("click", function () {
    const branchname = branchSelect.value;

    if (!selectedBank || !selectedState || !selectedDistrict || !branchname) {
      alert("Please select all fields to find IFSC code.");
      return;
    }

    const apiUrl = `https://devapi.labh.io/open/api/get-ifsc?state=${selectedState}&district=${selectedDistrict}&bank=${selectedBank}&branch=${encodeURIComponent(branchname)}`;

    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        if (!data?.ifsc) {
          alert("No IFSC data found.");
          return;
        }
        console.log("IFSC data:", data);
        const ifscCode = data.ifsc;
        const format = str =>
          str?.toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ') || "N/A";

        const bankname = format(data.bank);
        const branchname = format(data.branch);
        const address = format(data.address);
        const contact = format(data.contact);
        const statename = format(data.state);
        const districtname = format(data.district);
        const cityName = format(data.city);
        const center = format(data.center) || cityName;
        const circle = format(statename);

        const resultContainer = document.querySelector(".pincode-info");
        resultContainer.classList.remove("d-none");
        resultContainer.classList.add("d-block");

        document.getElementById("headline").innerHTML = `<b>${branchname} IFSC code of ${bankname}</b>`;
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



//seo
  (function () {
    const url = new URL(window.location.href);
    const codeParam = url.searchParams.get("code");
    if (codeParam) {
      const canonicalLink = document.querySelector("#canonical-link");
      if (canonicalLink) {
        canonicalLink.setAttribute(
          "href",
          `https://labh.io/ifsc/?code=${encodeURIComponent(codeParam)}`
        );
      }
    }
  })();

  (function () {
    const url = new URL(window.location.href);
    const codeParam = url.searchParams.get("code");

    if (codeParam) {
      // Dynamically set the page <title>
      document.title = `IFSC Code: ${codeParam} | Labh`;

      // Optionally also update the canonical link
      const canonicalLink = document.querySelector("#canonical-link");
      if (canonicalLink) {
        canonicalLink.setAttribute(
          "href",
          `https://labh.io/ifsc/?code=${encodeURIComponent(codeParam)}`
        );
      }
    }
  })();




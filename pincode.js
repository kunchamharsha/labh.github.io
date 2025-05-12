
  
let lastSelectedOffice = null;
document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    const pinParam = params.get("pin");
    
    if (searchParam) {
        fetch(`https://devapi.labh.io/post-office/${searchParam}`)
            .then(res => res.json())
            .then(data => {
                if (data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
                    const office = data[0].PostOffice[0]; // Show first match
                    updateSearchResult(office);
                } else {
                    showNoResults(); // fallback
                }
            });
    } else if (pinParam) {
        fetch(`https://devapi.labh.io/pin-code/${pinParam}`)
            .then(res => res.json())
            .then(data => {
                if (data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice.length > 0) {
                    const office = data[0].PostOffice[0];
                    updateSearchResult(office);
                } else {
                    showNoResults(); // fallback
                }
            });
    }
    
    function showNoResults() {
        const container = document.querySelector(".search-results-container");
        const mobile = document.querySelector(".pincode-info");
    
        if (window.innerWidth <= 1280) {
            mobile.style.display = "block";
            mobile.querySelector(".result2").innerHTML = `<b>No results found</b>`;
            mobile.querySelector(".info-table").innerHTML = "";
        } else {
            container.style.display = "block";
            container.querySelector(".result1").innerHTML = `<b>No results found</b>`;
            container.querySelector(".info-grid").innerHTML = "";
        }
    }
    

    const searchBar = document.getElementById("searchBar");
    const suggestions = document.getElementById("suggestions");
    const resultContainer = document.querySelector(".search-results-container");
    const mobileContainer = document.querySelector(".pincode-info");

    resultContainer.style.display = "none"; // Hide by default

    function isMobileScreen() {
        return window.innerWidth <= 1280;
    }

    if (isMobileScreen()) {
        mobileContainer.style.display = "none"; // Hide results on mobile
    }

    let debounceTimer;
searchBar.addEventListener("input", function () {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        const query = searchBar.value.trim().toLowerCase();

        suggestions.innerHTML = "";

        if (query === "") {
            suggestions.classList.remove("active");
            suggestions.style.display = "none";
            return;
        }

        if (query.length < 3) {
            suggestions.innerHTML = "<li style='color: #aaa; padding: 0.75rem;'>Please enter at least 3 characters</li>";
            suggestions.classList.add("active");
            suggestions.style.display = "block";
            return;
        }

        const addedOffices = new Set();

        fetch(`https://api.postalpincode.in/postoffice/${query}`)
            .then(res => res.json())
            .then(data => {
                if (data[0].Status === "Success") {
                    const filtered = data[0].PostOffice.filter(office =>
                        office.Name.toLowerCase().startsWith(query)
                    );

                    if (filtered.length > 0) {
                        suggestions.classList.add("active");
                        suggestions.style.display = "block";

                        filtered.forEach(office => {
                            if (addedOffices.has(office.Name)) return;

                            addedOffices.add(office.Name);

                            const li = document.createElement("li");
                            li.textContent = office.Name + " (" + office.District + ")";
                            li.dataset.office = JSON.stringify(office);

                            li.addEventListener("click", function () {
                                const selected = JSON.parse(this.dataset.office);

                                searchBar.value = "";
                                suggestions.innerHTML = "";
                                suggestions.classList.remove("active");
                                suggestions.style.display = "none";

                                updateSearchResult(selected);
                            });

                            suggestions.appendChild(li);
                        });
                    } else {
                        suggestions.innerHTML = "<li>No matching results</li>";
                        suggestions.classList.add("active");
                        suggestions.style.display = "block";
                    }
                } else {
                    suggestions.innerHTML = "<li>No results found</li>";
                    suggestions.classList.add("active");
                    suggestions.style.display = "block";
                }
            });
    }, 500);
});


    function updateSearchResult(office) {
        resultContainer.style.display = "block";
        lastSelectedOffice = office;

        const infoHTML = `
            <div><span class="f1">Office</span><strong>${office.Name}</strong></div>
            <div><span class="f2">State</span><strong>${office.State}</strong></div>
            <div><span class="f1">Pincode</span><strong>${office.Pincode}</strong></div>
            <div><span class="f2">Country</span><strong>${office.Country}</strong></div>
            <div><span class="f1">Taluk</span><strong>${office.Taluk || "NA"}</strong></div>
            <div><span class="f2">Telephone No.</span><strong>${office.Telephone || "NA"}</strong></div>
            <div><span class="f1">Divison</span><strong>${office.Division}</strong></div>
            <div><span class="f2">Office Type</span><strong>${office.BranchType}</strong></div>
            <div><span class="f1">District</span><strong>${office.District}</strong></div>
            <div><span class="f2">Delivery Status</span><strong>${office.DeliveryStatus}</strong></div>
            <div><span class="f1">Region</span><strong>${office.Region}</strong></div>
            <div><span class="f2">Related sub office</span><strong>${office.SubOffice || "NA"}</strong></div>
            <div><span class="f1">Circle</span><strong>${office.Circle}</strong></div>
            <div><span class="f2">Related Head Office</span><strong>${office.HeadOffice || "NA"}</strong></div>
        `;

        if (isMobileScreen()) {
            mobileContainer.style.display = "block";
            document.querySelector(".search-results-container").style.display = "none";
            const mobile = document.querySelector(".pincode-info");
            mobile.style.display = "block";
            mobile.querySelector(".result2").innerHTML =
                `<b>${office.Name}</b> Pin Code is <b>${office.Pincode}</b>. ${office.Name} comes under <b>${office.District}</b> district.`;
            mobile.querySelector(".info-table").innerHTML = infoHTML;
        } else {
            document.querySelector(".pincode-info").style.display = "none";
            const container = document.querySelector(".search-results-container");
            container.style.display = "block";
            container.querySelector(".result1").innerHTML =
                `<b>${office.Name}</b> Pin Code is <b>${office.Pincode}</b>. ${office.Name} comes under <b>${office.District}</b> district.`;
            container.querySelector(".info-grid").innerHTML = infoHTML;
        }
    }

    window.addEventListener("resize", () => {
        if (lastSelectedOffice) {
            updateSearchResult(lastSelectedOffice);
        }
    });
});

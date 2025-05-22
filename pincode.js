
  
let lastSelectedOffice = null;
document.addEventListener("DOMContentLoaded", function () {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get("search");
    const pinParam = params.get("pin");
    
    if (searchParam) {
        fetch(`https://api.labh.io/post-office/${searchParam}`)
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
        fetch(`https://api.labh.io/pin-code/${pinParam}`)
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

        fetch(`https://api.labh.io/post-office/${query}`)
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

searchBar.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        const firstSuggestion = suggestions.querySelector("li");
        if (firstSuggestion && firstSuggestion.dataset.office) {
            e.preventDefault(); // Prevent default Enter behavior
            firstSuggestion.click(); // Trigger selection
        }
    }
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
        //seo
        document.title = `${office.Pincode} – ${office.Name} Pin Code | Labh`;
        // ✅ Dynamically update meta description
        let descriptionTag = document.querySelector('meta[name="description"]');
        if (!descriptionTag) {
            descriptionTag = document.createElement('meta');
            descriptionTag.name = "description";
            document.head.appendChild(descriptionTag);
            }
            descriptionTag.content = `${office.Name} (${office.Pincode}) is a post office located in ${office.District}, ${office.State}, India. Explore details like office type, region, and delivery status.`;

            // ✅ Dynamically update canonical link
            let canonicalLink = document.querySelector('link[rel="canonical"]');
            if (!canonicalLink) {
              canonicalLink = document.createElement('link');
               canonicalLink.rel = "canonical";
                document.head.appendChild(canonicalLink);
            }
            const currentURL = new URL(window.location.href);
            const basePath = `${currentURL.origin}${currentURL.pathname}`;
            canonicalLink.href = `${basePath}?pin=${office.Pincode}`;
            function setOrUpdateMeta(property, content, isOG = true) {
                const attr = isOG ? "property" : "name";
                let metaTag = document.querySelector(`meta[${attr}="${property}"]`);
                if (!metaTag) {
                    metaTag = document.createElement('meta');
                    metaTag.setAttribute(attr, property);
                    document.head.appendChild(metaTag);
                }
                metaTag.setAttribute("content", content);
            }
            
            // ✅ Set dynamic OG tags
            setOrUpdateMeta("og:title", `${office.Name} Pin Code | ${office.District}, ${office.State}`);
            setOrUpdateMeta("og:description", `${office.Name} has a pin code of ${office.Pincode}. Located in ${office.District}, ${office.State}.`);
            setOrUpdateMeta("og:url", window.location.href);
            setOrUpdateMeta("og:type", "website");
            
            // You can optionally update image too
            setOrUpdateMeta("og:image", "https://labh.io/assets/logo_final.png");
           
            // ✅ Set dynamic Twitter Card tags
            setOrUpdateMeta("twitter:card", "summary");
            setOrUpdateMeta("twitter:title", `${office.Name} Pin Code | ${office.District}, ${office.State}`, false);
            setOrUpdateMeta("twitter:description", `${office.Name} has a pin code of ${office.Pincode}. Located in ${office.District}, ${office.State}.`, false);
            setOrUpdateMeta("twitter:image", "https://labh.io/assets/logo_final.png", false);
            setOrUpdateMeta("twitter:url", window.location.href, false);

            // ✅ Add structured data dynamically using JSON-LD
            function addJsonLdPostalData(office) {
             const scriptId = "structured-postoffice-data";

             // Remove existing structured data if present
                const existing = document.getElementById(scriptId);
                if (existing) existing.remove();

                const jsonLd = {
                 "@context": "https://schema.org",
                    "@type": "PostOffice",
                    "name": office.Name,
                    "address": {
                     "@type": "PostalAddress",
                     "addressLocality": office.Taluk || office.District,
                     "addressRegion": office.State,
                        "postalCode": office.Pincode,
                    "addressCountry": office.Country
                 },
                    "telephone": office.Telephone || "Not available",
                    "areaServed": office.Region,
                    "branchCode": office.BranchType,
                    "parentOrganization": office.Circle
                };

                const script = document.createElement("script");
                 script.id = scriptId;
                 script.type = "application/ld+json";
                    script.textContent = JSON.stringify(jsonLd);
                    document.head.appendChild(script);
}

        // 👇 Call this at the end of updateSearchResult()
            addJsonLdPostalData(office);

        }

    window.addEventListener("resize", () => {
        if (lastSelectedOffice) {
            updateSearchResult(lastSelectedOffice);
        }
    });
});




  document.addEventListener("DOMContentLoaded", function () {
    const stickyQR = document.querySelector(".sticky-qr");
    const targetURL = "https://play.google.com/store/apps/details?id=com.labh.io&pcampaignid=web_share";

    if (stickyQR) {
      stickyQR.addEventListener("click", function () {
        window.open(targetURL, "_blank");
      });
    }
  });


//   document.addEventListener("DOMContentLoaded", function () {
//     const stickyQR = document.querySelector(".sticky-qr-mobile");
//     const targetURL = "https://play.google.com/store/apps/details?id=com.labh.io&pcampaignid=web_share";

//     if (stickyQR) {
//       stickyQR.addEventListener("click", function () {
//         window.open(targetURL, "_blank");
//       });
//     }
//   });
$("#close-sticky-qr-mobiile").click(function () {
    $(".sticky-qr-mobile").addClass("d-none");
});
$(".s-get-app, .sticky-qr-desktop").click(function () {
    window.open("https://api.labh.io/get-app/", "_blank");
});

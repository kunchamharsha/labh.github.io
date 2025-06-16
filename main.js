if (typeof domain == "undefined") {
    window.domain = "https://api.labh.io";
}
const calculators = [
    {
        "card-heading": "Retirement calculator",
        "card-description": "Estimate your savings for a secure retirement.",
        url: "/calculator/retirement-calculator/",
    },
    {
        "card-heading": "Education fees calculator",
        "card-description": "Plan for your child’s education costs.",
        url: "/calculator/education-fees-calculator/",
    },
    {
        "card-heading": "SIP returns calculator",
        "card-description": "Estimate Your Investment Growth.",
        url: "/calculator/sip-calculator/",
    },
    {
        "card-heading": "Fixed deposit return calculator",
        "card-description": "Calculate Your Fixed Deposit Growth.",
        url: "/calculator/fixed-deposit-calculator/",
    },
    {
        "card-heading": "Lumpsum calculator",
        "card-description": "Estimate Your Investment Returns.",
        url: "/calculator/lumpsum-calculator/",
    },
    {
        "card-heading": "PF calculators",
        "card-description": "Estimate Your PF Growth.",
        url: "/calculator/pf-calculator/",
    },
    {
        "card-heading": "NPS calculator",
        "card-description": "Plan Your Retirement Savings.",
        url: "/calculator/nps-calculator/",
    },
    {
        "card-heading": "Personal loan calculator",
        "card-description": "Calculate Your Loan EMI.",
        url: "/calculator/personal-loan-calculator/",
    },
    {
        "card-heading": "Credit card debt calculator",
        "card-description": "Manage Your Debt Smartly.",
        url: "/calculator/credit-card-debit-calculator/",
    },
    {
        "card-heading": "Car loan calculator",
        "card-description": "Estimate Your Monthly EMI.",
        url: "/calculator/car-loan-calculator/",
    },
    {
        "card-heading": "Bike cost calculator",
        "card-description": "Estimate Your Total Bike Expense.",
        url: "/calculator/bike-loan-calculator/",
    },
    {
        "card-heading": "House calculator",
        "card-description": "Estimate Your Home Investment.",
        url: "/calculator/home-loan-calculator/",
    },
    {
        "card-heading": "PPF Calculator",
        "card-description": "Estimate Your PPF Growth.",
        url: "/calculator/ppf-calculator/",
    },
    // {
    //     "card-heading": "Sip step up calculator",
    //     "card-description": "Grow Your Investments with Incremental SIPs.",
    //     url: "/calculator/stepup-sip-calculator/",
    // },
];

const blogs = [
    {
        heading: "Atal Pension Yojana",
        url: "/savings-schemes/Atal-Pension-Yojana",
    },
    {
        heading: "Kisan Vikas Patra",
        url: "/savings-schemes/Kisan-Vikas-Patra",
    },
    {
        heading: "National Savings Certificate",
        url: "/savings-schemes/National-Savings-Certificate",
    },
    {
        heading: "Post Office Monthly Income Scheme",
        url: "/savings-schemes/Post-Office-Monthly-Income-Scheme",
    },
    {
        heading: "Post Office Recurring Deposit Scheme",
        url: "/savings-schemes/Post-Office-Recurring-Deposit",
    },
    {
        heading: "Pradhan Mantri Vaya Vandana Yojana Scheme",
        url: "/savings-schemes/Pradhan-Mantri-Vaya-Vandana-Yojana",
    },
    {
        heading: "Public Provident Fund Scheme",
        url: "/savings-schemes/Public-Provident-Fund",
    },
    {
        heading: "Rural Post Office Time Deposit Scheme",
        url: "/savings-schemes/Rural-Post-Office-Time-Deposit",
    },
    {
        heading: "Senior Citizens Savings Scheme Scheme",
        url: "/savings-schemes/Senior-Citizens-Savings-Scheme",
    },
 {
        heading: "Sukanya Samriddhi Yojana Scheme",
        url: "/savings-schemes/Sukanya-Samriddhi-Yojana",
    }
];

function filterCalculators(searchTerm) {
    if (!searchTerm || searchTerm.trim() === "") {
        return [];
    }

    const lowerSearchTerm = searchTerm.toLowerCase();

    return calculators.filter(
        (calculator) =>
            calculator["card-heading"]
                .toLowerCase()
                .includes(lowerSearchTerm) ||
            calculator["card-description"]
                .toLowerCase()
                .includes(lowerSearchTerm)
    );
}

// why window.innerWidth < 1024
// because we want to show this in the mobile view of the calculator index page
if (window.location.pathname != "/calculator/" || window.innerWidth < 1200) {
    $("#search").on("input", function () {
        const searchTerm = $(this).val();
        const filteredCalculators = filterCalculators(searchTerm);
        $(".search-dropdown").empty();
        $(".search-bar").removeClass("hide-icon");
        if (filteredCalculators.length != 0) {
            $(".search-dropdown").removeClass("display-none");
            filteredCalculators.forEach((calculator) => {
                const dropdownItem = `
                    <div onclick="window.location.href='${calculator["url"]}'">
                        <img src="/assets/search_dropdown_arrow.svg" alt="dropdown-arrow" />
                        <span>${calculator["card-heading"]}</span>
                    </div>
                `;
                $(".search-dropdown").append(dropdownItem);
            });
        } else if (searchTerm.length == 0) {
            $(".search-dropdown").addClass("display-none");
        } else {
            $(".search-dropdown").removeClass("display-none");
            const dropdownItem = `
                    <div>
                        <span class='no-results'>No results for '<span>${searchTerm}<span>'</span>
                    </div>
                `;
            $(".search-dropdown").append(dropdownItem);
        }
    });

    $("#search2").on("input", function () {
        const searchTerm = $(this).val();
        const filteredCalculators = filterCalculators(searchTerm).slice(0, 3);
        if (filteredCalculators.length != 0) {
            $("#search-results").empty();
            $("#search-results").removeClass("display-none");
            $(".blur-effect").removeClass("display-none");
            filteredCalculators.forEach((calculator) => {
                const card = `
                    <div class="card" onclick="window.location.href='${calculator["url"]}'">
                        <img src="/assets/card-edge-image.svg" alt="edge-image">
                        <img src="/assets/card-edge-image.svg" alt="edge-image">
                        <img src="/assets/calculator-arrow.svg" alt="calculator-arrow">
                        <div class="card-heading">${calculator["card-heading"]}</div>
                        <div class="card-description">${calculator["card-description"]}</div>
                    </div>
                `;
                $("#search-results").append(card);
            });

            // $(".blur-effect").height(
            //     window.innerHeight -
            //         $("#search-results").outerHeight(true) -
            //         $("nav").outerHeight(true) -
            //         $(".black-container").outerHeight(true) -
            //         $('.menu-bar').outerHeight(true)
            // );
        } else {
            $("#search-results").addClass("display-none");
            if (window.location.pathname != "/calculator/") {
                $(".blur-effect").addClass("display-none");
            }
        }
    });
}

// if someone clicks outside the search bar, we want to close the dropdown
$(".blur-effect").on("click", function () {
    $("#search-results").addClass("display-none");
    $(".blur-effect").addClass("display-none");
});

$(".faq-question").click(function () {
    var $item = $(this).closest(".faq-item");

    $(".faq-item").not($item).removeClass("open");

    $item.toggleClass("open");
});

// we want to close the dropdown on clicking the x in search
$(".search-bar").on("click", function (e) {
    const rect = $(this)[0].getBoundingClientRect();
    const x = e.clientX - rect.left;

    if (x > 390 && window.innerWidth > 1024) {
        $(".search-dropdown").addClass("display-none");
        $(".search-bar").addClass("hide-icon");
        $("#search").val("");
    }
});

function saveSessionWithTimeout(key, value, timeoutMs) {
    const now = Date.now();
    const item = {
        value: value,
        expiry: now + timeoutMs,
    };
    sessionStorage.setItem(key, JSON.stringify(item));
}

function getSessionWithTimeout(key) {
    const itemStr = sessionStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    const now = Date.now();

    if (now > item.expiry) {
        sessionStorage.removeItem(key);
        return null;
    }
    return item.value;
}

function fetchBaskets() {
    var baskets = getSessionWithTimeout("baskets");
    if (baskets) {
        return baskets;
    }
    $.get(`${domain}/api/basket/`, function (data) {
        saveSessionWithTimeout("baskets", data, 86400000);
        baskets = data;
    });
    return baskets;
}

const baskets = fetchBaskets();
var searchSuggestion = "all";

function renderSearchDropdown() {
    $(".calculator-list").empty();
    calculators.forEach((calculator) => {
        $(".calculator-list").append(`
                <div class="calculator" onclick="window.location.href='${calculator["url"]}'">
                    <img src="/assets/search_dropdown_arrow.svg" alt="dropdown-arrow" />
                    <span>${calculator["card-heading"]}</span>
                </div>
            `);
    });
}

function renderSearchResults(results, queryText) {
    $(".calculator-list").empty();
    $(".search-dropdown-desktop").removeClass("d-none");
    if (results.length == 0 && queryText.length > 0) {
        $(".calculator-list").append(`
            <div class="no-results">
                <span>No results for '<span>${queryText}<span>'</span>
            </div>
        `);
        return;
    }
    results.forEach((result) => {
        $(".calculator-list").append(`
                <div class="calculator" onclick="window.location.href='${result["url"]}'">
                    <img src="/assets/search_dropdown_arrow.svg" alt="dropdown-arrow" />
                    <span>${result["heading"]}</span>
                </div>
            `);
    });
}

$("#search, #mobile-search").focus(function () {
    $(".search-dropdown-desktop").removeClass("d-none");
    renderDropdownWithSuggestion();
});

$(document).on("click", function (event) {
    if (!$(event.target).closest(".search-bar-container").length) {
        $(".search-dropdown-desktop").addClass("d-none");
    }
});

function fetchMutualFunds(searchQuery) {
    let results = [];
    if (searchQuery.length == 0) {
        return results;
    }
    $.ajax({
        url: `${domain}/search/mutual-funds/?scheme_name=${encodeURIComponent(
            searchQuery
        )}&page=1&page_size=7`,
        method: "GET",
        async: false,
        success: function (responseData) {
            results = responseData.results;
        },
        error: function (xhr, status, error) {
            results = [];
        },
    });
    return results;
}

function formatResutls(results) {
    let formattedResults = [];
    results.forEach((result) => {
        if ("scheme_name" in result) {
            formattedResults.push({
                heading: result.scheme_name,
                url: `/mutual-fund/?id=${result.id}`,
            });
        } else if ("card-heading" in result) {
            formattedResults.push({
                heading: result["card-heading"],
                url: result.url,
            });
        } else {
            formattedResults.push({
                heading: result.heading,
                url: result.url,
            });
        }
    });
    return formattedResults;
}

function search(queryText) {
    const filteredCalculators = filterCalculators(searchTerm);
    const filteredBlogs = blogs.filter((blog) =>
        blog["heading"].toLowerCase().includes(queryText.toLowerCase())
    );
    let results = [
        ...filteredCalculators.slice(0, 5),
        ...filteredBlogs.slice(0, 5),
    ];
    if (searchSuggestion == "all") {
        const mutualFunds = fetchMutualFunds(queryText);
        const slice = 10 - results.length;
        results = [...results, ...mutualFunds.slice(0, slice)];
    } else if (searchSuggestion == "calculators") {
        results = filteredCalculators;
    } else if (searchSuggestion == "blogs") {
        results = filteredBlogs;
    } else if (searchSuggestion == "mutual-funds") {
        results = fetchMutualFunds(queryText);
    }
    const formattedResults = formatResutls(results);
    renderSearchResults(formattedResults, queryText);
}

let debounceTimer;
let searchTerm;

function renderDropdownWithSuggestion() {
    if (searchSuggestion == "all") {
        renderSearchDropdown();
        $(".search-dropdown-desktop .label, .label-change").text("Labh Calculators");
        $('.basket-explore').removeClass('d-none');
        $('.label-explore').removeClass('d-none');
    } else if (searchSuggestion == "mutual-funds") {
        const mutualFunds = fetchMutualFunds("other");
        const formattedResults = formatResutls(mutualFunds);
        renderSearchResults(formattedResults, "other");
        $(".search-dropdown-desktop .label, .label-change").text("Mutual Funds");
        $('.basket-explore').addClass('d-none');
        $('.label-explore').addClass('d-none');
    } else if (searchSuggestion == "blogs") {
        const formattedResults = formatResutls(blogs.slice(0, 5));
        renderSearchResults(formattedResults, "other");
        $(".search-dropdown-desktop .label, .label-change").text("Blogs");
        $('.basket-explore').addClass('d-none');
        $('.label-explore').addClass('d-none');
    } else if (searchSuggestion == "calculators") {
        renderSearchDropdown();
        $(".search-dropdown-desktop .label, .label-change").text("Labh Calculators");
        $('.basket-explore').addClass('d-none');
        $('.label-explore').addClass('d-none');
    }
}

$("#search, #mobile-search").keyup(function () {
    searchTerm = $(this).val();
    if (searchTerm.length > 0) {
        $(".suggestion").addClass("d-none");
        $(".label").addClass("d-none");
        $(".search-dropdown-desktop").addClass("d-none");
        $(".basket-explore").addClass("d-none");
        $(".search-suggestions").addClass("d-none");
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            search(searchTerm);
        }, 500);
    } else {
        $(".suggestion").removeClass("d-none");
        $(".label").removeClass("d-none");
        $(".basket-explore").removeClass("d-none");
        $(".search-suggestions").removeClass("d-none");
    }
});

// this will set searchsuggestion
$(".suggestion .suggestion-item, .search-suggestions .item").click(function () {
    searchSuggestion = $(this).attr("d-value");
    $(".suggestion .suggestion-item").removeClass("active");
    $(".search-suggestions .item").removeClass("active");
    $(this).addClass("active");
    renderDropdownWithSuggestion();
});

$(".mobile-search-input-container img").click(function () {
    $(".search-mobile").addClass("d-none");
    document.body.style.overflow = 'auto';
    $(".search-dropdown-desktop").addClass("d-none");
    $('.main-container').css('overflow', 'auto');
});

$(".mobile-search-icon img").click(function () {  // this is close
    fetchBasketsPerformance();
    renderDropdownWithSuggestion();

    document.body.style.overflow = 'hidden';
    $(".search-mobile").removeClass("d-none");
    $(".search-dropdown-desktop").addClass("d-none");
    $('.main-container').css('overflow', 'hidden');
});

function fetchBasketsPerformance() {
    let winWidth = window.innerWidth;

    if (winWidth < 745) {
        $.get(`${domain}/open/basket-returns`, function (response) {
            $(".basket-explore").empty();
            const keys = Object.keys(response);
            console.log(response);
            keys.forEach((key) => {
                const component = `
                    <div class="item">
                        <div class="title">${key}</div>
                        <div class="performance d-flex">
                            Performance at <span>${response[key]}</span><img src="/assets/ant-design_stock-outlined.svg" alt="stock">
                        </div>
                    </div>
                `;
                $(".basket-explore").append(component);
            });
        });
    }
}

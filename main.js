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
    // {
    //     "card-heading": "Sip step up calculator",
    //     "card-description": "Grow Your Investments with Incremental SIPs.",
    //     url: "/calculator/stepup-sip-calculator/",
    // },
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

    if ((x > 390 && window.innerWidth > 1024) || true) {
        $(".search-dropdown").addClass("display-none");
        $(".search-bar").addClass("hide-icon");
        $("#search").val("");
    }
});

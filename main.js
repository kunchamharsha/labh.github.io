const calculators = [
    {
        "card-heading": "Retirement calculator",
        "card-description": "Estimate your savings for a secure retirement.",
    },
    {
        "card-heading": "Education fees calculator",
        "card-description": "Plan for your child’s education costs.",
    },
    {
        "card-heading": "SIP returns calculator",
        "card-description": "Estimate Your Investment Growth.",
    },
    {
        "card-heading": "Fixed deposit return calculator",
        "card-description": "Calculate Your Fixed Deposit Growth.",
    },
    {
        "card-heading": "Lumpsum calculator",
        "card-description": "Estimate Your Investment Returns.",
    },
    {
        "card-heading": "PF calculators",
        "card-description": "Estimate Your PF Growth.",
    },
    {
        "card-heading": "NPS calculator",
        "card-description": "Plan Your Retirement Savings.",
    },
    {
        "card-heading": "Personal loan calculator",
        "card-description": "Calculate Your Loan EMI.",
    },
    {
        "card-heading": "Credit card debt calculator",
        "card-description": "Manage Your Debt Smartly.",
    },
    {
        "card-heading": "Car loan calculator",
        "card-description": "Estimate Your Monthly EMI.",
    },
    {
        "card-heading": "Bike cost calculator",
        "card-description": "Estimate Your Total Bike Expense.",
    },
    {
        "card-heading": "House calculator",
        "card-description": "Estimate Your Home Investment.",
    },
    {
        "card-heading": "Sip step up calculator",
        "card-description": "Grow Your Investments with Incremental SIPs.",
    },
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

if (window.location.pathname != "/calculator/") {
    $("#search2").on("input", function () {
        const searchTerm = $(this).val();
        const filteredCalculators = filterCalculators(searchTerm);
        if (filteredCalculators.length != 0) {
            $(".cards").empty();
            $(".cards").removeClass("display-none");
            $(".blur-effect").removeClass("display-none");
            filteredCalculators.forEach((calculator) => {
                const card = `
                    <div class="card">
                        <img src="/assets/card-edge-image.svg" alt="edge-image">
                        <img src="/assets/card-edge-image.svg" alt="edge-image">
                        <img src="/assets/calculator-arrow.svg" alt="calculator-arrow">
                        <div class="card-heading">${calculator["card-heading"]}</div>
                        <div class="card-description">${calculator["card-description"]}</div>
                    </div>
                `;
                $(".cards").append(card);
            });

            // $(".blur-effect").height(
            //     window.innerHeight -
            //         $("#search-results").outerHeight(true) -
            //         $("nav").outerHeight(true) -
            //         $(".black-container").outerHeight(true) -
            //         $('.menu-bar').outerHeight(true)
            // );
        } else {
            $(".cards").addClass("display-none");
            $(".blur-effect").addClass("display-none");
        }
    });
}

$(".faq-question").click(function () {
    var $item = $(this).closest(".faq-item");

    $(".faq-item").not($item).removeClass("open");

    $item.toggleClass("open");
});

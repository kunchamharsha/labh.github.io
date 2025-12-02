const domain = "https://api.labh.io";

function setMetaTag(attrName, attrValue, content) {
    let tag = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attrName, attrValue);
        document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
}

function getXaxisCategories(priceData) {
    const xAxisCategories = [];
    for (let i = 0; i < priceData.length; i++) {
        const date = new Date(priceData[i][1]);
        const month = date.toLocaleString("default", {
            month: "short",
            day: "numeric",
        });
        const year = date.getFullYear();
        xAxisCategories.push(`${month} ${year}`);
    }
    return xAxisCategories;
}

function filterPriceData(year) {
    if (priceData.length === 0) {
        return [];
    }
    lastDateAvailable = new Date(priceData.at(-1)[1]);
    if (year === 0) {
        return priceData;
    }
    const endDate = new Date(
        new Date(lastDateAvailable).setFullYear(
            new Date(lastDateAvailable).getFullYear() - year
        )
    );
    const filteredData = priceData.filter((item) => {
        const date = new Date(item[1]);
        return date >= endDate;
    });
    return filteredData;
}

function toTitleCase(text) {
    return text
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function renderChart(data, year) {
    priceData = data.price_data;
    series = filterPriceData(year);

    const xAxisCategories = getXaxisCategories(series);

    const fontSize = $(window).width() < 745 ? "8px" : "12px";

    var options = {
        series: [
            {
                name: "NAV",
                data: series.map((item) => item[0]),
            },
        ],
        chart: {
            height: "100%",
            type: "line",
            zoom: {
                enabled: false,
            },
            toolbar: {
                show: false,
            },
            events: {
                mounted: function () {
                    document.getElementById("chart-loader").style.display =
                        "none";
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: "smooth",
            width: 3,
        },
        grid: {
            show: true,
            borderColor: "#FFFFFF99",
            xaxis: {
                lines: {
                    show: false,
                },
            },
            yaxis: {
                lines: {
                    show: false,
                },
            },
        },
        tooltip: {
            theme: "dark",
        },
        fill: {
            colors: ["#63E4BF"],
        },
        xaxis: {
            categories: xAxisCategories,
            labels: {
                show: false,
            },
            axisBorder: {
                show: true,
                color: "#FFFFFF99",
                offsetX: 0,
                offsetY: 0,
                strokeDashArray: 4,
            },
            axisTicks: {
                show: false,
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: "white",
                    fontSize: fontSize,
                },
            },
            axisBorder: {
                show: true,
                color: "white",
                offsetX: 0,
                offsetY: 0,
            },
            axisTicks: {
                show: false,
            },
        },
        responsive: [
            {
                breakpoint: 744,
                options: {
                    chart: {
                        height: "266px",
                    },
                },
            },
        ],
    };
    if (chart == null) {
        chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
    } else {
        chart.updateOptions({
            xaxis: {
                categories: xAxisCategories,
            },
            series: [
                {
                    name: "NAV",
                    data: series.map((item) => item[0]),
                },
            ],
        });
    }
}

const params = new URLSearchParams(window.location.search);
const fundId = params.get("id");
var priceData = [];
let data = null;
var chart = null;
var sip = true;
var year = 1;

$.get(`${domain}/api/mutual-funds/all/${fundId}/`, function (responseData) {
    data = responseData;

    setMetaTag(
        "name",
        "description",
        `Get the latest data on ${data.scheme_name} including NAV (${data.cagr["1_year"]}), 1-year return (${data.cagr["1_year"]}), and category insights. Compare performance and analyze fund history.`
    );
    setMetaTag(
        "name",
        "keywords",
        `${data.scheme_name}, mutual fund NAV, mutual fund returns, SIP in ${data.scheme_name}, MF performance`
    );

    // Open Graph Meta Tags
    setMetaTag("property", "og:type", "website");
    setMetaTag(
        "property",
        "og:url",
        `https://labh.io/mutual-fund/?id=${fundId}`
    );
    setMetaTag(
        "property",
        "og:title",
        `${data.scheme_name} – NAV ${data.cagr["1_year"]}, 1Y Return ${data.cagr["1_year"]}`
    );
    setMetaTag(
        "property",
        "og:description",
        `Get the latest data on ${data.scheme_name} including NAV (${data.cagr["1_year"]}), 1-year return (${data.cagr["1_year"]}), and category insights. Compare performance and analyze fund history.`
    );

    // Twitter Meta Tags
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag(
        "name",
        "twitter:url",
        `https://labh.io/mutual-fund/?id=${fundId}`
    );
    setMetaTag(
        "name",
        "twitter:title",
        `${data.scheme_name} – NAV ${data.cagr["1_year"]}, 1Y Return ${data.cagr["1_year"]} `
    );
    setMetaTag(
        "name",
        "twitter:description",
        `Get the latest data on ${data.scheme_name} including NAV (${data.cagr["1_year"]}), 1-year return (${data.cagr["1_year"]}), and category insights. Compare performance and analyze fund history.`
    );

    renderChart(responseData, 1);
    $("#fund-name-heading").text(toTitleCase(responseData.scheme_name));
    $("#min-price").text(`₹ ${responseData.min_investment_value}`);

    const riskInvolved = responseData.risk_involved
        ? responseData.risk_involved
        : "N/A";
    $("#risk-analysis").text(riskInvolved);

    const cagr = responseData.cagr;
    if (cagr !== null) {
        $("#cagr").text(`${cagr["5_years"]}%`);
    }

    $("#lock-in").text(
        responseData.lock_in_period ? responseData.lock_in_period : "N/A"
    );

    const topHoldings = responseData.top_holdings;
    if (topHoldings.length > 0) {
        // render top holdings
        topHoldings.slice(0, 10).forEach((holding) => {
            const topHoldingCard = `
                    <div class="top-holding">
                        <div class="header">
                            ${holding["Company Name"]}
                        </div>
                        <div class="percentage-container d-flex align-items-center">
                            <div class="holding-percentage">
                                <div class="percentage-bar" style="width: ${holding["Holding Percentage"]}%"></div>
                            </div>
                            <div>${holding["Holding Percentage"]}%</div>
                        </div>
                    </div>
                `;
            $("#top-holdings-list").append(topHoldingCard);
        });

        // render top sectors
        const topSectorsList = responseData.sector_allocation;

        if (Object.keys(topSectorsList).length === 0) {
            $("#sector").addClass("d-none");
        }
        const topSectorKeys = Object.keys(topSectorsList);
        topSectorKeys.slice(0, 10).forEach((sector) => {
            const topSectorCard = `
                <div class="top-holding">
                    <div class="header">
                        ${sector}
                    </div>
                    <div class="percentage-container d-flex align-items-center">
                        <div class="holding-percentage">
                            <div class="percentage-bar" style="width: ${topSectorsList[sector]}%"></div>
                        </div>
                        <div>${topSectorsList[sector]}%</div>
                    </div>
                </div>
            `;
            $("#sectors").append(topSectorCard);
        });
    } else {
        $(".top-holdings").addClass("d-none");
    }

    document.title = `${data.scheme_name} – NAV ${data.cagr["1_year"]}`;

    // canonical
    tag = document.createElement("link");
    tag.setAttribute("rel", "canonical");
    tag.setAttribute("href", `https://labh.io/mutual-fund/?id=${fundId}`);
    document.head.appendChild(tag);
})
    .done(function () {
        onload();
    })
    .fail(function (response) {
        if (response.status == 404) {
            window.location.href = "/404";
        }
    });

function calculateLumpSumReturn(principal, rate, years) {
    const finalAmount = principal * Math.pow(1 + rate / 100, years);

    return finalAmount;
}

function calculateSIPReturn(monthlyInvestment, annualRate, years) {
    const r = annualRate / 12 / 100;
    const n = years * 12;

    const futureValue =
        (monthlyInvestment * ((Math.pow(1 + r, n) - 1) * (1 + r))) / r;

    return futureValue;
}

function updateSliderBackground(slider) {
    $(`#${slider.id}-value`).text(`₹${parseInt(slider.value)}`);
    const value =
        ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    $(slider).css(
        "background",
        `linear-gradient(to right, #9b5de5 ${value}%, #d3bfff ${value}%)`
    );
}

function updateValues() {
    const principal = parseInt($("#investment-slider").val());
    var annualRate = parseFloat(data.cagr["1_year"]);
    if (year == 3) {
        annualRate = parseFloat(data.cagr["3_years"]);
    } else if (year == 5) {
        annualRate = parseFloat(data.cagr["5_years"]);
    }
    var totalInvestment = 0;
    var totalReturns = 0;

    if (sip) {
        const futureValue = calculateSIPReturn(principal, annualRate, year);
        totalInvestment = principal * year * 12;
        totalReturns = futureValue - totalInvestment;
    } else {
        const finalAmount = calculateLumpSumReturn(principal, annualRate, year);
        totalInvestment = principal;
        totalReturns = finalAmount - totalInvestment;
    }
    $("#total-investment").text(
        `₹${totalInvestment.toLocaleString("en-IN", {
            maximumFractionDigits: 0,
        })}`
    );
    if (annualRate == 0) {
        $("#total-returns").text(`₹NaN`);
    } else {
        $("#total-returns").text(
            `₹${totalReturns.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
            })}`
        );
    }
}

function onload() {
    $(".years span").click(function () {
        $(".years span").removeClass("active");
        $(this).addClass("active");
        const value = $(this).data("value");
        renderChart(data, value);
    });

    // toggler in calculator
    $(".toggler span").click(function () {
        $(".toggler span").removeClass("active");
        $(this).addClass("active");
        if ($(this).text() === "Monthly SIP") {
            sip = true;
            $("#cal-label").text("Monthly Investment");
        } else {
            sip = false;
            $("#cal-label").text("Investment Amount");
        }
        updateValues();
    });

    $(".year-selector").click(function () {
        $(".year-list").toggleClass("d-none");
    });

    $(".year-list span").click(function () {
        const text = $(this).text();
        $(".year-list span").removeClass("active");
        year = $(this).data("value");
        $(this).addClass("active");
        $("#sip-year").text(text);
        updateValues();
        $(".year-list").addClass("d-none");
    });

    $("#investment-slider")
        .each(function () {
            updateSliderBackground(this);
            updateValues();
        })
        .on("input", function () {
            updateSliderBackground(this);
            updateValues();
        });

    $("#sinvestment-slider").on("change", function () {
        updateValues();
    });
}

function replaceYears() {
    if ($(window).width() < 745) {
        $("#years").addClass("d-none");
        $("#mobile-years").removeClass("d-none");
    } else {
        $("#years").removeClass("d-none");
        $("#mobile-years").addClass("d-none");
    }
}

$(window).on("load", function () {
    let debounceTimer;
    replaceYears();
    $(window).resize(function () {
        replaceYears();
    });

    $("#search").on("input", function () {
        const name = $(this).val().toLowerCase();

        if (name.length > 0) {
            $(".search-bar").removeClass("hide-icon");
        } else {
            $(".search-bar").addClass("hide-icon");
            return;
        }

        clearTimeout(debounceTimer);

        debounceTimer = setTimeout(function () {
            $.get(
                `${domain}/search/mutual-funds/?scheme_name=${name}&page=1&page_size=10`,
                function (responseData) {
                    if (responseData.count == 0) {
                        $(".search-dropdown").empty();
                        const dropdownItem = `
                            <div>
                                <span class='no-results'>No results for '<span>${name}<span>'</span>
                            </div>
                        `;
                        $(".search-dropdown").append(dropdownItem);
                        return;
                    }
                    $(".search-dropdown").empty();
                    $(".search-dropdown").removeClass("display-none");
                    const results = responseData.results;
                    results.forEach((result) => {
                        const dropdownItem = `
                            <div onclick="window.location.href='/mutual-fund/?id=${result.id}'">
                                <img src="/assets/search_dropdown_arrow.svg" alt="dropdown-arrow" />
                                <span>${result.scheme_name}</span>
                            </div>
                        `;
                        $(".search-dropdown").append(dropdownItem);
                    });
                }
            );
        }, 500);
    });
});

$(".search-bar").on("click", function (e) {
    const rect = $(this)[0].getBoundingClientRect();
    const x = e.clientX - rect.left;

    if ((x > 390 && window.innerWidth > 1024) || true) {
        $(".search-dropdown").addClass("display-none");
        $(".search-bar").addClass("hide-icon");
        $("#search").val("");
    }
});

$(document).on("click", function (event) {
    if (!$(event.target).closest(".goto-ul").length) {
        $(".goto, .items-per-page").find("div").addClass("d-none");
    }
});

let page = 1;
let pages = null;
let pageCount = 10;
let pageSize = 10;

function updateURLParameter(url, key, value) {
    var newURL = new URL(url);
    newURL.searchParams.set(key, value);
    return newURL.toString();
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function rerenderPagination() {
    $("#goto-ul").empty();
    for (let i = 1; i <= pages; i++) {
        $("#goto-ul").append(`<li>${i}</li>`);
    }
}

function processPagination(responseData) {
    const count = responseData.count;
    pages = Math.ceil(count / pageCount);

    rerenderPagination();
}

function renderer(url) {
    $.get(url, function (responseData) {
        $("#index-contents").addClass("d-none");
        processPagination(responseData);
        const results = responseData.results;
        $("#funds-list2").empty();
        results.forEach((result) => {
            $("#funds-list2").append(`
                    <a class="fund" onclick="window.location.href='/mutual-fund/?id=${
                        result.id
                    }'">
                        <div class="header d-flex justify-content-between align-items-center">
                            <img src="${result.image_url}" alt="mf-image">
                            <div>${result.scheme_name}</div>
                        </div>
                        <div class="risk">
                            Risk Involded: <span>${
                                result.risk_involved
                                    ? result.risk_involved
                                    : "N/A"
                            }</span>
                        </div>
                    </a>
                `);
        });
    });
}

$(document).ready(function () {
    const path = window.location.pathname;

    pageSize = getQueryParam("page_size") || 10;
    $(".items-per-page span").empty();
    $(".items-per-page span").append(
        `${pageSize} <img src="/assets/pagination-down-arrwo.svg" alt="down-arrow" />`
    );



    if (path.includes("/equity")) {
        $(".category:contains('Equity')").addClass("active");
        renderer(
            `https://devapi.labh.io/api/mutual-funds/all/?name=equity&page=${page}&page_size=${pageSize}`
        );
    } else if (path.includes("/debt")) {
        $(".category:contains('Debt')").addClass("active");
        renderer(
            `https://devapi.labh.io/api/mutual-funds/all/?name=debt&page=${page}&page_size=${pageSize}`
        );
    } else if (path.includes("/hybrid")) {
        $(".category:contains('Hybrid')").addClass("active");
        renderer(
            `https://devapi.labh.io/api/mutual-funds/all/?name=hybrid&page=${page}&page_size=${pageSize}`
        );
    } else if (path.includes("/solution")) {
        $(".category:contains('Solution')").addClass("active");
        renderer(
            `https://devapi.labh.io/api/mutual-funds/all/?name=solution&page=${page}&page_size=${pageSize}`
        );
    } else if (path.includes("/other")) {
        $(".category:contains('Other')").addClass("active");
        renderer(
            `https://devapi.labh.io/api/mutual-funds/all/?name=other&page=${page}&page_size=${pageSize}`
        );
    } else {
        $.get(
            `https://devapi.labh.io/api/mutual-funds/all/?name=regular`,
            function (responseData) {
                const results = responseData.results;
                results.slice(0, 6).forEach((result) => {
                    $("#funds-list").append(`
                    <a class="fund" onclick="window.location.href='/mutual-fund/?id=${
                        result.id
                    }'">
                        <div class="header d-flex justify-content-between align-items-center">
                            <img src="${result.image_url}" alt="mf-image">
                            <div>${result.scheme_name}</div>
                        </div>
                        <div class="risk">
                            Risk Involded: <span>${
                                result.risk_involved
                                    ? result.risk_involved
                                    : "N/A"
                            }</span>
                        </div>
                    </a>
                `);
                });
            }
        );
    }

    $(".goto span, .items-per-page span").on("click", function () {
        $(this).parent().find("div").toggleClass("d-none");
    });

    $("#items-per-page-ul li").on("click", function () {
        pageSize = $(this).attr("data-value");

        $(".items-per-page span").empty();
        $(".items-per-page span").append(
            `${pageSize} <img src="/assets/pagination-down-arrwo.svg" alt="down-arrow" />`
        );
        $(".items-per-page div").toggleClass("d-none");

        const updatedURL = updateURLParameter(
            window.location.href,
            "page_size",
            pageSize
        );
        window.location.href = updatedURL;
    });

    $("#goto-ul li").on("click", function () {
        console.log('clicked')
        // page = $(this).attr("data-value");
        // const updatedURL = updateURLParameter(
        //     window.location.href,
        //     "page",
        //     page
        // );
        // window.location.href = updatedURL;
    });
});

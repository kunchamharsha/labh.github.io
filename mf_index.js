let page = 1;
let pages = null;
let pageSize = 10;

let pageName = null;

const domain = "https://devapi.labh.io";

let fundHouses = [];
let isViewMore = false;

function updateURLParameter(url, key, value) {
    var newURL = new URL(url);
    newURL.searchParams.set(key, value);
    return newURL.toString();
}

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function rerenderPagination(count) {
    $("#goto-ul").empty();
    for (let i = 1; i <= pages; i++) {
        $("#goto-ul").append(
            `<li data-value="${i}"><a href="/mutual-funds/${pageName}/?page=${i}&page_size=${pageSize}">${i}</a></li>`
        );
    }

    let currentCount = page * pageSize;
    if (currentCount > count) {
        currentCount = count;
    }

    $(".pages-left").text(`${currentCount} of ${count}`);
    $(".pages-left-mobile").text(`${currentCount} of ${count}`);
}

function processPagination(responseData) {
    const count = responseData.count;
    pages = Math.ceil(count / pageSize);

    rerenderPagination(count);
}

function renderFundHouse() {
    let start = 0;
    let end = 9;
    if (isViewMore == true) {
        start = 0;
        end = fundHouses.length;
    }
    $(".scheme-list").empty();
    console.log({start, end})
    fundHouses.slice(start, end).forEach((data) => {
        const queryString = new URLSearchParams({
            name: data.name,
        }).toString();
        $(".scheme-list").append(`
                <a href="/mutual-funds/scheme/?${queryString}" class="scheme d-flex align-items-center">
                    <img src="${data.image_url}" alt="scheme-image" />
                    <span>${data.name}</span>
                </div>
            `);
    });
}

function renderer(url) {
    $.get(url, function (responseData) {
        $("#index-contents").addClass("d-none");
        processPagination(responseData);
        const results = responseData.results;
        $("#funds-list2").empty();
        results.forEach((result) => {
            $("#funds-list2").append(`
                    <a class="fund" href="/mutual-fund/?id=${result.id}">
                        <div class="header d-flex">
                            <img src="${result.image_url}" alt="mf-image">
                            <div>${result.scheme_name}</div>
                        </div>
                        <div class="risk d-flex justify-content-center align-items-center">
                            ${result.risk_involved ? result.risk_involved : "-"}
                        </div>
                    </a>
                `);
        });

        $("#goto-ul li").on("click", function () {
            page = $(this).attr("data-value");
            const updatedURL = updateURLParameter(
                window.location.href,
                "page",
                page
            );
            window.location.href = updatedURL;
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

    page = getQueryParam("page") || 1;
    $(".goto span").empty();
    $(".goto span").append(
        `${page} <img src="/assets/pagination-down-arrwo.svg" alt="down-arrow" />`
    );

    if (path.includes("/equity")) {
        $(".category:contains('Equity')").addClass("active");
        pageName = "equity";
        renderer(
            `${domain}/api/mutual-funds/all/?name=equity&page=${page}&page_size=${pageSize}`
        );
    } else if (path.includes("/debt")) {
        $(".category:contains('Debt')").addClass("active");
        pageName = "debt";
        renderer(
            `${domain}/api/mutual-funds/all/?name=debt&page=${page}&page_size=${pageSize}`
        );
    } else if (path.includes("/hybrid")) {
        $(".category:contains('Hybrid')").addClass("active");
        pageName = "hybrid";
        renderer(
            `${domain}/api/mutual-funds/all/?name=hybrid&page=${page}&page_size=${pageSize}`
        );
    } else if (path.includes("/solution")) {
        $(".category:contains('Solution')").addClass("active");
        pageName = "solution";
        renderer(
            `${domain}/api/mutual-funds/all/?name=solution&page=${page}&page_size=${pageSize}`
        );
    } else if (path.includes("/other")) {
        $(".category:contains('Other')").addClass("active");
        pageName = "other";
        renderer(
            `${domain}/api/mutual-funds/all/?name=other&page=${page}&page_size=${pageSize}`
        );
    } else if (path.includes("/scheme")) {
        pageName = getQueryParam("name");
        $("#scheme-name").text(pageName);
        let keyword = pageName.split(" ")[0];
        if (pageName == "Bank of India Mutual Fund") {
            keyword = "Bank of India";
        }
        renderer(
            `${domain}/api/mutual-funds/all/?name=${keyword}&page=${page}&page_size=${pageSize}`
        );
    } else {
        $.get(`${domain}/api/basket/`, function (responseData) {
            responseData.forEach((data) => {
                $(".cards").append(`
                        <a href="#" class="card">
                            <img src="/assets/card-edge-image.svg" alt="edge-image" />
                            <img src="/assets/card-edge-image.svg" alt="edge-image" />
                            <img
                                src="/assets/calculator-arrow.svg"
                                alt="calculator-arrow"
                            />
                            <div class="card-heading">${data.name}</div>
                            <div class="card-description">
                                ${data.description}
                            </div>
                        </a>
                    `);
            });
        });

        $.get(`${domain}/api/mutual-funds/fund-houses/`, function (response) {
            fundHouses = response;
            response.slice(0, 9).forEach((data) => {
                const queryString = new URLSearchParams({
                    name: data.name,
                }).toString();
                $(".scheme-list").append(`
                        <a href="/mutual-funds/scheme/?${queryString}" class="scheme d-flex align-items-center">
                            <img src="${data.image_url}" alt="scheme-image" />
                            <span>${data.name}</span>
                        </div>
                    `);
            });
        });
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

    $(".view-more").on("click", function () {
        if (isViewMore == true) {
            $(this).text("Show More");
            isViewMore = false;
            renderFundHouse();
        } else {
            $(this).text("Hide");
            isViewMore = true;
            renderFundHouse();
        }
    });
});



$(window).on("load", function () {
    let debounceTimer;

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
                `https://devapi.labh.io/api/mutual-funds/all/?name=${name}`,
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

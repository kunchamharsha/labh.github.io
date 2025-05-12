$(document).ready(function () {
    $.get(
        `https://devapi.labh.io/api/mutual-funds/all/?name=regular`,
        function (responseData) {
            const results = responseData.results;
            results.slice(0, 6).forEach((result) => {
                $("#funds-list").append(`
                    <div class="fund" onclick="window.location.href='/mutual-fund/?id=${result.id}'">
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
                    </div>
                `);
            });
        }
    );

    $(".categories .category").on("click", function () {
        $(".categories .category").removeClass("active");
        $(this).toggleClass("active");
        $(".categories-fund-list").removeClass("d-none");
        const value = $(this).attr("data-value");
        $.get(
            `https://devapi.labh.io/api/mutual-funds/all/?name=${value}`,
            function (responseData) {
                $("#index-contents").addClass("d-none");

                const results = responseData.results;
                $("#funds-list2").empty();
                results.forEach((result) => {
                    $("#funds-list2").append(`
                    <div class="fund" onclick="window.location.href='/mutual-fund/?id=${result.id}'">
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
                    </div>
                `);
                });
            }
        );
    });
});

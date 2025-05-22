const domain = "https://api.labh.io";

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

$(document).ready(function () {
    const id = getQueryParam("id");
    $.get(`${domain}/api/basket/?id=${id}`, function (response) {
        const basketData = response[0];
        const basketReturns = basketData.metrics.filter(
            (item) => item.attribute_name == "basket_returns"
        );
        const niftyReturns = basketData.metrics.filter(
            (item) => item.attribute_name == "nifty_returns"
        );
        $("#basket-name").text(basketData.name);
        $("#basket-name-heading").text(basketData.name);
        $("#basket-description").text(basketData.description);

        const fontSize = $(window).width() < 745 ? "8px" : "12px";

        var options = {
            series: [
                {
                    name: "Basket Returns",
                    data: JSON.parse(basketReturns[0].attribute_value),
                },
                {
                    name: "Nifty Returns",
                    data: JSON.parse(niftyReturns[0].attribute_value),
                },
            ],
            chart: {
                height: 440,
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
            xaxis: {
                categories: [],
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
        };
        chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
    });
});

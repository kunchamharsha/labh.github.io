const domain = "https://devapi.labh.io";

function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

$(document).ready(function () {
  /* ---------------------------------------------
   * 0. REDIRECT if ?name param is missing
   * --------------------------------------------- */
  const name = getQueryParam("name");
  if (!name) {
    window.location.replace("https://labh.io/404/");
    return;
  }

  /* ---------------------------------------------
   * 1. Fetch Performance Return %
   * --------------------------------------------- */
  $.get(`${domain}/open/basket-returns`)
    .done((resp) => {
      const key = Object.keys(resp).find(
        (k) => k.trim().toLowerCase() === name.trim().toLowerCase()
      );
      if (!key) {
        window.location.replace("https://labh.io/404/");
        return;
      }
      $("#performance-value").text(`${resp[key]}%`);
    })
    .fail(() => {
      console.error("basket-returns fetch failed");
    });

  /* ---------------------------------------------
   * 2. Main Basket Data & Chart
   * --------------------------------------------- */
  $.get(`${domain}/api/basket/`)
    .done((resp) => {
      const basket = resp.find((b) => b.name && b.name.trim() === name.trim());
      if (!basket) {
        window.location.replace("https://labh.io/404/");
        return;
      }

      $("#basket-name, #basket-name-heading").text(basket.name);
      $("#basket-description").text(basket.description);

      const isTaxBasket = basket.name.toLowerCase().includes("tax");

      // DETAILS PANEL
      const detailsMap = {
        "min-price": "min_amount",
        "risk-analysis": "riskometer_rating",
        "exit-load": "exit_load",
        "cagr": "5_year_cagr",
        "lock-in": "lock_in_period",
        "expense-ratio": "expense_ratio",
      };

      basket.matrics.forEach((m) => {
        for (const [id, key] of Object.entries(detailsMap)) {
          if (m.attribute_name === key) {
            let val = m.attribute_value;
            if (key === "min_amount") val = `₹${parseFloat(val).toLocaleString("en-IN")}`;
            if (key === "expense_ratio") val = `${val}%`;
            document.getElementById(id).innerText = val;
          }
        }
      });

      // CHART
      const basketArr = basket.matrics.filter((m) => m.attribute_name === "basket_returns");
      let benchArr = basket.matrics.filter((m) => m.attribute_name === "nifty_returns");
      let benchLabel = "Nifty Returns";
      if (!benchArr.length) {
        benchArr = basket.matrics.filter((m) => m.attribute_name === "bse_sovereign_return");
        benchLabel = "BSE Sovereign Returns";
      }
      const dateArr = basket.matrics.filter((m) => m.attribute_name === "date");

      if (!basketArr.length || !benchArr.length) return;

      try {
        const basketData = JSON.parse(basketArr[0].attribute_value);
        const benchData = JSON.parse(benchArr[0].attribute_value);
        const categories = dateArr.length ? JSON.parse(dateArr[0].attribute_value) : [];

        const fontSize = $(window).width() < 745 ? "8px" : "12px";

        new ApexCharts(document.querySelector("#chart"), {
          series: [
            { name: basket.name || "Basket", data: basketData },
            { name: benchLabel, data: benchData },
          ],
          chart: {
            height: 440,
            type: "line",
            zoom: { enabled: false },
            toolbar: { show: false },
            events: { mounted: () => $("#chart-loader").hide() },
          },
          dataLabels: { enabled: false },
          stroke: { curve: "straight", width: 3 },
          grid: {
            show: true,
            borderColor: "#FFFFFF99",
            xaxis: { lines: { show: false } },
            yaxis: { lines: { show: false } },
          },
          tooltip: { theme: "dark" },
          colors: ["#63E4BF", "#6394E4"],
          xaxis: {
            categories,
            labels: {
              show: true,
              style: { colors: "white", fontSize },
              rotate: 0,
            },
            axisBorder: {
              show: true,
              color: "#FFFFFF99",
              strokeDashArray: 4,
            },
            axisTicks: { show: true, color: "#FFFFFF99" },
            title: { text: "Years", style: { color: "#CECBFF", fontSize } },
          },
          yaxis: {
            labels: {
              style: { colors: "white", fontSize },
              formatter: (val) => `${val.toFixed(0)}%`,
            },
            axisBorder: { show: true, color: "white" },
            title: { text: "Returns", style: { color: "#CECBFF", fontSize } },
          },
          legend: {
            show: true,
            position: "bottom",
            offsetY: 20,
            markers: { shape: "square", width: 12, height: 12 },
            labels: { colors: "white", style: { fontSize: "24px" } },
            itemMargin: { horizontal: 10, vertical: 5 },
          },
        }).render();
      } catch (e) {
        console.error("Chart parse error", e);
      }

      // INVESTMENT CARD
      const yearsList = isTaxBasket ? [3, 6, 9] : [1, 3, 5];
      const projectedReturns = {};
      yearsList.forEach((yr) => {
        const base = `1_lakh_${yr}_year_return`;
        const key = isTaxBasket ? `${base}_tax` : base;
        const metric = basket.matrics.find((m) => m.attribute_name === key);
        if (metric) projectedReturns[yr] = parseInt(metric.attribute_value);
      });

      const $wrapper = $(".time-options").empty();
      yearsList.forEach((yr, i) => {
        $wrapper.append(`<button class="time-option${i === 0 ? " active" : ""}" data-years="${yr}">${yr} years</button>`);
      });

      function animateNumber(start, end, duration = 1000) {
        const t0 = performance.now();
        function step(t) {
          const p = Math.min((t - t0) / duration, 1);
          const val = Math.round(start + (end - start) * p);
          $("#projected-amount").text(val.toLocaleString("en-IN"));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      }

      function updateProjectedAmount(years) {
        const current = Number($("#projected-amount").text().replace(/,/g, "")) || 100000;
        animateNumber(current, projectedReturns[years]);
      }

      updateProjectedAmount(yearsList[0]);

      $wrapper.on("click", ".time-option", function () {
        $(".time-option").removeClass("active");
        $(this).addClass("active");
        updateProjectedAmount($(this).data("years"));
      });
    })
    .fail(() => {
      window.location.replace("https://labh.io/404/");
    });

  /* ---------------------------------------------
   * 3. Responsive Image (tablet/mobile/desktop)
   * --------------------------------------------- */
  $(".top-holdings img").attr("loading", "lazy");
  const allocationImg = $(".top-holdings img");
  function setResponsiveImage() {
    let newSrc;
    if (window.innerWidth < 744) {
      newSrc = "/assets/basket-mobile.png";
    } else if (window.innerWidth < 1280) {
      newSrc = "/assets/basket-tablet.png";
    } else {
      newSrc = "/assets/basket-allocation.png";
    }

    if (allocationImg.attr("src") !== newSrc) {
      allocationImg.fadeOut(200, function () {
        allocationImg.attr("src", newSrc).fadeIn(300);
      });
    }
  }

  setResponsiveImage();
  $(window).on("resize", setResponsiveImage);
});

let selectedCoupon = null;
let couponToastTimer = null;
let coupons = [];
let expandedCouponIndexes = [];

const COUPON_API_URL = TEST_DOMAIN + "/stocks/api/v1/coupon/";

function getCouponRoot() {
  const $couponPager = $("#coupon-pager");
  return $couponPager.length ? $couponPager : $(".contents");
}

function getCouponHeaders() {
  const accessToken = getCookie("access-token");
  const deviceId = getCookie("device-id");

  return {
    "access-token": accessToken,
    "device-id": deviceId,
  };
}

function escapeCouponText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeCoupon(coupon) {
  const discount = `${coupon.percentage}% OFF`;
  const expiresOn = coupon.end_date;
  const basketNames = coupon.basket_name || [];

  const bullets = [
    basketNames.length ? `Applicable to: ${basketNames.join(", ")}` : null,
    coupon.tenure_applicable
      ? `Valid for ${coupon.tenure_applicable}-month plans`
      : null,
    coupon.per_user_usage
      ? `Each user can use this coupon up to ${coupon.per_user_usage} time(s)`
      : null,
    coupon.remaining_users !== null
      ? `Available for ${coupon.remaining_users} more user(s)`
      : "Available to unlimited users",
  ];

  return {
    id: coupon.id,
    code: coupon.coupon_code,
    discount,
    expiresOn,
    redeemed: coupon.redeemed,
    bullets: bullets.filter(Boolean),
  };
}

function renderCouponCards() {
  if (!coupons.length) {
    return `
      <div class="empty-coupon-state d-flex flex-column align-items-center justify-content-center">
        <h4>No coupons available</h4>
        <p>New offers will appear here when they are available.</p>
      </div>
    `;
  }

  return coupons
    .map(function (rawCoupon, index) {
      const coupon = normalizeCoupon(rawCoupon);

      const isApplied =
        selectedCoupon &&
        selectedCoupon.code === coupon.code &&
        selectedCoupon.id === coupon.id;

      const isExpanded = expandedCouponIndexes.includes(index);
      const primaryBullets = coupon.bullets.slice(0, 3)
        .map(function (point) {
          return `<li>${escapeCouponText(point)}</li>`;
        })
        .join("");
      const extraBullets = coupon.bullets
        .slice(3)
        .map(function (point) {
          return `<li>${escapeCouponText(point)}</li>`;
        })
        .join("");
      const toggleButton =
        coupon.bullets.length > 3
          ? `<button class="coupon-toggle-button" type="button" data-index="${index}">
              ${isExpanded ? "Show less" : "Show more"}
            </button>`
          : "";

      const expiryDate = coupon.expiresOn
        ? new Date(coupon.expiresOn).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "-";

      return `
        <article class="coupon-card ${isApplied ? "active" : ""}">
          <div class="coupon-card-head">
            <div>
              <div class="coupon-title-row">
                <div class="coupon-code">${escapeCouponText(coupon.code)}</div>
                <h3>${escapeCouponText(coupon.discount)}</h3>
              </div>

              <div class="coupon-expiry">
                <span class="clock-icon">◷</span>
                <span>Ends on <strong>${expiryDate}</strong></span>
              </div>
            </div>

            <button
              class="coupon-apply-button"
              type="button"
              data-index="${index}"
              ${coupon.redeemed ? "disabled" : ""}
            >
              ${
                isApplied
                  ? '<span class="apply-icon">✓</span><span>Applied</span>'
                  : `<span>${coupon.redeemed ? "Used" : "Apply"}</span>`
              }
            </button>
          </div>

          <div class="coupon-card-body">
            <ul class="${extraBullets ? "coupon-primary-bullets has-extra-bullets" : "coupon-primary-bullets"}">${primaryBullets}</ul>
            ${
              extraBullets
                ? `<ul class="coupon-extra-bullets" style="display: ${
                    isExpanded ? "block" : "none"
                  };">${extraBullets}</ul>`
                : ""
            }
            ${toggleButton}
          </div>
        </article>
      `;
    })
    .join("");
}

function showCouponToast() {
  const $toast = $("#coupon-toast");
  if (!$toast.length) {
    return;
  }

  $toast.addClass("show");
  clearTimeout(couponToastTimer);
  couponToastTimer = setTimeout(function () {
    $toast.removeClass("show");
  }, 2400);
}

function fetchCoupons() {
  $.ajax({
    url: COUPON_API_URL,
    type: "GET",
    headers: getCouponHeaders(),
    success: function (response) {
      coupons = response;
      renderCouponList();
    },
    error: function (xhr, status, error) {
      console.error("Error fetching coupons:", error);
      renderCouponList();
    },
  });
}

function applyCoupon(index) {
  const rawCoupon = coupons[Number(index)];
  if (!rawCoupon) {
    return;
  }

  const coupon = normalizeCoupon(rawCoupon);

  $.ajax({
    url: COUPON_API_URL,
    type: "POST",
    headers: getCouponHeaders(),
    contentType: "application/json",
    data: JSON.stringify({
      coupon_id: coupon.id,
    }),
    success: function () {
      selectedCoupon = coupon;
      renderCouponList();
      showCouponToast();
    },
    error: function (xhr, status, error) {
      console.error("Error applying coupon:", error);
    },
  });
}

function bindCouponPageEvents() {
  $(".coupon-apply-button")
    .off("click")
    .on("click", function () {
      applyCoupon($(this).data("index"));
    });

  $(".coupon-toggle-button")
    .off("click")
    .on("click", function () {
      toggleCouponBullets($(this).data("index"));
    });
}

function toggleCouponBullets(index) {
  const couponIndex = Number(index);
  const $button = $(`.coupon-toggle-button[data-index="${couponIndex}"]`);
  const $extraBullets = $button.closest(".coupon-card-body").find(".coupon-extra-bullets");

  if (!$extraBullets.length || $extraBullets.is(":animated")) {
    return;
  }

  if (expandedCouponIndexes.includes(couponIndex)) {
    expandedCouponIndexes = expandedCouponIndexes.filter(function (expandedIndex) {
      return expandedIndex !== couponIndex;
    });
    $extraBullets.slideUp(320);
    $button.text("Show more");
  } else {
    expandedCouponIndexes.push(couponIndex);
    $extraBullets.slideDown(320);
    $button.text("Show less");
  }
}

function renderCouponList() {
  const $root = getCouponRoot();
  if (!$root.length) {
    return;
  }

  $root.html(`
        <section class="coupon-section">
            <div class="section-heading">
                <h2>Available Coupons</h2>
            </div>
            <div class="coupon-list">
                ${renderCouponCards()}
            </div>
        </section>
        <div id="coupon-toast" class="coupon-toast">
            <span>Coupon applied successfully</span>
            <span class="toast-check">✓</span>
        </div>
    `);

  bindCouponPageEvents();
}

function couponBack() {
  window.location.href = "https://api.labh.io/profile";
}

if (!window.back) {
  window.back = couponBack;
}

window.couponBack = couponBack;

$(document).ready(function () {
  renderCouponList();
  fetchCoupons();
});

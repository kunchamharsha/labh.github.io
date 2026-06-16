let selectedCoupon = null;
let couponToastTimer = null;
let coupons = [];
let expandedCouponIndexes = [];
let activeCouponTab = "available";
let couponSwipeStartX = 0;
let couponSwipeStartY = 0;

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

function getCouponStatus(coupon) {
  if (coupon.redeemed === true) {
    return "used";
  }

  if (coupon.redeemed === false) {
    return "available";
  }

  return String(coupon.redeemed || "Available").trim().toLowerCase();
}

function isCouponAvailable(coupon) {
  return getCouponStatus(coupon) === "available";
}

function isCouponRedeemed(coupon) {
  return !isCouponAvailable(coupon);
}

function getCouponStatusLabel(coupon) {
  const status = getCouponStatus(coupon);
  if (status === "available") {
    return "Available";
  }
  if (status === "used") {
    return "Used";
  }
  if (status === "expired") {
    return "Expired";
  }
  return status
    .split(/\s+/)
    .filter(Boolean)
    .map(function (word) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

function getCouponBasketNames(coupon) {
  const status = getCouponStatus(coupon);
  const subscribedBaskets = Array.isArray(coupon.subscribed_basket)
    ? coupon.subscribed_basket.filter(Boolean)
    : [];
  const basketNames = Array.isArray(coupon.basket_name)
    ? coupon.basket_name.filter(Boolean)
    : [];

  if (status !== "available" && subscribedBaskets.length) {
    return {
      label: "Subscribed basket",
      names: subscribedBaskets,
    };
  }

  if (basketNames.length) {
    return {
      label: "Applicable to",
      names: basketNames,
    };
  }

  return null;
}

function getCouponRemainingUsersText(coupon) {
  if (coupon.remaining_users === null || coupon.remaining_users === undefined) {
    return "Available to unlimited users";
  }

  return `Remaining users: ${coupon.remaining_users}`;
}

function normalizeCoupon(coupon) {
  const discount = `${coupon.percentage}% OFF`;
  const expiresOn = coupon.expire_on || coupon.end_date;
  const basketDetails = getCouponBasketNames(coupon);
  const statusLabel = getCouponStatusLabel(coupon);

  const bullets = [
    basketDetails
      ? `${basketDetails.label}: ${basketDetails.names.join(", ")}`
      : null,
    coupon.tenure_applicable
      ? `Valid for ${coupon.tenure_applicable}-month plans`
      : null,
    coupon.per_user_usage
      ? `Each user can use this coupon up to ${coupon.per_user_usage} time(s)`
      : null,
    getCouponRemainingUsersText(coupon),
  ];

  return {
    id: coupon.id,
    code: coupon.coupon_code,
    discount,
    expiresOn,
    status: statusLabel,
    isAvailable: isCouponAvailable(coupon),
    isRedeemed: isCouponRedeemed(coupon),
    bullets: bullets.filter(Boolean),
  };
}

function getCouponTabCoupons(tab) {
  const tabCoupons = coupons
    .map(function (rawCoupon, index) {
      return {
        rawCoupon,
        index,
      };
    })
    .filter(function (entry) {
      const isSelected =
        selectedCoupon &&
        selectedCoupon.id === entry.rawCoupon.id &&
        selectedCoupon.code === entry.rawCoupon.coupon_code;
      const isUsed = isCouponRedeemed(entry.rawCoupon) || isSelected;

      return tab === "used" ? isUsed : !isUsed;
    });

  if (tab === "used" && selectedCoupon) {
    tabCoupons.sort(function (first, second) {
      const firstSelected = first.rawCoupon.id === selectedCoupon.id ? 1 : 0;
      const secondSelected = second.rawCoupon.id === selectedCoupon.id ? 1 : 0;
      return secondSelected - firstSelected;
    });
  }

  return tabCoupons;
}

function renderEmptyCouponState(tab) {
  const title = tab === "used" ? "No redeemed coupons" : "No coupons available";
  const description =
    tab === "used"
      ? "Used or expired coupons will appear here."
      : "New offers will appear here when they are available.";

  return `
      <div class="empty-coupon-state d-flex flex-column align-items-center justify-content-center">
        <h4>${title}</h4>
        <p>${description}</p>
      </div>
    `;
}

function renderCouponCards(tab) {
  const tabCoupons = getCouponTabCoupons(tab);

  if (!tabCoupons.length) {
    return `
      ${renderEmptyCouponState(tab)}
    `;
  }

  return tabCoupons
    .map(function (entry) {
      const rawCoupon = entry.rawCoupon;
      const index = entry.index;
      const coupon = normalizeCoupon(rawCoupon);

      const isApplied =
        selectedCoupon &&
        selectedCoupon.code === coupon.code &&
        selectedCoupon.id === coupon.id;
      const isDisabled = !coupon.isAvailable || isApplied;

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
      const expiryLabel = coupon.status === "Expired" ? "Expired on" : "Ends on";

      return `
        <article class="coupon-card ${isApplied ? "active" : ""} ${coupon.status.toLowerCase()}">
          <div class="coupon-card-head">
            <div>
              <div class="coupon-title-row">
                <div class="coupon-code">${escapeCouponText(coupon.code)}</div>
                <h3>${escapeCouponText(coupon.discount)}</h3>
              </div>

              <div class="coupon-expiry">
                <span class="clock-icon">◷</span>
                <span>${expiryLabel} <strong>${expiryDate}</strong></span>
              </div>
            </div>

            <button
              class="coupon-apply-button ${coupon.status === "Expired" ? "expired" : ""}"
              type="button"
              data-index="${index}"
              ${isDisabled ? "disabled" : ""}
            >
              ${
                isApplied
                  ? '<span class="apply-icon">✓</span><span>Applied</span>'
                  : `<span>${coupon.isAvailable ? "Apply" : escapeCouponText(coupon.status)}</span>`
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
      coupons = coupons.map(function (existingCoupon) {
        if (existingCoupon.id === coupon.id) {
          const remainingUsers =
            existingCoupon.remaining_users === null ||
            existingCoupon.remaining_users === undefined
              ? existingCoupon.remaining_users
              : Math.max(Number(existingCoupon.remaining_users) - 1, 0);

          return Object.assign({}, existingCoupon, {
            redeemed: "Applied",
            remaining_users: remainingUsers,
          });
        }

        return existingCoupon;
      });
      activeCouponTab = "available";
      renderCouponList();
      requestAnimationFrame(function () {
        switchCouponTab("used");
      });
      showCouponToast();
    },
    error: function (xhr, status, error) {
      console.error("Error applying coupon:", error);
    },
  });
}

function bindCouponPageEvents() {
  $(".coupon-tab-button")
    .off("click")
    .on("click", function () {
      switchCouponTab($(this).data("tab"));
    });

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

  $(".coupon-tab-panels")
    .off("touchstart touchend")
    .on("touchstart", function (event) {
      const touch = event.originalEvent.touches[0];
      couponSwipeStartX = touch.clientX;
      couponSwipeStartY = touch.clientY;
    })
    .on("touchend", function (event) {
      const touch = event.originalEvent.changedTouches[0];
      const deltaX = touch.clientX - couponSwipeStartX;
      const deltaY = touch.clientY - couponSwipeStartY;

      if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) {
        return;
      }

      if (deltaX < 0 && activeCouponTab === "available") {
        switchCouponTab("used");
      } else if (deltaX > 0 && activeCouponTab === "used") {
        switchCouponTab("available");
      }
    });
}

function switchCouponTab(tab) {
  if (!["available", "used"].includes(tab) || activeCouponTab === tab) {
    return;
  }

  activeCouponTab = tab;
  $(".coupon-tabs").attr("data-active-tab", tab);
  $(".coupon-tab-button")
    .removeClass("active")
    .attr("aria-selected", "false");
  $(`.coupon-tab-button[data-tab="${tab}"]`)
    .addClass("active")
    .attr("aria-selected", "true");
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

  const availableCount = getCouponTabCoupons("available").length;
  const usedCount = getCouponTabCoupons("used").length;

  $root.html(`
        <section class="coupon-section">
            <div class="section-heading">
                <h2>Coupons</h2>
            </div>
            <div class="coupon-tabs" data-active-tab="${activeCouponTab}">
                <div class="coupon-tab-bar" role="tablist" aria-label="Coupon status">
                    <span class="coupon-tab-indicator" aria-hidden="true"></span>
                    <button
                        class="coupon-tab-button ${activeCouponTab === "available" ? "active" : ""}"
                        type="button"
                        role="tab"
                        aria-selected="${activeCouponTab === "available"}"
                        data-tab="available"
                    >
                        <span>Available</span>
                        <strong>${availableCount}</strong>
                    </button>
                    <button
                        class="coupon-tab-button ${activeCouponTab === "used" ? "active" : ""}"
                        type="button"
                        role="tab"
                        aria-selected="${activeCouponTab === "used"}"
                        data-tab="used"
                    >
                        <span>Redeemed</span>
                        <strong>${usedCount}</strong>
                    </button>
                </div>
                <div class="coupon-tab-panels">
                    <div class="coupon-tab-track">
                        <div class="coupon-tab-panel">
                            <div class="coupon-list">
                                ${renderCouponCards("available")}
                            </div>
                        </div>
                        <div class="coupon-tab-panel">
                            <div class="coupon-list">
                                ${renderCouponCards("used")}
                            </div>
                        </div>
                    </div>
                </div>
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

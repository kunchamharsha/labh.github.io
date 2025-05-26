document.addEventListener("DOMContentLoaded", function () {
    const stickyQR = document.querySelector(".sticky-qr");
    const targetURL = "https://play.google.com/store/apps/details?id=com.labh.io&pcampaignid=web_share";

    if (stickyQR) {
      stickyQR.addEventListener("click", function () {
        window.open(targetURL, "_blank");
      });
    }
  });


  $("#close-sticky-qr-mobiile").click(function () {
    $(".sticky-qr-mobile").addClass("d-none");
});
$(".s-get-app, .sticky-qr-desktop").click(function () {
    window.open("https://api.labh.io/get-app/", "_blank");
});

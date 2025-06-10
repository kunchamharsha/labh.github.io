const domain = "https://devapi.labh.io";
let reason = null;

document.addEventListener("DOMContentLoaded", function () {
    const dropdownBtn = document.getElementById("dropdownBtn");
    const dropdownOptions = document.getElementById("dropdownOptions");
    const dropdownLabel = document.getElementById("dropdownLabel");

    dropdownBtn.addEventListener("click", () => {
        dropdownOptions.style.display =
            dropdownOptions.style.display === "block" ? "none" : "block";
    });

    dropdownOptions.querySelectorAll("div").forEach((option) => {
        option.addEventListener("click", () => {
            dropdownLabel.textContent = option.textContent;
            reason = option.textContent;
            checkReason();
            dropdownOptions.style.display = "none";
        });
    });

    document.addEventListener("click", (e) => {
        if (
            !dropdownBtn.contains(e.target) &&
            !dropdownOptions.contains(e.target)
        ) {
            dropdownOptions.style.display = "none";
        }
    });
});

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const email = getQueryParam("email");
const token = getQueryParam("token");

$("#email").text(email);

function checkReason() {
  if(reason == 'Other reasons') {
    $('#reason').removeClass('d-none');
  }
}

function submit() {
    if (!reason) {
        alert("Please select a reason");
        return;
    }

    $.post(
        `${domain}/open/api/news-letter/unsubscribe/`,
        {
            email: email,
            token: token,
            reason: reason,
        },
        function success(response) {
            window.location.href = "/unsubscribe/success?email=" + email;
        }
    );
}

$("#submit").click(submit);

$("#reason").on('input', function() {
  reason = $(this).val();
})

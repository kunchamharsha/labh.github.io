const domain = "https://api.labh.io";
let reason = null;

document.addEventListener("DOMContentLoaded", function () {
    try {
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
    } catch (error) {
        // this js is using in success and subscribe so there is no drowpdown
        console.log(error);
    }

    if (window.location.pathname == "/unsubscribe/") {
        $.get(
            `${domain}/open/api/news-letter/unsubscribe/?email=${email}`
        ).fail(function (error) {
            if (error.responseJSON.error == "User already unsubscribed") {
                window.location.href =
                    "/unsubscribe/subscribe/?email=" +
                    email +
                    "&token=" +
                    token;
            }
        });
    }
});

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const email = getQueryParam("email");
const token = getQueryParam("token");

$("#email").text(email);

function checkReason() {
    if (reason == "Other reasons") {
        reason = null;
        $("#reason").removeClass("d-none");
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
            window.location.href =
                "/unsubscribe/success/?email=" + email + "&token=" + token;
        }
    ).fail(function (response) {
        if (
            response.responseJSON.email[0] ==
            "unsubscribed with this email already exists."
        ) {
            alert("You are already unsubscribed");
            window.location.href =
                "/unsubscribe/subscribe/?email=" + email + "&token=" + token;
        }
    });
}

$("#submit").click(submit);

$("#reason").on("input", function () {
    reason = $(this).val();
});

$("#subscribe").on("click", function () {
    $.ajax({
        url: `${domain}/open/api/news-letter/unsubscribe/?email=${email}&token=${token}`,
        type: "DELETE",
        success: function (result) {
            $(".unsub").text("Subscribed");
            $("#description").text(
                "You will receive emails from us. Thankyou for subscribing."
            );
            $("#subscribe").addClass("d-none");
        },
    });
});

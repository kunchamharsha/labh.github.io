const pages = ["home", "list", "form"];
var page = "home";
var prevPages = [];
var relativeChoices = [];
var selectedRelative = undefined;
var nominees = ["test"];
var availableNominees = [];
var allocationPercentage = 10;

const headerHeight = $(".go-back").outerHeight(true);
const modalHeight = window.innerHeight - headerHeight;
$(".modal-container").css("height", modalHeight);

function capitalizeWords(text) {
    return text
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function hideAllScreens() {
    $(".c-warning").addClass("d-none");
    $(".form-screen").addClass("d-none");
    $(".list-screen").addClass("d-none");
    $(".nominee-error").addClass("d-none");
    $("#button").css("background", "rgba(166, 99, 255)");
    $("#button").css("color", "rgba(255, 255, 255)");
}

function removePaddingFromListScreen() {
    $(".list-screen").css("padding-bottom", "0");
}

function fetchNominees() {
    $(".loader-overlay").show();
    $.ajax({
        url: DOMAIN + "/api/kyc/nominee",
        type: "GET",
        headers: {
            "access-token": getCookie("access-token"),
            "device-id": getCookie("device-id"),
        },
        success: function (response) {
            $(".loader-overlay").hide();
            renderNomineeList(response);
        },
        error: function (xhr, status, error) {
            $(".loader-overlay").hide();
            console.error("Error:", error);
        },
    });
}

function fetchRelativeChoices() {
    $(".loader-overlay").show();
    $.ajax({
        url: DOMAIN + "/api/kyc/nominee",
        type: "OPTIONS",
        headers: {
            "access-token": getCookie("access-token"),
            "device-id": getCookie("device-id"),
        },
        success: function (response) {
            $(".loader-overlay").hide();
            relativeChoices = response["relationships"];
        },
        error: function (xhr, status, error) {
            $(".loader-overlay").hide();
            console.error("Error:", error);
        },
    });
}

function renderNomineeError() {
    $(".nominee-error").removeClass("d-none");
    $("#button").css("background", "rgba(166, 99, 255, 0.6)");
    $("#button").css("color", "rgba(255, 255, 255, 0.6)");
}

function renderNomineeList(response) {
    availableNominees = response;
    hideAllScreens();
    page = pages[1];
    $(".list-screen").removeClass("d-none");
    $(".list-screen").empty();
    nominees.length > 0 ? removePaddingFromListScreen() : undefined;
    allocationPercentage != 100 ? renderNomineeError() : undefined;
    response.forEach((nominee) => {
        const list = `
            <div class="list">
                <div class="d d-flex align-items-center justify-content-between header">
                    <div class="section">
                        <img src="${ASSETS_URL}/assets/mobile-webview/edit-nominee.png" alt="edit" />
                        <span onclick="renderForm(${nominee.id})">Edit details </span>
                    </div>
                    <div class="section">
                        <img src="${ASSETS_URL}/assets/mobile-webview/delete-vector.png" alt="delete" />
                    </div>
                </div>
                <div class="d d-flex align-items-center justify-content-left gap-3">
                    <div class="d-flex align-items-center justify-content-left gap-1">
                        <img src="${ASSETS_URL}/assets/mobile-webview/iconamoon_profile-circle-fill.png" alt="logo">
                        <span>${nominee.name}</span>
                    </div>

                </div>
                <div class="nominee-details d-flex align-items-center justify-content-between">
                    <div class="section d-flex align-items-center justify-content-between">
                        <div>Relationsip:</div>
                        <span>${nominee.relationship}</span>
                    </div>
                    <div class="section d-flex align-items-center justify-content-between">
                        <div>Allocation %:</div>
                        <span>${nominee.share_percentage}</span>
                    </div>
                </div>
            </div>
        `;
        $(".list-screen").append(list);
    });
}

fetchNominees();

function showValuesInForm(nominee) {
    $("#nominee-name").val(nominee.name);
    $("#nominee-pan").val(nominee.pan);
    $("#dob").val(nominee.date_of_birth);
    $("#relation").val(nominee.relationship);
    $("#phone").val(nominee.phone_number);
    $("#email").val(nominee.email);
    $("#pin").val(nominee.pin_code);
    $("#country").val(nominee.country);
    $("#address").val(nominee.address);
    $("#percentage").val(nominee.share_percentage);
}

function renderForm(id = undefined) {
    hideAllScreens();
    page = pages[2];
    $(".form-screen").removeClass("d-none");
    if (id != undefined) {
        nominee = availableNominees.filter((nominee) => nominee.id == id);
        showValuesInForm(nominee[0]);
    }
}

function hideModals() {
    $(".c-modal").removeClass("show"); // this is needed for animation
    setTimeout(() => {
        $(".c-modal").addClass("d-none"); // this will first hide all the c-modals
        $(".modal-container").addClass("d-none");
    }, 100);
}

function renderHome() {
    hideAllScreens();
    page = pages[0];
    $(".home-screen").removeClass("d-none");
    $(".c-warning").removeClass("d-none");
}

function renderLottie() {
    lottie.loadAnimation({
        container: document.getElementById("banner"),
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: "https://cms-labh-bucket.s3.ap-south-2.amazonaws.com/cms_images/AppAnimations/nominee.json",
    });
}

function showRelativeModal() {
    bankId = undefined;
    hideModals();

    // append the choices
    $(".choices").empty();
    relativeChoices.forEach(function (choice) {
        if (choice == selectedRelative) {
            $(".choices").append(`
            <div class="choice d-flex justify-content-center align-items-center active" data-value="${choice}">${capitalizeWords(
                choice
            )}</div>
        `);
        } else {
            $(".choices").append(`
            <div class="choice d-flex justify-content-center align-items-center" data-value="${choice}">${capitalizeWords(
                choice
            )}</div>
        `);
        }
    });

    $(".choice").on("click", function () {
        selectedRelative = $(this).data("value");
        $(".choice").removeClass("active");
        $(this).addClass("active");
        $("#relation").val(capitalizeWords(selectedRelative));
    });

    setTimeout(() => {
        $(".modal-container").removeClass("d-none");
        $("#relative-choice-modal").removeClass("d-none");
        setTimeout(() => {
            $(".c-modal").addClass("show");
        }, 10);
    }, 100);
}

function showErrorModal(heading, message) {
    hideModals();
    $("#error-modal h4").text(heading);
    $("#error-modal .contents").text(message);
    setTimeout(() => {
        $(".modal-container").removeClass("d-none");
        $("#error-modal").removeClass("d-none");
        setTimeout(() => {
            $(".c-modal").addClass("show");
        }, 10);
    }, 100);
}

function showErrorModalWithExit(heading, message) {
    hideModals();
    $("#error-modal-with-exit h4").text(heading);
    $("#error-modal-with-exit .contents").text(message);
    setTimeout(() => {
        $(".modal-container").removeClass("d-none");
        $("#error-modal-with-exit").removeClass("d-none");
        setTimeout(() => {
            $(".c-modal").addClass("show");
        }, 10);
    }, 100);
}
function renderRelativeModal() {
    fetchRelativeChoices();
}

function submitForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const nominee = {};
    const errors = {};
    for (const [key, value] of formData.entries()) {
        $(`#${key}`).removeClass("error");
        nominee[key] = value;
        if (!value) {
            errors[key] = "This field is required";
        }
    }

    if (Object.keys(errors).length > 0) {
        Object.keys(errors).forEach((key) => {
            $(`#${key}`).addClass("error");
        });
        showErrorModal("Incomplete", "You've to fill all the data!");
    }
}

$("#button").on("click", function () {
    if (page == "form") {
        $("#form").submit();
        return;
    } else if (page == "list") {
        showErrorModalWithExit(
            "Nominee Details Not Saved",
            "Your nominee shares don’t add up to 100%. If you leave now, your changes will be lost."
        );
        return;
    }
});

$("#save-and-continue, .go-back").on("click", function () {
    hideModals();
});

$("#relation").on("click", function () {
    showRelativeModal();
});

$("input").on("click", function () {
    $("input").removeClass("error");
});

$(".close-modal").on("click", function () {
    hideModals();
});

$(".nominee-error .button").on("click", function () {
    renderForm();
});

$(".modal-container").on("click", function (e) {
    if (
        !$(".c-modal").is(e.target) &&
        $(".c-modal").has(e.target).length === 0
    ) {
        hideModals();
    }
});

renderLottie();
fetchRelativeChoices(); // this will fetch the relative choices

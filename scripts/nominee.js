const pages = ["home", "list", "form"];
var page = "home";
var prevPages = [];
var relativeChoices = [];
var selectedRelative = undefined;
var nominees = [];

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
            renderForm();
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

function renderNomineeList(response) {
    hideAllScreens();
    page = pages[1];
    $(".list-screen").removeClass("d-none");
    $(".list-screen").empty();
    response.forEach((nominee) => {
        const list = `
            <div class="list">
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
                <div class="list-button-container d-flex align-items-center justify-content-between gap-3">
                    <div class="c-button d-flex align-items-center justify-content-center gap-2">
                        <img src="${ASSETS_URL}/assets/mobile-webview/delete-vector.png" alt="delete-icon">
                        <span>Delete</span>
                    </div>
                    <div class="c-button d-flex align-items-center justify-content-center gap-2">
                        <img src="${ASSETS_URL}/assets/mobile-webview/update-icon.png" alt="update-icon">
                        <span>Update</span>
                    </div>
                </div>
            </div>
        `;
        $(".list-screen").append(list);
    });
}

fetchNominees();

function renderForm() {
    hideAllScreens();
    page = pages[2];
    $(".form-screen").removeClass("d-none");
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
            console.log(key);
            $(`#${key}`).addClass("error");
        });
        showErrorModal("Incomplete", "You've to fill all the data!");
    }
}

$("#button").on("click", function () {
    if (page == "form") {
        $("#form").submit();
    }
    renderForm();
});

$("#save-and-continue, .go-back").on("click", function () {
    hideModals();
});

$("#relation").on("click", function () {
    showRelativeModal();
});

renderLottie();
fetchRelativeChoices(); // this will fetch the relative choices

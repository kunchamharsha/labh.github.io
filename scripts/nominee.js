const pages = ["home", "list", "form"];
var page = "home";
var prevPages = [];
var relativeChoices = [];
var selectedRelative = undefined;
var nominees = [];
var availableNominees = [];
var allocationPercentage = 0;
var isError = false;
var isNewNominee = false;
var isUpdate = false;

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

function isValidPAN(pan) {
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
    return panRegex.test(pan);
}

function isValidDOB(dob) {
    const [year, month, day] = dob.split("-").map(Number);

    const date = new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
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

function fetchNominees(addHistory = true) {
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
            if (Object.keys(response).length === 0) {
                renderForm();
                return;
            }
            if (response.length > 0) renderNomineeList(response, addHistory);
        },
        error: function (xhr, status, error) {
            $(".loader-overlay").hide();
            renderHome();
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
            console.error("Nominee Details Not Saved", error);
        },
    });
}

function renderNomineeError() {
    $(".nominee-error").removeClass("d-none");
    $("#button").css("background", "rgba(166, 99, 255, 0.6)");
    $("#button").css("color", "rgba(255, 255, 255, 0.6)");
}

function renderNomineeList(response, addHistory = true) {
    nominees = response;
    hideAllScreens();
    page = pages[1];
    addHistory ? updatePrevPages(page) : null;
    $(".list-screen").removeClass("d-none");
    $(".list-screen").empty();
    nominees.length > 0 ? removePaddingFromListScreen() : undefined;
    allocationPercentage = calculatePercentage();

    if (isUpdate) {
        $("#list-bottom-button").removeClass("d-none");
    } else if (allocationPercentage == 100 && !isNewNominee) {
        $("#list-bottom-button").addClass("d-none");
    } else {
        $("#list-bottom-button").removeClass("d-none");
    }

    allocationPercentage != 100 ? renderNomineeError() : undefined;
    allocationPercentage != 100
        ? $("#list-bottom-button").addClass("opacity")
        : undefined;
    allocationPercentage == 100
        ? $("#list-bottom-button").removeClass("opacity")
        : undefined;

    response.forEach((nominee) => {
        if (nominee.is_active) {
            const list = `
            <div class="list">
                <div class="d d-flex align-items-center justify-content-between list-header">
                    <div class="section">
                        <img src="${ASSETS_URL}/assets/mobile-webview/edit-nominee.png" alt="edit" class="edit-icon" />
                        <span onclick="renderForm(${
                            nominee.id
                        })">Edit details </span>
                    </div>
                    <div class="section">
                        <img src="${ASSETS_URL}/assets/mobile-webview/delete-vector.png" alt="delete" onclick="showDeleteNomineeModal(${
                nominee.id
            })" />
                    </div>
                </div>
                <div class="d d-flex align-items-center justify-content-left gap-3">
                    <div class="d-flex align-items-center justify-content-left gap-1">
                        <img src="${ASSETS_URL}/assets/mobile-webview/iconamoon_profile-circle-fill.png" alt="logo">
                        <span>${nominee.name}</span>
                    </div>

                </div>
                <div class="nominee-details d-flex justify-content-between">
                    <div class="section d-flex flex-column w-50">
                        <div>Relationsip</div>
                        <span>${nominee.relationship}</span>
                    </div>
                    <div class="section d-flex flex-column w-auto">
                        <div>Allocation %</div>
                        <span>${parseInt(nominee.share_percentage)}</span>
                    </div>
                </div>
            </div>
        `;
            $(".list-screen").append(list);
        }
    });
}

function showValuesInForm(nominee) {
    selectedRelative = nominee.relationship.toLowerCase();
    $("#name").val(nominee.name);
    $("#pan").val(nominee.pan);
    $("#city").val(nominee.city);
    $("#date_of_birth").val(nominee.date_of_birth);
    $("#relationship").val(nominee.relationship);
    $("#phone_number").val(nominee.phone_number);
    $("#email").val(nominee.email);
    $("#pin_code").val(nominee.pin_code);
    $("#country").val(nominee.country);
    $("#address").val(nominee.address);
    $("#share_percentage").val(parseInt(nominee.share_percentage));
}

function renderForm(id = undefined) {
    hideAllScreens();
    updatePrevPages(page);
    page = pages[2];
    $("#list-bottom-button").addClass("d-none");
    $(".form-screen").removeClass("d-none");
    $(".button-container").addClass("d-none");
    $("#allocation-percentage").text(
        100 - allocationPercentage + "% remaining"
    );
    if (id != undefined) {
        nominee = nominees.filter((nominee) => nominee.id == id);
        $("#button").text("Update Nominee");
        showValuesInForm(nominee[0]);
        $("#form")
            .off("submit")
            .on("submit", function (e) {
                submitForm(e, nominee[0]);
            });
    } else {
        // this will avoid giving same nominee over again and again in the form
        $("#form")[0].reset();
        $("#form")
            .off("submit")
            .on("submit", function (e) {
                submitForm(e);
            });
        $("#button").text("Save and Continue");
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
    $(".helper-container, #banner, .home-screen, .c-warning").removeClass(
        "d-none"
    );
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

function deleteNominee(id) {
    nominees = nominees.map((nominee) => {
        if (nominee.id == id) {
            nominee.is_active = false;
            return nominee;
        }
        return nominee;
    });
    hideModals();
    renderNomineeList(nominees);
}

function showIncompleteAllocationModal() {
    hideModals();

    setTimeout(() => {
        $(".modal-container").removeClass("d-none");
        $("#incomplete-allocation-modal").removeClass("d-none");
        setTimeout(() => {
            $(".c-modal").addClass("show");
        }, 10);
    }, 100);
}

function showRelativeModal() {
    bankId = undefined;
    hideModals();

    // append the choices
    $(".choices").empty();
    relativeChoices.forEach(function (choice) {
        if (choice == selectedRelative) {
            $(".choices").append(`
            <div class="choice d-flex align-items-center active" data-value="${choice}">${capitalizeWords(
                choice
            )}</div>
        `);
        } else {
            $(".choices").append(`
            <div class="choice d-flex align-items-center" data-value="${choice}">${capitalizeWords(
                choice
            )}</div>
        `);
        }
    });

    $(".choice").on("click", function () {
        selectedRelative = $(this).data("value");
        $(".choice").removeClass("active");
        $(this).addClass("active");
        $("#relationship").val(capitalizeWords(selectedRelative));
    });

    setTimeout(() => {
        $(".modal-container").removeClass("d-none");
        $("#relative-choice-modal").removeClass("d-none");
        setTimeout(() => {
            $(".c-modal").addClass("show");
        }, 100);
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

function showDeleteNomineeModal(id) {
    hideModals();
    setTimeout(() => {
        $(".modal-container").removeClass("d-none");
        $("#delete-nominee-modal").removeClass("d-none");
        setTimeout(() => {
            $(".c-modal").addClass("show");
        }, 10);
    }, 100);
    $("#delete")
        .off("click")
        .on("click", function () {
            deleteNominee(id);
        });
}

function showSuccessNomineeModal() {
    hideModals();
    setTimeout(() => {
        $(".modal-container").removeClass("d-none");
        $("#nominee-update-modal").removeClass("d-none");
        setTimeout(() => {
            $(".c-modal").addClass("show");
        }, 10);
    }, 100);
}

function renderRelativeModal() {
    fetchRelativeChoices();
}

function calculatePercentage() {
    let totalPercentage = 0;
    nominees.forEach((nominee) => {
        if (nominee.is_active)
            totalPercentage += parseInt(nominee.share_percentage);
    });
    return totalPercentage;
}

function submitForm(event, nominee = {}) {
    event.preventDefault();

    if (isError) {
        showErrorModal(
            "Error",
            "Please check the details, there are some errors."
        );
        return;
    }
    const formData = new FormData(event.target);
    const errors = {};
    for (var [key, value] of formData.entries()) {
        $(`#${key}`).removeClass("error");
        nominee[key] = value;

        if (key == "pan") {
            if (!isValidPAN(value) && value != "") {
                $("#pan").addClass("error");
                showErrorModal(
                    "Incorrect Details",
                    "Please review the highlighted fields and re-enter the details correctly."
                );
                return; // this is needed
            }
        }
        if (key == "date_of_birth") {
            if (!isValidDOB(value) & value != "") {
                $("#date_of_birth").addClass("error");
                showErrorModal(
                    "Invalid Date",
                    "Please review the highlighted fields and re-enter the details correctly."
                );
                return; // this is needed
            }
        }
        if (!value) {
            errors[key] = "This field is required";
        }
    }

    if (Object.keys(errors).length > 0) {
        Object.keys(errors).forEach((key) => {
            $(`#${key}`).addClass("error");
        });
        showErrorModal(
            "Form filled partially",
            "Some fields are missing. Please fill in all required details before saving."
        );
        return;
    }
    if (!("id" in nominee)) {
        nominee["id"] = nominees.length + 1;
        nominee["is_active"] = true;
        nominee["country_code"] = "91";
        nominees.push(nominee);
        isNewNominee = true;
    } else {
        isUpdate = true;
    }
    allocationPercentage = calculatePercentage();
    renderNomineeList(nominees);
}

function submitNominee() {
    $(".loader-overlay").show();
    $.ajax({
        url: DOMAIN + "/api/kyc/nominee/update",
        type: "PUT",
        headers: {
            "access-token": getCookie("access-token"),
            "device-id": getCookie("device-id"),
            "Content-Type": "application/json",
        },
        data: JSON.stringify(nominees.filter((nominee) => nominee.is_active)),
        success: function (response) {
            $(".loader-overlay").hide();
            isNewNominee = false;
            showSuccessNomineeModal();
        },
        error: function (response) {
            $(".loader-overlay").hide();
            if (
                response.responseJSON.error == "You can't provide your own PAN"
            ) {
                showErrorModal(
                    "Pan Number cannot be yours",
                    "You cannot add yourself as a nominee. Please add a family member or relative."
                );
            } else {
                showErrorModal(
                    "Nominee Details Not Saved",
                    response.responseJSON.error
                );
            }
        },
    });
}

// we don't want to save pages that render with backbutton
// so if a page is rendered with backend button then we need to remove that page
function updatePrevPages(currentPage, remove = false) {
    if (remove) {
        prevPages.pop();
        return;
    }

    if (currentPage == pages[0] && prevPages.length > 0) {
        prevPages.push(currentPage);
    } else if (currentPage != pages[0]) {
        prevPages.push(currentPage);
    }
}

function back() {
    const backPage = prevPages.pop();
    switch (backPage) {
        case pages[1]:
            renderNomineeList(nominees, (addHistory = false));
            updatePrevPages(page, true);
            break;
        case pages[2]:
            renderForm();
            updatePrevPages(page, true);
            break;
        case page[0]:
            renderHome();
            updatePrevPages(page, true);
            break;
        default:
            window.location.href = "https://api.labh.io/profile";
            break;
    }
}

$("#button, #bottom-button, #list-bottom-button").on("click", function () {
    if (
        "list-bottom-button" == this.id &&
        $(this).hasClass("opacity")
    ) {
        return;
    }
    if (page == "form") {
        $("#form").submit();
    } else if (
        page == "list" &&
        allocationPercentage < 100 &&
        !isNewNominee &&
        !isUpdate
    ) {
        showIncompleteAllocationModal();
        renderForm();
    } else if (page == "list" && (isNewNominee || isUpdate)) {
        submitNominee();
    } else {
        renderForm();
    }
});

$("#save-and-continue, .go-back").on("click", function () {
    hideModals();
});

$("#relationship").on("click", function () {
    showRelativeModal();
});

$("input").on("click", function () {
    $("input, textarea").removeClass("error");
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

const input = document.getElementById("pan");

input.addEventListener("input", function () {
    this.value = String(this.value)
        .replace(/[^A-Z0-9]/gi, "")
        .toUpperCase()
        .substring(0, 10);
});

function name_validator(value, input_id) {
    const regex = /^[A-Za-z\s]{1,100}$/;
    const img = ASSETS_URL + "/assets/mobile-webview/jam_alert-f.svg";

    if (value == "") {
        return;
    }

    if (!value) {
        $(`#${input_id}-error`).html(`<img src=${img} />` + "Name is required");
        $(`#${input_id}`).addClass("error");
        isError = true;
    } else if (!regex.test(value.trim())) {
        $(`#${input_id}-error`).html(
            `<img src=${img} />` +
                "Please enter a valid name (letters and spaces only)"
        );
        $(`#${input_id}`).addClass("error");
        isError = true;
    } else {
        $(`#${input_id}-error`).text("");
        $(`#${input_id}`).removeClass("error");
        isError = false;
    }
}

function share_percentage_validator(value, input_id) {
    const img = ASSETS_URL + "/assets/mobile-webview/jam_alert-f.svg";
    if (value == "") {
        return;
    }
    if (value > 100) {
        $(`#${input_id}-error`).html(
            `<img src=${img} />` + "Please enter a valid percentage"
        );
        $(`#${input_id}`).addClass("error");
        isError = true;
        return;
    }
    if (!parseInt(value) > allocationPercentage) {
        $(`#${input_id}-error`).html(
            `<img src=${img} />` + `You only have ${allocationPercentage}% left`
        );
        $(`#${input_id}`).addClass("error");
        isError = true;
    } else {
        $(`#${input_id}-error`).html("");
        $(`#${input_id}`).removeClass("error");
        isError = false;
    }
}

$("#pan, #name, #share_percentage, #phone_number").on("input", function () {
    if (this.id == "pan") {
        this.value = String(this.value)
            .replace(/[^A-Z0-9]/gi, "")
            .toUpperCase()
            .substring(0, 10);
    } else if (this.id == "name") {
        name_validator(this.value, this.id);
    } else if (this.id == "phone_number") {
        if (this.value.length > 10) {
            this.value = this.value.slice(0, 13);
        }
    } else if (this.id == "share_percentage") {
        share_percentage_validator(this.value, this.id);
    }
});

if (DEBUG) {
    showErrorModalWithExit("Debug", document.cookie);
}

$(".button-container").addClass("d-none");
$("#list-bottom-button").addClass("d-none");

fetchNominees();

renderLottie();
fetchRelativeChoices(); // this will fetch the relative choices

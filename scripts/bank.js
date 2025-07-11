const pages = ["home", "banklist", "bankform", "success"];
var page = "home";
var prevPages = [];
var bankAccounts = [];
var bankId = undefined;

const headerHeight = $(".go-back").outerHeight(true);
const modalHeight = window.innerHeight - headerHeight;
$(".modal-container").css("height", modalHeight);

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
}

function hideAllScreens() {
    $(".c-warning, .list-screen, .form-screen, .success-screen").addClass(
        "d-none"
    );
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

function renderHomeScreenBottomButton() {
    $("#button")
        .html(
            `<img src="${ASSETS_URL}/assets/mobile-webview/mdi_bank-outline.png" alt="add-bank-icon">
                Add New Bank Account`
        )
        .addClass("bank-add-button")
        .removeClass("d-none");
}

function renderFormScreenBottomButton() {
    $("#button").text("Add Bank").removeClass("bank-add-button");
}

function renderBankAccounts(addHistory = true) {
    $(".loader-overlay").show();
    $.ajax({
        url: DOMAIN + "/api/kyc/bank",
        type: "GET",
        headers: {
            "access-token": getCookie("access-token"),
            "device-id": getCookie("device-id"),
        },
        success: function (response) {
            $(".loader-overlay").hide();

            // if there is no bank accounts we need to show the action required message.
            if (response.length === 0) {
                $(".helper-container").removeClass("d-none");
                return;
            }

            hideAllScreens();
            $(".no-accounts-view").addClass("d-none");
            $(".list-screen").removeClass("d-none");

            addHistory ? updatePrevPages(page) : null; // this fetch is working asyncronously
            page = pages[1];
            renderHomeScreenBottomButton();
            $(".list-screen").empty();
            response.forEach((account) => {
                const verifyCard = `
                    <div class="l-header d-flex justify-content-between">
                        <div class="verified d-flex justify-content-left align-items-center gap-1">
                            <img src="${ASSETS_URL}/assets/mobile-webview/Group 2369.png" alt="verified image">
                            <span>Primary</span>
                        </div>
                        <div class="delete" onclick="deleteBankAccountPrompt(${account.id})">
                            <img src="${ASSETS_URL}/assets/mobile-webview/delete-vector.png" alt="delete-icon">
                        </div>
                    </div>
                `;
                const deleteButton = `
                    <div class="delete" onclick="deleteBankAccountPrompt(${account.id})">
                        <img src="${ASSETS_URL}/assets/mobile-webview/delete-vector.png" alt="delete-icon">
                    </div>
                `;
                const bankCard = `
                    <div class="list">
                        ${
                            account.is_default === "Y"
                                ? verifyCard
                                : "<div></div>"
                        }
                        <div class="d d-flex justify-content-between gap-3">
                            <div class="d-flex justify-content-left gap-2">
                                <img src="https://cms-labh-bucket.s3.ap-south-2.amazonaws.com/mobile-webview-assets/default-bank.svg" alt="logo">
                                <span>${account.bank_name}</span>
                            </div>
                            ${
                                account.is_default === "N"
                                    ? deleteButton
                                    : "<div></div>"
                            }
                        </div>
                        <div class="u-d">
                            <div class="label">Account Number: </div>
                            <div class="account-number">${
                                account.account_number
                            }</div>
                            <div class="label">IFSC: </div>
                            <div class="ifsc-code">${account.ifsc_code}</div>
                        </div>
                    </div>
                `;
                $(".list-screen").append(bankCard);
            });
        },
        error: function (xhr, status, error) {
            $(".loader-overlay").hide();
            console.error("Error:", error);
        },
    });
}

function renderHomeScreen() {
    hideAllScreens();
    $(".c-warning").removeClass("d-none");
    $("#button").removeClass("bank-add-button");
}

function renderSuccessScreen() {
    hideAllScreens();
    $(".success-screen").removeClass("d-none");
    $("#button").addClass("d-none");
}

function renderLottie() {
    lottie.loadAnimation({
        container: document.getElementById("banner"),
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: "https://cms-labh-bucket.s3.ap-south-2.amazonaws.com/cms_images/AppAnimations/anual income.json",
    });
}

function back() {
    const backPage = prevPages.pop();
    switch (backPage) {
        case pages[1]:
            renderBankAccounts((addHistory = false));
            updatePrevPages(page, true);
            break;
        case pages[2]:
            renderBankForm();
            updatePrevPages(page, true);
            break;
        case page[0]:
            renderHomeScreen();
            updatePrevPages(page, true);
            break;
        default:
            window.location.href = "https://api.labh.io/profile";
            break;
    }
}

function renderBankForm() {
    updatePrevPages(page);
    page = pages[2];
    hideAllScreens();
    $(".form-screen").removeClass("d-none");
    renderFormScreenBottomButton();
}

function submitBankForm() {
    const acccountNumber = $("#account-number").val();
    const ifsc = $("#ifsc-code").val();
    if (acccountNumber === "" || ifsc === "") {
        showErrors("Error", "Please fill all the fields");
        return;
    }
    const data = {
        account_number: acccountNumber,
        ifsc_code: ifsc,
    };
    $(".loader-overlay").show();
    $.ajax({
        url: DOMAIN + "/api/kyc/bank/add-new/",
        type: "POST",
        headers: {
            "access-token": getCookie("access-token"),
            "device-id": getCookie("device-id"),
        },
        data: data,
        success: function (response) {
            $(".loader-overlay").hide();
            renderSuccessScreen();
            // showBankAccountSuccessModal();
        },
        error: function (error) {
            $(".loader-overlay").hide();
            console.error("Error:", error);
            response = error.responseJSON;
            if (response.account_number) {
                showErrors("Error", response.account_number);
            } else if (response.ifsc_code) {
                showErrors("Error", response.ifsc_code);
            } else {
                showErrors("Error", response);
            }
        },
    });
}

function deleteBankAccountPrompt(id) {
    bankId = id;
    hideModals();
    setTimeout(() => {
        $(".modal-container").removeClass("d-none");
        $("#remove-account-modal").removeClass("d-none");
        setTimeout(() => {
            $(".c-modal").addClass("show");
        }, 10);
    }, 100);
}

function showBankAccountSuccessModal() {
    bankId = undefined;
    hideModals();
    setTimeout(() => {
        $(".modal-container").removeClass("d-none");
        $("#success-modal").removeClass("d-none");
        setTimeout(() => {
            $(".c-modal").addClass("show");
        }, 10);
    }, 100);
}

function showBankDeleteSuccessModal() {
    hideModals();
    setTimeout(() => {
        $(".modal-container").removeClass("d-none");
        $("#account-removed-modal").removeClass("d-none");
        setTimeout(() => {
            $(".c-modal").addClass("show");
        }, 10);
    }, 100);
}

function deleteBankAccount(id) {
    $(".loader-overlay").show();
    $.ajax({
        url: DOMAIN + `/api/kyc/bank?id=${id}`,
        type: "DELETE",
        headers: {
            "access-token": getCookie("access-token"),
            "device-id": getCookie("device-id"),
        },
        success: function (response) {
            $(".loader-overlay").hide();
            renderBankAccounts();
            showBankDeleteSuccessModal();
        },
        error: function (error) {
            $(".loader-overlay").hide();
            response = error.responseJSON;
            if (response.error) {
                showErrors("Error", response.error);
            } else {
                showErrors("Error", "Something went wrong!");
            }
        },
    });
}

function showErrors(heading, description) {
    $(".c-modal").addClass("d-none"); // first we want to hide other c-modals.
    $(".modal-container").removeClass("d-none");
    $("#error-modal").removeClass("d-none");
    $("#error-heading").text(heading);
    $("#error-description").text(description);
    setTimeout(() => {
        $(".c-modal").addClass("show");
    }, 10);
}

function hideModals() {
    $(".c-modal").removeClass("show"); // this is needed for animation
    setTimeout(() => {
        $(".c-modal").addClass("d-none"); // this will first hide all the c-modals
        $(".modal-container").addClass("d-none");
    }, 100);
}

$("#button").on("click", function () {
    if (page === pages[1] || page == pages[0]) {
        renderBankForm();
    } else if (page === pages[2]) {
        // showErrors("Error", "Please fill all the fields");
        submitBankForm();
    }
});

$(".close-modal").on("click", function () {
    hideModals();
});

$("#remove-account").on("click", function () {
    deleteBankAccount(bankId);
});

$(".modal-container").on("click", function (e) {
    console.log($(".c-modal").is(e.target));
    console.log($(".c-modal").has(e.target).length);
    if (
        !$(".c-modal").is(e.target) &&
        $(".c-modal").has(e.target).length === 0
    ) {
        hideModals();
    }
});

$("#done").on("click", function () {
    renderBankAccounts();
});

$(".loader-overlay").hide();
renderBankAccounts();
renderLottie();

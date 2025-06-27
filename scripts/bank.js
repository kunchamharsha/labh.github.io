const pages = ["home", "banklist", "bankform"];
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
    $(".c-warning, .list-screen, .form-screen").addClass("d-none");
}

// we don't want to save pages that render with backbutton
// so if a page is rendered with backend button then we need to remove that page
function updatePrevPages(currentPage, remove = false) {
    if (remove) {
        prevPages.pop()
        return;
    }

    if (currentPage == pages[0] && prevPages.length > 0) {
        prevPages.push(currentPage);
    } else if (currentPage != pages[0]) {
        prevPages.push(currentPage);
    }
}

function renderBankAccounts(addHistory=true) {
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

            addHistory ? updatePrevPages(page) : null;  // this fetch is working asyncronously
            page = pages[1];
            $("#button").text("Add Bank Account");
            $(".list-screen").empty();
            response.forEach((account) => {
                const verifyCard = `
                    <div class="verified d-flex justify-content-left gap-1">
                        <img src="${ASSETS_URL}/assets/mobile-webview/Group 2369.png" alt="verified image">
                        <span>Primary</span>
                    </div>
                `;
                const bankCard = `
                    <div class="list">
                        <div class="d d-flex justify-content-between gap-3">
                            <div class="d-flex justify-content-left gap-2">
                                <img src="https://cms-labh-bucket.s3.ap-south-2.amazonaws.com/mobile-webview-assets/default-bank.svg" alt="logo">
                                <span>${account.bank_name}</span>
                            </div>
                            ${
                                account.is_default === "Y"
                                    ? verifyCard
                                    : "<div></div>"
                            }
                            
                        </div>
                        <div class="u-d">
                            <div class="name">${
                                account.name_at_bank || "-"
                            }</div>
                            <div class="account-number">${
                                account.account_number
                            }</div>
                        </div>
                        <div class="c-button d-flex align-items-center justify-content-center  gap-2" onclick="deleteBankAccountPrompt(${
                            account.id
                        })">
                            <img src="${ASSETS_URL}/assets/mobile-webview/delete-vector.png" alt="delete-icon">
                            <span>Delete</span>
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
}

function back() {
    const backPage = prevPages.pop();
    switch (backPage) {
        case pages[1]:
            renderBankAccounts(addHistory=false);
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
}

function submitBankForm() {
    const acccountNumber = $("#account-number").val();
    const confirmAccountNumber = $("#account-number-confirm").val();
    const ifsc = $("#ifsc-code").val();
    if (acccountNumber === "" || confirmAccountNumber === "" || ifsc === "") {
        showErrors("Error", "Please fill all the fields");
        return;
    }
    if (acccountNumber !== confirmAccountNumber) {
        showErrors(
            "Error",
            "Account number and confirm account number do not match"
        );
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
            renderBankAccounts();
            showBankAccountSuccessModal();
        },
        error: function (xhr, status, error) {
            $(".loader-overlay").hide();
            showErrors("Error", error);
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
        error: function (xhr, status, error) {
            $(".loader-overlay").hide();
            showErrors("Error", error);
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
    if (page === pages[1]) {
        renderBankForm();
    } else if (page === pages[2]) {
        // showErrors("Error", "Please fill all the fields");
        submitBankForm();
    }
});

$(".c-close").on("click", function () {
    hideModals();
});

$("#remove-account").on("click", function () {
    deleteBankAccount(bankId);
});

renderBankAccounts();

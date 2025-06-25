const pages = ["home", "banklist", "bankform"];
var page = "home";
var bankAccounts = [];
var bankId = undefined;

const headerHeight = $(".header").outerHeight(true);
const modalHeight = window.innerHeight - headerHeight;
$(".modal-container").css("height", modalHeight);

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
}

function hideAllScreens() {
    $(".no-accounts-view, .bank-list, .bank-form").addClass("d-none");
}

function renderBankAccounts(bankAcconts) {
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
            $(".bank-list").removeClass("d-none");

            page = pages[1];
            $("#button").text("Add Bank Account");
            $(".bank-list").empty();
            response.forEach((account) => {
                const verifyCard = `
                    <div class="verified d-flex align-items-center justify-content-left gap-1">
                        <img src="${ASSETS_URL}/assets/mobile-webview/Group 2369.png" alt="verified image">
                        <span>Verified</span>
                    </div>
                `;
                const bankCard = `
                    <div class="bank">
                        <div class="d d-flex align-items-center justify-content-left gap-3">
                            <div class="d-flex align-items-center justify-content-left gap-1">
                                <img src="{{ static_url }}/assets/mobile-webview/image 17.png" alt="logo">
                                <span>${account.bank_name}</span>
                            </div>
                            ${account.is_verified ? verifyCard : "<div></div>"}
                            
                        </div>
                        <div class="u-d">
                            <div class="name">${
                                account.name_at_bank || "-"
                            }</div>
                            <div class="account-number">${
                                account.account_number
                            }</div>
                        </div>
                        <div class="d-button d-flex align-items-center justify-content-center  gap-2" onclick="deleteBankAccountPrompt(${
                            account.id
                        })">
                            <img src="${ASSETS_URL}/assets/mobile-webview/delete-vector.png" alt="delete-icon">
                            <span>Delete</span>
                        </div>
                    </div>
                `;
                $(".bank-list").append(bankCard);
            });
        },
        error: function (xhr, status, error) {
            console.error("Error:", error);
        },
    });
}

function renderBankForm() {
    page = pages[2];
    hideAllScreens();
    $(".bank-form").removeClass("d-none");
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
    $(".modal-container").removeClass("d-none");
    $("#remove-account-modal").removeClass("d-none");
}

function showBankAccountSuccessModal() {
    bankId = undefined;
    hideModals();
    $(".modal-container").removeClass("d-none");
    $("#success-modal").removeClass("d-none");
}

function showBankDeleteSuccessModal() {
    hideModals();
    $(".modal-container").removeClass("d-none");
    $("#account-removed-modal").removeClass("d-none");
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
    $(".c-modal").addClass("d-none");  // first we want to hide other c-modals.
    $(".modal-container").removeClass("d-none");
    $("#error-modal").removeClass("d-none");
    $("#error-heading").text(heading);
    $("#error-description").text(description);
}

function hideModals() {
    $(".c-modal").addClass("d-none");  // this will first hide all the c-modals
    $(".modal-container").addClass("d-none");
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

$('#remove-account').on('click', function () {
    deleteBankAccount(bankId);
})

renderBankAccounts();

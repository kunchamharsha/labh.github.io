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
        },
        error: function (xhr, status, error) {
            $(".loader-overlay").hide();
            console.error("Error:", error);
        },
    });
}

function renderNomineeList(response) {
    hideAllScreens();
    $(".list-screen").removeClass("d-none");
    $('.list-screen').empty();
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
        $('.list-screen').append(list);

    });
}

fetchNominees();

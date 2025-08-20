const DOMAIN = "https://devapi.labh.io";
const ASSETS_URL = "https://labh.io";


function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
}

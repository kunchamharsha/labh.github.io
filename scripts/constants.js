const DOMAIN = "https://api.labh.io";
const ASSETS_URL = "https://labh.io";
const DEBUG = false;

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
}

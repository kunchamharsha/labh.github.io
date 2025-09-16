const DOMAIN = "http://localhost:8000";
const ASSETS_URL = "http://localhost:8080";
const DEBUG = false;

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
}

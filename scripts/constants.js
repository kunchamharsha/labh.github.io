const DOMAIN = "https://devapi.labh.io";
const ASSETS_URL = "https://labh.io";
// document.cookie =
//     "access-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTU5MDcyMDAsImlhdCI6MTc1NTgzOTI3NywiaWQiOjM2LCJjcmVhdGVkX2F0IjoiMjAyNS0wMi0wNVQxNTo1Mzo0Mi4xNzk0NDkrMDU6MzAiLCJ1cGRhdGVkX2F0IjoiMjAyNS0wNy0zMFQxNjo1MzozOC40ODU3NzQrMDU6MzAiLCJuYW1lIjoiIiwiY2xpZW50X2NvZGUiOjIzNjYsInBob25lX251bWJlciI6Iis5MTg2MDY1MjY4NjEiLCJlbWFpbCI6ImFzaGlzaEBsYWJoLmlvIiwiaXNfYWN0aXZlIjp0cnVlLCJpc19reWNfdmVyaWZpZWQiOnRydWUsImlzX2VtYWlsX3ZlcmlmaWVkIjp0cnVlLCJyZWFkeV90b19pbnZlc3QiOnRydWUsInNpZ25hdHVyZV91cmwiOiJodHRwczovL2FvZi10aWZmLWJ1Y2tldC5zMy5hcC1zb3V0aC0yLmFtYXpvbmF3cy5jb20vc3RhZ2luZy9zaWduYXR1cmVfaW1hZ2UvMzZpbWcxLnBuZyIsImtyYV9zdGF0dXMiOiJhbHJlYWR5IGRvbmUiLCJkZXZpY2VfaWQiOiI5ODc2NSIsImlzX3Bpbl92ZXJpZmllZCI6dHJ1ZSwibm9taW5lZV9mbGFnIjpmYWxzZX0.nOYib-DV_Z6XHCCVcQGRID4xzWvKD2rDLck7gTmsQ3U";
// document.cookie = "device-id=98765";


function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
}

const DOMAIN = "http://localhost:8000";
const ASSETS_URL = "http://localhost:8080";
document.cookie =
    "access-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTU2NDgwMDAsImlhdCI6MTc1NTYwNzEwOCwiaWQiOjM2LCJjcmVhdGVkX2F0IjoiMjAyNS0wMi0wNVQxNTo1Mzo0Mi4xNzk0NDkrMDU6MzAiLCJ1cGRhdGVkX2F0IjoiMjAyNS0wNy0zMFQxNjo1MzozOC40ODU3NzQrMDU6MzAiLCJuYW1lIjoiIiwiY2xpZW50X2NvZGUiOjIzNiwicGhvbmVfbnVtYmVyIjoiKzkxODYwNjUyNjg2MSIsImVtYWlsIjoiYXNoaXNoQGxhYmguaW8iLCJpc19hY3RpdmUiOnRydWUsImlzX2t5Y192ZXJpZmllZCI6dHJ1ZSwiaXNfZW1haWxfdmVyaWZpZWQiOnRydWUsInJlYWR5X3RvX2ludmVzdCI6dHJ1ZSwic2lnbmF0dXJlX3VybCI6Imh0dHBzOi8vYW9mLXRpZmYtYnVja2V0LnMzLmFwLXNvdXRoLTIuYW1hem9uYXdzLmNvbS9zdGFnaW5nL3NpZ25hdHVyZV9pbWFnZS8zNmltZzEucG5nIiwia3JhX3N0YXR1cyI6ImFscmVhZHkgZG9uZSIsImRldmljZV9pZCI6Ijk4NzY1IiwiaXNfcGluX3ZlcmlmaWVkIjp0cnVlLCJub21pbmVlX2ZsYWciOmZhbHNlfQ.jjq6WZEls9tMKG1YPMzWFaVchWgro8nSK_r5pPlM-C0";
document.cookie = "device-id=98765";


function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
}

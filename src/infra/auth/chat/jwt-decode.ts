import { jwtDecode } from "jwt-decode";

const token = "eyJ0eXAiO.../// jwt token";
const decoded = jwtDecode(token);

console.log(decoded);
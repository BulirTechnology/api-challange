import { jwtDecode } from "jwt-decode";

export async function getUserByAuthToken(jwtToken: string) {  
  try {
    const {
      sub,
      exp,
    } = jwtDecode(jwtToken);
    console.log("inside auth: ", sub, exp);
    if (!exp) {
      return {
        id: "",
      };
    }

    if (Date.now() < exp * 1000) {
      return {
        id: sub
      };
    }
  } catch(err) {
    return {
      id: ""
    };
  }
}
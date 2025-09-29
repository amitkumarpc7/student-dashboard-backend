import jwt from "jsonwebtoken";

export const signPayment = (payload) => {
  return jwt.sign(payload, process.env.PG_KEY, { algorithm: "HS256" });
};

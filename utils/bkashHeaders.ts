// utils/bkashHeaders.ts
const bkashHeaders = (idToken: string) => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  authorization: idToken,
  "x-app-key": process.env.bkash_api_key as string,
});

export default bkashHeaders;

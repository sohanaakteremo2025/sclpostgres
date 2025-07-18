// utils/bkashAuth.ts
import { NextRequest } from "next/server";
import axios from "axios";

const bkashAuth = async (req: NextRequest): Promise<string> => {
  try {
    const { data } = await axios.post(
      process.env.bkash_grant_token_url as string,
      {
        app_key: process.env.bkash_api_key,
        app_secret: process.env.bkash_secret_key,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          username: process.env.bkash_username as string,
          password: process.env.bkash_password as string,
        },
      }
    );

    return data.id_token;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export default bkashAuth;

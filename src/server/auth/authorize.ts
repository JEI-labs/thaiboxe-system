import { env } from "@/env";
import { type User } from "next-auth";
import { detailsDTO } from "./details.dto";

export async function authorize(
  credentials: Record<"username" | "password", string> | undefined,
  // req: Pick<RequestInternal, "body" | "query" | "headers" | "method">,
): Promise<User | null> {
  try {
    const response = await fetch(`${env.API_URL}/v2/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: credentials?.username,
        password: credentials?.password,
      }),
    });

    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const auth = (await response.json()) as {
      access_token: string;
      expires_at: string;
    };

    const detailsRes = await fetch(`${env.API_URL}/account`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.access_token}`,
        "Content-Type": "application/json",
      },
    });

    // sem details
    if (!detailsRes.ok) throw new Error(`Error: ${response.status}`);
    const details = (await detailsRes.json()) as detailsDTO;

    return {
      id: details.user.id,
      username: details.user.username,
      name: details.user.name,
      email: details.user.email,
      account_type: details.holder_type
        .replace("App\\Models\\", "")
        .toLowerCase(),
      access_token: auth.access_token,
      expires_at: auth.expires_at,
      document: details.document,
      phone: details.phone,
      status: details.status,
      bank: {
        manager_id: details.manager_id,
        bank_number: details.bank_number,
        branch_number: details.branch_number,
        branch_digit: details.branch_digit,
        account_number: details.account_number,
        account_digit: details.account_digit,
        account_type: details.account_type,
      },
      otp: {
        secret: "MXDJHSD6A6WV2PKF", // conta braia
        issuer: "MeuBanko",
        algorithm: "SHA1",
        digits: 6,
        period: 30,
      },
    };

    // console.log("Success:", data);
  } catch (error) {
    // Log error
    console.error("Error:", error);
  }
  return null;
}

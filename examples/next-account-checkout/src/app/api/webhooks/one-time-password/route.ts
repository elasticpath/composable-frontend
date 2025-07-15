/**
 * Webhook for one-time password token creation
 * In a real implementation, this would send an email to the user with the password reset link
 */

import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()

    if (payload.triggered_by === "one-time-password-token-request.created") {
      // Extract information from the webhook payload
      const {
        one_time_password_token,
        purpose,
        user_authentication_info,
        user_authentication_password_profile_info,
      } = payload.payload

      if (purpose === "reset_password" && one_time_password_token) {
        const email = user_authentication_info?.email
        const profileInfoId = user_authentication_password_profile_info?.id

        // In a real implementation, this would send an email
        // For demonstration purposes, we're just logging the reset link
        console.log(`
          [RESET PASSWORD EMAIL]
          To: ${email}
          Subject: Reset Your Password
          
          Hello,
          
          You requested to reset your password. Please use the following link to reset your password:
          
          ${
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          }/reset-password?token=${one_time_password_token}&email=${encodeURIComponent(
            email,
          )}&profileInfoId=${profileInfoId}
          
          If you did not request this password reset, please ignore this email.
          
          Thank you,
          Shopper Store Team
        `)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { success: false, error: "Failed to process webhook" },
      { status: 500 },
    )
  }
}

/**
 * Configure CORS for the webhook endpoint
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

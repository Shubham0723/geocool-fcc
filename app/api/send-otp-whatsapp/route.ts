import { type NextRequest, NextResponse } from 'next/server';

// Ensure this route runs on the Node.js runtime and isn't statically optimized
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { getDatabase } from '@/lib/mongodb';
import { OTPService } from '@/lib/otp-service';
import { generateOTP } from '@/lib/email';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const phone = body?.phone;
        const onlyCheck: boolean = body?.onlyCheck === true;

        if (!phone) {
            return NextResponse.json({ error: 'phone required' }, { status: 400 });
        }

        // Normalize to digits and treat as a NUMBER for DB lookups
        const normalizedPhoneStr = String(phone).replace(/\D/g, '');
        const normalizedPhone = Number(normalizedPhoneStr);
        if (!Number.isFinite(normalizedPhone)) {
            return NextResponse.json({ error: 'invalid phone' }, { status: 400 });
        }

        const db = await getDatabase();
        const user = await db.collection('users').findOne(
            { phone: normalizedPhone },
            { projection: { _id: 1 } }
        );

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                {
                    status: 404,
                },
            );
        }

        // If this call is just a user existence check, do not generate/send OTP
        if (onlyCheck) {
            return NextResponse.json(
                { status: true, data: { exists: true } },
                { status: 200 },
            );
        }

        const otp = generateOTP();
        const otpService = await OTPService.getInstance();
        // Store OTP keyed by phone string (service expects string key)
        await otpService.createOTP(normalizedPhoneStr, otp);

        if (!otp) {
            return NextResponse.json(
                { error: 'Could not send OTP' },
                {
                    status: 500,
                },
            );
        }

        // if (serverEnvironment.NODE_ENV === 'development') {
        //   console.log(otp);
        // } 
        console.log("Sending OTP to WhatsApp for phone:", normalizedPhone);

        try {
            const otpResponse = await sendOtpOnWhatsapp(otp as string, normalizedPhoneStr);
            const data = await otpResponse.json();
            console.log("WhatsApp API response:", data);
        } catch (err) {
            console.error("WhatsApp API error:", err);
        }


        return NextResponse.json(
            { status: true, data: {} },
            { status: 200 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.message || 'Could not send OTP' },
            {
                status: 500,
            },
        );
    }
}

// Lightweight GET for health-checking the route path in browser
export async function GET() {
    return NextResponse.json({ ok: true, route: 'send-otp-whatsapp' }, { status: 200 });
}

const sendOtpOnWhatsapp = async (otp: string, phone: string) => {
    // Using project env names as provided
    const accessToken = process.env.WHATAPP_CLOUD_API_ACCESS_TOKEN as string;
    // Phone Number ID is required for the /messages endpoint (NOT the WABA ID)
    const phoneNumberId =
        (process.env.WHATAPP_CLOUD_API_PHONE_NUMBER_ID as string) ||
        (process.env.WHATAPP_CLOUD_API_SENDER_PHONE_NUMBER_ID as string) ||
        (process.env.WHATAPP_CLOUD_API_WABA_ID as string); // fallback if incorrectly provided

    if (!accessToken || !phoneNumberId) {
        throw new Error('Missing WhatsApp Cloud API env vars (need WHATAPP_CLOUD_API_ACCESS_TOKEN and WHATAPP_CLOUD_API_PHONE_NUMBER_ID)');
    }
    const template = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phone,
        type: 'template',
        template: {
            name: 'otp_verification',
            language: {
                code: 'en',
            },
            components: [
                {
                    type: 'body',
                    parameters: [
                        {
                            type: 'text',
                            text: otp,
                        },
                    ],
                },
                {
                    type: 'button',
                    sub_type: 'url',
                    index: '0',
                    parameters: [
                        {
                            type: 'text',
                            text: otp,
                        },
                    ],
                },
            ],
        },
    };

    return await fetch(
        `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
        {
            method: 'POST',
            body: JSON.stringify(template),
            headers: {
                'Content-Type': 'application/json',
                'Accept-Language': 'en_US',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
            cache: 'no-store',
        },
    );
};
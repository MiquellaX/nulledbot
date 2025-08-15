import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const body = await req.json();

        const orderId = `order-${Date.now()}`;

        const response = await fetch("https://app.midtrans.com/snap/v1/transactions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    "Basic " + Buffer.from(process.env.MIDTRANS_SERVER_KEY + ":").toString("base64"),
            },
            body: JSON.stringify({
                transaction_details: {
                    order_id: orderId,
                    gross_amount: body.amount,
                },
                item_details: body.items,
                customer_details: body.customer,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: data }, { status: response.status });
        }
        return NextResponse.json(data);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

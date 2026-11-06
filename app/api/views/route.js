import { cookies } from "next/headers";
import sql from "@/lib/sql";

export async function POST(request) {
    const cookieStore = await cookies();

    if (cookieStore.get("hasVisited")?.value !== "1") {
        await sql`
            INSERT INTO visitors(user_agent)
            VALUES(${request.headers.get("user-agent")});
        `;

        cookieStore.set("hasVisited", "1", {
            maxAge: 60 * 60 * 24 * 30,
            secure: true,
            httpOnly: true,
            sameSite: "lax"
        });
    }

    return Response.json(null);
}

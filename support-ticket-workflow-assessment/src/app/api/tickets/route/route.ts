import { NextResponse } from "next/server";
import { routeTicket } from "@/config/routing";
import { isTicketCategory, isTicketSeverity } from "@/config";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const category = isTicketCategory(body?.category) ? body.category : "Other";
    const severity = isTicketSeverity(body?.severity) ? body.severity : "Medium";

    const routing = routeTicket({ category, severity });

    // Log for tuning and auditing (category, severity → teamId)
    console.log("[ticket-route]", {
      category,
      severity,
      teamId: routing.teamId,
      teamName: routing.teamName,
    });

    return NextResponse.json(routing);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Routing failed.";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

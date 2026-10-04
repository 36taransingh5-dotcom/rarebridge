import { NextResponse } from "next/server";
import { generateBrief } from "@/lib/generateBrief";

export const dynamic = "force-dynamic";

export async function POST() {
  const brief = await generateBrief();
  return NextResponse.json(brief);
}

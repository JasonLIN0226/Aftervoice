import { transformSentence } from "@/lib/deepseek";

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { sentence?: unknown } | null;
  const sentence = typeof body?.sentence === "string" ? body.sentence.replace(/\s+/g, " ").trim() : "";

  if (!sentence) {
    return badRequest("Sentence is required.");
  }

  if (sentence.length > 220) {
    return badRequest("Sentence must be 220 characters or fewer.");
  }

  const transformation = await transformSentence(sentence);
  return Response.json(transformation);
}

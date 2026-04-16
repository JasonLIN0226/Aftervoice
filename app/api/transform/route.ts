import { DeepSeekConfigError, transformSentence } from "@/lib/deepseek";
import { MAX_SENTENCE_LENGTH, normalizeSentence } from "@/lib/transform";

function badRequest(message: string) {
  return Response.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { sentence?: unknown } | null;
  const sentence = typeof body?.sentence === "string" ? normalizeSentence(body.sentence) : "";

  if (!sentence) {
    return badRequest("Sentence is required.");
  }

  if (sentence.length > MAX_SENTENCE_LENGTH) {
    return badRequest(`Sentence must be ${MAX_SENTENCE_LENGTH} characters or fewer.`);
  }

  try {
    const result = await transformSentence(sentence);
    return Response.json(result);
  } catch (error) {
    if (error instanceof DeepSeekConfigError) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ error: "Transformation failed." }, { status: 500 });
  }
}

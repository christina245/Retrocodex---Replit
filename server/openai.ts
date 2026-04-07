interface ModerationResult {
  flagged: boolean;
  needsReview: boolean;
  categories: Record<string, number>;
}

export async function moderateText(text: string): Promise<ModerationResult | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: "omni-moderation-latest", input: text }),
    });

    if (!response.ok) {
      console.error("[openai] Moderation API error:", response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const result = data.results?.[0];
    if (!result) return null;

    const flagged = result.flagged === true;
    const scores: Record<string, number> = result.category_scores ?? {};
    const needsReview = !flagged && Object.values(scores).some((score) => (score as number) > 0.5);

    return { flagged, needsReview, categories: scores };
  } catch (err) {
    console.error("[openai] Moderation check failed:", err);
    return null;
  }
}

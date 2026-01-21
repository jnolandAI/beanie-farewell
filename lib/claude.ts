import { BeanieIdentification, FollowUpQuestion, FollowUpType } from '../types/beanie';
import { safeParseJSON } from './errors';
import { getApiEndpoint } from './network';

/**
 * Detect image media type from base64 data's magic bytes.
 * This ensures the Claude API receives the correct media type
 * regardless of what format expo-image-picker outputs.
 */
function detectMediaType(base64: string): string {
  if (base64.startsWith('/9j/')) return 'image/jpeg';
  if (base64.startsWith('iVBORw0KGgo')) return 'image/png';
  if (base64.startsWith('UklGR')) return 'image/webp';
  if (base64.startsWith('R0lGOD')) return 'image/gif';
  // Default to JPEG as fallback
  return 'image/jpeg';
}

/**
 * The comprehensive prompt for Smart Variant Detection.
 * Instructs Claude to flag high-value items for follow-up questions.
 */
const IDENTIFICATION_PROMPT = `Identify this Beanie Baby and estimate its value. Return JSON with these fields:

REQUIRED FIELDS:
- name: the Beanie Baby name (or "Not a Beanie Baby" if not one)
- animal_type: what animal it is
- variant: specific variant if identifiable (e.g., "Royal Blue", "Standard")
- colors: array of colors visible
- estimated_value_low: integer USD (most common scenario: 4th/5th gen tag, good condition)
- estimated_value_high: integer USD (best realistic scenario for this specific item based on what's visible)
- confidence: "High", "Medium", or "Low"
- has_visible_hang_tag: boolean

CRITICAL - roast (REQUIRED):
Generate a funny, savage but affectionate roast of this specific Beanie Baby (1-2 sentences).
- Be witty and specific to THIS Beanie (its name, animal type, colors, or history)
- Mock the 90s Beanie craze and the idea these were "investments"
- Keep it lighthearted - we're laughing WITH millennials, not at them
- Reference the specific value if relevant (e.g., if it's worth $3, roast that)
- No mean-spirited or offensive content
Examples:
- "Ah, Teddy. The participation trophy of Beanie Babies. Everyone had one, no one got rich."
- "Legs the Frog: proving that even in the 90s, putting all your money in amphibians was a bad call."
- "Princess Bear - the one that launched a thousand eBay disputes and zero retirements."

CRITICAL - detected_assumptions (REQUIRED):
This tells the user what YOU observed in the photo and what you're assuming for the valuation.
- detected_assumptions: object with what you can see/assume:
  {
    "tag_status": "Visible" | "Not visible" | "Partially visible",
    "tag_generation": "Unknown" | "Appears to be 4th/5th gen" | "Appears to be 1st-3rd gen" | specific if identifiable,
    "condition_estimate": "Mint" | "Excellent" | "Good" | "Fair" | "Cannot determine",
    "condition_notes": "Brief explanation of condition based on what you see (e.g., 'Tag appears creased', 'Fur looks clean and fluffy')",
    "special_features": ["any notable features observed, e.g., 'Tag protector visible', 'Tush tag visible'"]
  }

CRITICAL - value_breakdown (REQUIRED):
- value_breakdown: object explaining EXACTLY what drives value differences:
  {
    "no_tag": "$X-Y",
    "common_tag": "$X-Y (4th/5th gen, most common)",
    "early_tag": "$X-Y (1st-3rd gen, if applicable)",
    "mint_premium": "+X% for mint with tag protector",
    "key_factors": ["factor 1 that affects value", "factor 2", ...]
  }

- value_notes: 1-2 sentences explaining WHY you chose this specific value range based on what you observed

SMART VARIANT DETECTION:
- needs_follow_up: boolean - TRUE if estimated_value_high >= 75 OR known valuable variants exist

If needs_follow_up is true, include:
- follow_up_questions: array of 2-3 questions. Each has:
  - type: "condition" | "pellet_type" | "tush_tag_photo" | "hang_tag_photo" | "color_confirmation"
  - question: the question text
  - reason: why this matters
  - options: array of choices (for non-photo questions)
  - valueImpact: specific dollar impact (e.g., "PVC pellets: $100-300, PE pellets: $10-30")

- potential_value_if_rare: { low: int, high: int, conditions: "what makes it valuable" }

CONSISTENCY RULES (CRITICAL):
- Use these EXACT base values for common Beanies (4th/5th gen tag, good condition):
  * Most bears: $5-15
  * Original 9 members: $8-20
  * Common animals (dogs, cats, etc.): $5-12
  * Retired pre-1997: $10-25
- Only deviate from base values if you see SPECIFIC evidence (visible 1st gen tag, rare color, etc.)
- The same Beanie in the same condition MUST return the same values every time

FIXED VALUE REFERENCES:
- Princess (standard PE, 4th/5th gen): $15-40
- Princess (PVC pellets, Indonesia): $200-500
- Peanut light blue: $5-15
- Peanut royal blue: $3,000-5,000
- Valentino (PE): $10-30
- Valentino (PVC): $100-300
- Peace (common): $5-20
- Garcia: $15-40
- Original 9 with 1st gen tags: $300-1,000+`;

export async function identifyBeanieFromImage(
  base64Image: string
): Promise<BeanieIdentification> {
  // Get API endpoint configuration (Supabase Edge Function in production, direct in dev)
  const { url, headers } = getApiEndpoint();

  // Detect the actual image format from base64 magic bytes
  const mediaType = detectMediaType(base64Image);

  // Debug logging
  console.log('[Claude API] Detected media type:', mediaType);
  console.log('[Claude API] Using endpoint:', url);
  console.log('[Claude API] Base64 length:', base64Image.length);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      temperature: 0, // Deterministic responses for consistent valuations
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: IDENTIFICATION_PROMPT,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Claude API] Error response:', errorText);
    throw new Error(`API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Validate response structure
  if (!data.content || !Array.isArray(data.content)) {
    console.error('[Claude API] Unexpected response structure:', data);
    throw new Error('Unexpected API response format. Please try again.');
  }

  // Extract text from Claude's response
  const responseText = data.content
    .filter((block: any) => block.type === 'text')
    .map((block: any) => block.text)
    .join('');

  // Parse JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in Claude response');
  }

  const result = safeParseJSON<BeanieIdentification | null>(jsonMatch[0], null, 'beanie identification');
  if (!result) {
    throw new Error('Failed to parse identification result. Please try again.');
  }
  return result;
}

/**
 * Text-only prompt for looking up a Beanie Baby by name.
 * Used when user searches by name instead of taking a photo.
 */
const TEXT_IDENTIFICATION_PROMPT = `Provide a value estimate for the Beanie Baby named "{name}" ({animal_type}).

Return JSON with these fields:
- name: "{name}"
- animal_type: "{animal_type}"
- variant: "Standard" (unless searching for a specific variant)
- colors: array of typical colors for this Beanie
- estimated_value_low: integer USD (most common scenario: 4th/5th gen tag, good condition)
- estimated_value_high: integer USD (best realistic scenario with early tag, mint condition)
- confidence: "High"
- has_visible_hang_tag: true

CRITICAL - roast (REQUIRED):
Generate a funny, savage but affectionate roast of this specific Beanie Baby (1-2 sentences).
- Be witty and specific to THIS Beanie (its name, animal type, colors, or history)
- Mock the 90s Beanie craze and the idea these were "investments"
- Keep it lighthearted - we're laughing WITH millennials, not at them
- Reference the specific value if relevant (e.g., if it's worth $3, roast that)
- No mean-spirited or offensive content
Examples:
- "Ah, Teddy. The participation trophy of Beanie Babies. Everyone had one, no one got rich."
- "Legs the Frog: proving that even in the 90s, putting all your money in amphibians was a bad call."
- "Princess Bear - the one that launched a thousand eBay disputes and zero retirements."

CRITICAL - value_breakdown (REQUIRED):
- value_breakdown: object with EXACT price ranges:
  {
    "no_tag": "$X-Y",
    "common_tag": "$X-Y (4th/5th gen, most common)",
    "early_tag": "$X-Y (1st-3rd gen)",
    "mint_premium": "+X% for mint with tag protector",
    "key_factors": ["factor 1", "factor 2", ...]
  }

- value_notes: What specifically affects this Beanie's value (variants, errors, tag generations)

- needs_follow_up: TRUE if valuable variants exist (Princess, Peanut, Valentino, Peace, etc.)

If needs_follow_up is true, include:
- follow_up_questions: array of 2-3 questions with:
  - type: "condition" | "pellet_type" | "tush_tag_photo" | "hang_tag_photo" | "color_confirmation"
  - question: the question text
  - reason: why it matters
  - options: array of choices
  - valueImpact: SPECIFIC dollar ranges (e.g., "PVC: $100-300, PE: $10-30")

- potential_value_if_rare: { low: int, high: int, conditions: "requirements" }

CONSISTENCY RULES (use these EXACT values):
- Most bears (4th/5th gen): $5-15
- Original 9 (4th/5th gen): $8-20
- Common dogs/cats: $5-12
- Princess (PE, common): $15-40
- Princess (PVC, Indonesia): $200-500
- Peanut light blue: $5-15
- Peanut royal blue: $3,000-5,000
- Valentino (PE): $10-30
- Valentino (PVC): $100-300
- Garcia: $15-40
- Original 9 with 1st gen: $300-1,000+`;

/**
 * Identify a Beanie Baby by name (text-only, no image).
 * Used when user searches by typing instead of taking a photo.
 */
export async function identifyBeanieByName(
  beanieName: string,
  animalType: string
): Promise<BeanieIdentification> {
  // Get API endpoint configuration (Supabase Edge Function in production, direct in dev)
  const { url, headers } = getApiEndpoint();

  const prompt = TEXT_IDENTIFICATION_PROMPT
    .replace(/\{name\}/g, beanieName)
    .replace(/\{animal_type\}/g, animalType);

  console.log('[Claude API] Text query for:', beanieName, animalType);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      temperature: 0, // Deterministic responses for consistent valuations
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Claude API] Error response:', errorText);
    throw new Error(`API request failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // Validate response structure
  if (!data.content || !Array.isArray(data.content)) {
    console.error('[Claude API] Unexpected response structure:', data);
    throw new Error('Unexpected API response format. Please try again.');
  }

  // Extract text from Claude's response
  const responseText = data.content
    .filter((block: any) => block.type === 'text')
    .map((block: any) => block.text)
    .join('');

  // Parse JSON from response
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in Claude response');
  }

  const result = safeParseJSON<BeanieIdentification | null>(jsonMatch[0], null, 'beanie identification');
  if (!result) {
    throw new Error('Failed to parse identification result. Please try again.');
  }
  return result;
}

import { BeanieIdentification } from '../types/beanie';

const ANTHROPIC_API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

export async function identifyBeanieFromImage(
  base64Image: string
): Promise<BeanieIdentification> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not found in environment variables');
  }

  // Debug logging
  console.log('[Claude API] Base64 first 100 chars:', base64Image.substring(0, 100));
  console.log('[Claude API] Base64 length:', base64Image.length);

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': ANTHROPIC_VERSION,
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: `Identify this Beanie Baby and estimate its value. Return JSON with:
- name: the Beanie Baby name
- animal_type: what animal it is
- variant: specific variant if applicable (see notes below)
- colors: array of colors visible
- estimated_value_low: integer USD
- estimated_value_high: integer USD
- value_notes: what affects this item's value
- confidence: High/Medium/Low
- has_visible_hang_tag: boolean

CRITICAL VARIANT NOTES:
- Peanut the Elephant comes in TWO versions:
  * LIGHT BLUE (pale pastel sky blue) = common, worth $5-15
  * ROYAL BLUE (deep dark navy blue) = extremely rare, worth $3,000-5,000
  Examine the blue color carefully. If it's a deep/dark/saturated blue, it's Royal Blue and extremely valuable.

Base values on 2024-2025 eBay sold listings. Most Beanies are worth $3-15.`,
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

  const result: BeanieIdentification = JSON.parse(jsonMatch[0]);
  return result;
}

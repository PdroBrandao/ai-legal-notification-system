/**
 * JSON Validation Utilities
 * 
 * Handles parsing and validation of LLM responses, which may include:
 * - Markdown code blocks (```json ... ```)
 * - Extra whitespace
 * - Malformed JSON
 */

interface JsonValidationResult<T> {
    status: 'valid' | 'invalid';
    response: T | string;
}

/**
 * Parse and validate JSON from LLM response
 * 
 * LLMs sometimes wrap JSON in markdown code blocks or add extra formatting.
 * This function cleans the response and validates the JSON structure.
 * 
 * @param JSONStringRaw - Raw string from LLM (may contain markdown)
 * @returns Validation result with parsed object or error message
 * 
 * @example
 * // LLM returns: "```json\n{\"prazo\": 15}\n```"
 * handleJsonResponse(response)
 * // Returns: { status: 'valid', response: { prazo: 15 } }
 */
export function handleJsonResponse<T>(JSONStringRaw: string): JsonValidationResult<T> {
    if (!JSONStringRaw) return { status: 'invalid', response: 'Empty input' };

    // Cleaning pipeline: remove markdown code blocks
    const pipes = [
        (text: string) => text.replace(/```json/g, "").replace(/```/g, "").trim()
    ];

    let JSONString = JSONStringRaw;
    for (const pipe of pipes) {
        JSONString = pipe(JSONString);
    }

    try {
        const validJson = JSON.parse(JSONString);
        return { status: "valid", response: validJson };
    } catch (e) {
        return { status: "invalid", response: (e as Error).message };
    }
}

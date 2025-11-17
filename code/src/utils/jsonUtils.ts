interface JsonValidationResult<T> {
    status: 'valid' | 'invalid';
    response: T | string;
}

export function handleJsonResponse<T>(JSONStringRaw: string): JsonValidationResult<T> {
    if (!JSONStringRaw) return { status: 'invalid', response: 'Empty input' };

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

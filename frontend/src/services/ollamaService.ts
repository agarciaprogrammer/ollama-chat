// src/services/ollamaService.ts
const API_URL = 'http://localhost:11434/api/generate';

interface GenerateRequest {
    model: string;
    prompt: string;
    stream: boolean;
}

interface StreamChunk {
    response: string;
    done: boolean;
}

export const sendPromptStream = async (
    prompt: string,
    onChunk: (chunk: string) => void
): Promise<void> => {
    const requestBody: GenerateRequest = {
        model: 'llama3',
        prompt,
        stream: true,
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(requestBody),
    });

    if(!response.body) { throw new Error('No se recibió un cuerpo en la respuesta de Ollama')};

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
        const { value, done} = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, {stream: true});
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
            if (!line.trim()) continue;

            try {
                const json: StreamChunk = JSON.parse(line);
                if (json.response) { onChunk(json.response);}
            } catch (err) {
                console.error('Error al parsear chunk:', line, err);
            }
        } 
    }
};
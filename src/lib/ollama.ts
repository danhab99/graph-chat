"use client";
import { Message } from "./node";

/**
 * Sends chat history to Ollama to generate the next message
 * @param ancestors - Array of ancestor nodes with role and content
 * @param model - Ollama model to use (default: "llama3")
 * @returns Promise resolving to the generated response
 */
export const generateNextMessage = async (
  ancestors: Message[],
  model: string = "gemma3",
): Promise<string> => {
  // Format the conversation history for Ollama
  const messages = ancestors.map((ancestor) => ({
    role: ancestor.role,
    content: ancestor.content,
  }));

  try {
    console.log("fetch");
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`); // Fixed template literal
    }

    const data = await response.json();
    return data.message.content;
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error("Failed to generate response from Ollama");
  }
};

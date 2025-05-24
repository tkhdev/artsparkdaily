import { useState } from "react";

export default function usePollinationsImage() {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generates an image from the Pollinations API based on the prompt.
   * @param {string} prompt - The text prompt to generate image.
   */
  async function generateImage(prompt) {
    if (!prompt || !prompt.trim()) {
      setError("Prompt cannot be empty");
      setImageUrl(null);
      return;
    }

    setLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const encodedPrompt = encodeURIComponent(prompt.trim());
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

      // Pollinations returns an image directly as URL, so we can just set the URL
      // Optionally, you could check if the URL responds with a valid image,
      // but here we assume it works as expected.
      setImageUrl(url);
    } catch (err) {
      setError("Failed to generate image");
    } finally {
      setLoading(false);
    }
  }

  return { imageUrl, loading, error, generateImage };
}

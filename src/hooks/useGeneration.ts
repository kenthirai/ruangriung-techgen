import { useMutation, useQueryClient } from '@tanstack/react-query'
import { generateText, generateVideo, generateAudio, generateEmbeddings, saveGeneration, generateImage, translatePromptToEnglish } from '../lib/pollinations'

export function useGenerateText() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: { messages: {role: string, content: string}[], model: string, systemPrompt?: string }) => {
      const result = await generateText(params.messages, params.model, params.systemPrompt)
      const lastUserMessage = params.messages.filter(m => m.role === 'user').pop()?.content || ''
      await saveGeneration({
        session_id: 'default', // Ideally replace with real session
        type: 'text',
        model: params.model,
        prompt: lastUserMessage,
        result_url: result // Text result stored directly or via storage
      })
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] })
    }
  })
}

export function useGenerateVideo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: { prompt: string, model: string, duration?: number, width?: number, height?: number }) => {
      const translatedPrompt = await translatePromptToEnglish(params.prompt)
      const url = await generateVideo(translatedPrompt, params.model, params.duration, params.width, params.height)
      await saveGeneration({
        session_id: 'default',
        type: 'video',
        model: params.model,
        prompt: translatedPrompt,
        result_url: url
      })
      return url
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] })
    }
  })
}

export function useGenerateAudio() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: { text: string, voice: string }) => {
      const url = await generateAudio(params.text, params.voice)
      await saveGeneration({
        session_id: 'default',
        type: 'audio',
        model: params.voice,
        prompt: params.text,
        result_url: url
      })
      return url
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] })
    }
  })
}

export function useGenerateEmbeddings() {
  return useMutation({
    mutationFn: async (params: { text: string, model: string, dimensions?: number }) => {
      return await generateEmbeddings(params.text, params.model, params.dimensions)
    }
  })
}

export function useGenerateImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: { prompt: string, model: string, width?: number, height?: number, count?: number, seed?: number, enhance?: boolean, isPrivate?: boolean, referenceImage?: string }) => {
      const count = params.count || 1;
      const urls: string[] = [];
      const enhance = params.enhance ?? true;
      const isPrivate = params.isPrivate ?? false;
      const translatedPrompt = await translatePromptToEnglish(params.prompt);
      
      const promises = Array.from({ length: count }).map(async (_, index) => {
        // If batching, we add index to seed to ensure they are different, unless seed is strictly provided for 1 image
        const currentSeed = params.seed !== undefined ? params.seed + index : undefined;
        const url = await generateImage(translatedPrompt, params.model, params.width, params.height, currentSeed, enhance, isPrivate, params.referenceImage)
        await saveGeneration({
          session_id: 'default',
          type: 'image',
          model: params.model,
          prompt: translatedPrompt,
          result_url: url
        })
        urls.push(url);
      });
      
      await Promise.all(promises);
      return urls;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history'] })
    }
  })
}

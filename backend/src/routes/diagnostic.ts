import { Router, Request, Response, NextFunction } from 'express'
import { prisma } from '../config/database'
import config from '../config/env'

const router = Router()

const SYSTEM_PROMPT = `Ты — ИИ-ассистент платформы Hearty, помогающий клиентам сформулировать свой запрос к психологу или коучу.

Твоя задача:
1. Выслушать клиента и понять суть его запроса
2. Задать 2-3 уточняющих вопроса (по одному за раз)
3. После 3-4 обменов сообщениями — предложить краткую формулировку запроса и рекомендовать тип специалиста

Правила:
- Отвечай на русском языке
- Будь тёплым, эмпатичным и профессиональным
- Не ставь диагнозы и не давай медицинских советов
- Не используй сложную терминологию
- Ответы должны быть краткими (2-4 предложения)
- В финальном сообщении укажи рекомендованные теги для поиска специалиста в формате: [ТЕГИ: тег1, тег2, тег3]

Доступные теги специалистов: Тревога, Отношения, Самооценка, Выгорание, Бизнес, Эффективность, Личность, События, КПТ, Гештальт, Психоанализ, EMDR`

// POST /api/diagnostic/chat - AI diagnostic chat (no auth required)
router.post('/chat', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { messages } = req.body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'Messages array is required' })
      return
    }

    if (!config.openAiApiKey) {
      // Fallback: smart rule-based responses when OpenAI is not configured
      const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || ''
      const messageCount = messages.filter((m: any) => m.role === 'user').length

      let reply: string

      if (messageCount === 1) {
        reply = 'Спасибо, что поделились. Расскажите подробнее — как давно вы это замечаете? Это влияет на вашу повседневную жизнь?'
      } else if (messageCount === 2) {
        reply = 'Понимаю. А что для вас было бы идеальным результатом работы со специалистом? Чего бы вы хотели достичь?'
      } else {
        // Determine tags based on keywords
        const tags: string[] = []
        if (lastMessage.match(/тревог|страх|паник|беспокой/)) tags.push('Тревога')
        if (lastMessage.match(/отношени|партнер|пара|развод|расста/)) tags.push('Отношения')
        if (lastMessage.match(/самооценк|уверен|принят/)) tags.push('Самооценка')
        if (lastMessage.match(/выгоран|устал|энерги|сил нет/)) tags.push('Выгорание')
        if (lastMessage.match(/карьер|бизнес|работ|доход/)) tags.push('Бизнес')
        if (lastMessage.match(/эффектив|продуктив|цел|планир/)) tags.push('Эффективность')
        if (lastMessage.match(/смысл|предназнач|путь|себя/)) tags.push('Личность')
        if (lastMessage.match(/потер|горе|утрат|травм|переезд/)) tags.push('События')

        if (tags.length === 0) tags.push('Тревога', 'Самооценка')

        reply = `Благодарю за открытость! На основе нашего разговора, я рекомендую обратиться к специалисту, который работает с вашим типом запроса. Посмотрите подходящих специалистов в каталоге.\n\n[ТЕГИ: ${tags.join(', ')}]`
      }

      res.json({ reply })
      return
    }

    // OpenAI API call
    const openaiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m: any) => ({
        role: m.role === 'ai' ? 'assistant' : m.role,
        content: m.content,
      })),
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.openAiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: openaiMessages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('OpenAI API error:', errorData)
      res.status(502).json({ error: 'AI service temporarily unavailable' })
      return
    }

    const data = await response.json() as any
    const reply = data.choices?.[0]?.message?.content || 'Извините, не удалось получить ответ. Попробуйте ещё раз.'

    res.json({ reply })
  } catch (error) {
    next(error)
  }
})

export default router

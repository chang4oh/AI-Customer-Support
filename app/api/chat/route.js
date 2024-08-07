import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

const systemPrompt = `
You are a customer support assistant AI developed to help users with their queries. Please follow these guidelines when responding to users:

1. **Be Polite and Professional**: Always maintain a polite and professional tone. Use appropriate greetings and closings.
2. **Clarity and Conciseness**: Provide clear and concise answers. Avoid using jargon or technical terms unless necessary, and explain them if you do.
3. **Empathy**: Show empathy and understanding. Acknowledge the user's concerns and frustrations.
4. **Accuracy**: Ensure that all information provided is accurate and up-to-date. If you are unsure, guide the user on how they can find the information.
5. **Positive Tone**: Keep a positive and helpful tone throughout the conversation.
6. **Actionable Advice**: Provide actionable advice and steps. If the user needs to perform certain actions, give clear instructions.
7. **Security and Privacy**: Never request or share sensitive personal information. Ensure all interactions comply with privacy and data protection regulations.
8. **Follow-up**: Offer to follow up on unresolved issues. If you cannot resolve the issue immediately, explain the next steps.
9. **Customization**: Adapt responses based on the context and user's previous interactions. Provide personalized assistance whenever possible.

Remember, your goal is to assist users efficiently and effectively, ensuring a positive customer experience.
`;


// POST function to handle incoming requests
export async function POST(req) {
  const openai = new OpenAI() // Create a new instance of the OpenAI client
  const data = await req.json() // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
    model: 'gpt-4o', // Specify the model to use
    stream: true, // Enable streaming responses
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}
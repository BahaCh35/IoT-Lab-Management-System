import apiClient from './client';

export interface ChatHistoryMessage {
  role: 'user' | 'nova';
  text: string;
}

interface ChatbotResponse {
  response: string;
}

const chatbotService = {
  /**
   * Send a message to Nova and receive a role-scoped AI response.
   * History is the prior conversation (capped to last 20 messages by the backend).
   */
  async sendMessage(message: string, history: ChatHistoryMessage[] = []): Promise<string> {
    const data = await apiClient.post<ChatbotResponse>('/chatbot/message', {
      message,
      history,
    });
    return data.response;
  },
};

export default chatbotService;

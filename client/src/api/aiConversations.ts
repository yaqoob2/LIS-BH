import { apiRequest } from "./client";

import type {
  AiConversation,
  AiConversationDetail,
  AiConversationListItem,
  CreateAiConversationRequest,
  SendAiMessageResponse,
} from "../types/ai";

export function getAiConversations(): Promise<AiConversationListItem[]> {
  return apiRequest<AiConversationListItem[]>("/ai-conversations");
}

export function getAiConversation(id: string): Promise<AiConversationDetail> {
  return apiRequest<AiConversationDetail>(`/ai-conversations/${id}`);
}

export function createAiConversation(
  data: CreateAiConversationRequest,
): Promise<AiConversation> {
  return apiRequest<AiConversation>("/ai-conversations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAiConversation(
  id: string,
  title: string,
): Promise<AiConversationListItem> {
  return apiRequest<AiConversationListItem>(`/ai-conversations/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      title,
    }),
  });
}

export function deleteAiConversation(id: string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(`/ai-conversations/${id}`, {
    method: "DELETE",
  });
}

export function sendAiMessage(
  conversationId: string,
  message: string,
): Promise<SendAiMessageResponse> {
  return apiRequest<SendAiMessageResponse>(
    `/ai-conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({
        message,
      }),
    },
  );
}

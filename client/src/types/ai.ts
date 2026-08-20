export type AiMessageRole = "USER" | "ASSISTANT";

export interface AiCaseSummary {
  id: string;
  referenceNumber: string;
  title: string;
}

export interface AiCitation {
  id: string;
  messageId: string;
  legalChunkId: string;
}

export interface AiMessage {
  id: string;
  conversationId: string;
  role: AiMessageRole;
  content: string;
  createdAt: string;
}

export interface AiMessageWithCitations extends AiMessage {
  citations: AiCitation[];
}

export interface AiConversation {
  id: string;
  userId: string;
  caseId: string | null;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiConversationListItem extends AiConversation {
  case: AiCaseSummary | null;
}

export interface AiConversationDetail extends AiConversation {
  case: AiCaseSummary | null;
  messages: AiMessageWithCitations[];
}

export interface AiSource {
  chunkId: string;
  legalResourceId: string;
  title: string;
  text: string;
  pageStart: number | null;
  pageEnd: number | null;
  sectionNumber: string | null;
  heading: string | null;
  similarity: number;
}

export interface SendAiMessageResponse {
  userMessage: AiMessage;
  assistantMessage: AiMessage;
  sources: AiSource[];
}

export interface CreateAiConversationRequest {
  title?: string;
  caseId?: string;
}

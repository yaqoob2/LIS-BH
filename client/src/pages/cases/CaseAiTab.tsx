import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { BookOpen, LoaderCircle, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  createAiConversation,
  getAiConversation,
  getAiConversations,
  sendAiMessage,
} from "../../api/aiConversations";

import type { AiConversationDetail, AiMessage, AiSource } from "../../types/ai";

interface CaseAiTabProps {
  caseId: string;
}

export default function CaseAiTab({ caseId }: CaseAiTabProps) {
  const [conversation, setConversation] = useState<AiConversationDetail | null>(
    null,
  );

  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [isSending, setIsSending] = useState(false);

  const [messageSources, setMessageSources] = useState<
    Record<string, AiSource[]>
  >({});

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const loadConversation = useCallback(async () => {
    try {
      setIsLoading(true);

      const conversations = await getAiConversations();

      const existing = conversations.find((item) => item.caseId === caseId);

      let conversationId = existing?.id;

      if (!conversationId) {
        const created = await createAiConversation({
          caseId,
        });

        conversationId = created.id;
      }

      const detail = await getAiConversation(conversationId);

      setConversation(detail);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load case AI.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    void loadConversation();
  }, [loadConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [conversation?.messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanMessage = message.trim();

    if (cleanMessage.length < 2 || !conversation || isSending) {
      return;
    }

    try {
      setIsSending(true);
      setMessage("");

      const optimisticUserMessage: AiMessage = {
        id: `temp-${Date.now()}`,
        conversationId: conversation.id,
        role: "USER",
        content: cleanMessage,
        createdAt: new Date().toISOString(),
      };

      setConversation((current) =>
        current
          ? {
              ...current,
              messages: [
                ...current.messages,
                {
                  ...optimisticUserMessage,
                  citations: [],
                },
              ],
            }
          : current,
      );

      const result = await sendAiMessage(conversation.id, cleanMessage);

      setMessageSources((current) => ({
        ...current,
        [result.assistantMessage.id]: result.sources,
      }));

      const refreshed = await getAiConversation(conversation.id);

      setConversation(refreshed);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to send message.",
      );

      await loadConversation();
    } finally {
      setIsSending(false);
    }
  }

  if (isLoading) {
    return (
      <section className="mt-4 flex min-h-[420px] items-center justify-center border border-[#E4E7EC] bg-white">
        <div className="flex items-center gap-2 text-[12px] text-[#667085]">
          <LoaderCircle size={14} className="animate-spin" />
          Loading case AI...
        </div>
      </section>
    );
  }

  if (!conversation) {
    return (
      <section className="mt-4 flex min-h-[260px] items-center justify-center border border-[#E4E7EC] bg-white px-6 text-center">
        <p className="text-[13px] text-[#667085]">
          Case AI could not be loaded.
        </p>
      </section>
    );
  }

  return (
    <section className="mt-4 flex min-h-[560px] flex-col border border-[#E4E7EC] bg-white">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-[#E7E9EE] px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-[#53627E]" />

            <h2 className="text-[13.5px] font-semibold text-[#273449]">
              Case AI
            </h2>
          </div>

          <p className="mt-0.5 text-[11px] text-[#98A2B3]">
            Ask questions using this case and available legal resources.
          </p>
        </div>

        <span className="border border-[#DCE2EA] bg-[#F7F8FA] px-2 py-1 text-[10px] font-medium text-[#53627E]">
          Case Linked
        </span>
      </div>

      {/* MESSAGES */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 sm:px-6">
        {conversation.messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <div className="flex h-10 w-10 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[#53627E]">
              <Sparkles size={17} />
            </div>

            <p className="mt-3 text-[14px] font-semibold text-[#273449]">
              Ask about this case
            </p>

            <p className="mt-1 max-w-[440px] text-[11.5px] leading-5 text-[#98A2B3]">
              The AI can use the case information, processed case documents and
              available legal resources when answering.
            </p>

            <div className="mt-5 flex max-w-[680px] flex-wrap justify-center gap-2">
              {[
                "What legal issues should be reviewed in this case?",
                "What evidence is relevant to this matter?",
                "What legal resources may apply to this case?",
              ].map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setMessage(prompt)}
                  className="border border-[#E1E4EA] bg-white px-3 py-2 text-[11px] text-[#53627E] transition-colors hover:bg-[#F8F9FB]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-[900px] flex-col gap-7">
            {conversation.messages.map((item) => {
              const sources = messageSources[item.id] ?? [];

              return (
                <div
                  key={item.id}
                  className={
                    item.role === "USER"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >
                  {item.role === "USER" ? (
                    <div className="max-w-[78%] bg-[#17223B] px-4 py-3 text-[13px] leading-6 text-white">
                      {item.content}
                    </div>
                  ) : (
                    <div className="w-full max-w-[840px]">
                      <div className="flex gap-3.5">
                        {/* AI ICON */}
                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[#53627E]">
                          <Sparkles size={14} />
                        </div>

                        <div className="min-w-0 flex-1">
                          {/* MARKDOWN RESPONSE */}
                          <div className="text-[13.5px] leading-[1.8] text-[#344054]">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({ children }) => (
                                  <h1 className="mb-3 mt-6 text-[19px] font-semibold tracking-[-0.01em] text-[#172033] first:mt-0">
                                    {children}
                                  </h1>
                                ),

                                h2: ({ children }) => (
                                  <h2 className="mb-2.5 mt-6 border-b border-[#EEF0F3] pb-1.5 text-[16px] font-semibold text-[#172033] first:mt-0">
                                    {children}
                                  </h2>
                                ),

                                h3: ({ children }) => (
                                  <h3 className="mb-2 mt-5 text-[14.5px] font-semibold text-[#273449]">
                                    {children}
                                  </h3>
                                ),

                                p: ({ children }) => (
                                  <p className="mb-3.5 leading-[1.8] last:mb-0">
                                    {children}
                                  </p>
                                ),

                                strong: ({ children }) => (
                                  <strong className="font-semibold text-[#273449]">
                                    {children}
                                  </strong>
                                ),

                                ul: ({ children }) => (
                                  <ul className="mb-4 ml-5 list-disc space-y-1.5">
                                    {children}
                                  </ul>
                                ),

                                ol: ({ children }) => (
                                  <ol className="mb-4 ml-5 list-decimal space-y-2">
                                    {children}
                                  </ol>
                                ),

                                li: ({ children }) => (
                                  <li className="pl-1 leading-[1.75]">
                                    {children}
                                  </li>
                                ),

                                blockquote: ({ children }) => (
                                  <blockquote className="my-4 border-l-2 border-[#53627E] bg-[#F8F9FB] px-4 py-3 text-[#596273]">
                                    {children}
                                  </blockquote>
                                ),

                                hr: () => (
                                  <hr className="my-5 border-[#E7E9EE]" />
                                ),

                                table: ({ children }) => (
                                  <div className="my-4 overflow-x-auto border border-[#E4E7EC]">
                                    <table className="w-full border-collapse text-left text-[12px]">
                                      {children}
                                    </table>
                                  </div>
                                ),

                                thead: ({ children }) => (
                                  <thead className="bg-[#FAFAFB]">
                                    {children}
                                  </thead>
                                ),

                                th: ({ children }) => (
                                  <th className="border-b border-[#E4E7EC] px-3 py-2 font-semibold text-[#475467]">
                                    {children}
                                  </th>
                                ),

                                td: ({ children }) => (
                                  <td className="border-b border-[#EEF0F3] px-3 py-2 text-[#667085]">
                                    {children}
                                  </td>
                                ),

                                code: ({ children }) => (
                                  <code className="bg-[#F3F5F8] px-1.5 py-0.5 text-[12px] text-[#354766]">
                                    {children}
                                  </code>
                                ),
                              }}
                            >
                              {item.content}
                            </ReactMarkdown>
                          </div>

                          {/* SOURCES */}
                          {sources.length > 0 && (
                            <div className="mt-5 border-t border-[#E7E9EE] pt-3">
                              <div className="mb-2.5 flex items-center gap-1.5">
                                <BookOpen
                                  size={13}
                                  className="text-[#7B8494]"
                                />

                                <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#7B8494]">
                                  Legal Sources
                                </span>
                              </div>

                              <div className="grid gap-2 sm:grid-cols-2">
                                {sources.map((source, index) => (
                                  <div
                                    key={source.chunkId}
                                    className="border border-[#E4E7EC] bg-[#FAFAFB] px-3.5 py-3"
                                  >
                                    <p className="text-[11.5px] font-semibold text-[#344054]">
                                      {index + 1}. {source.title}
                                    </p>

                                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-[#98A2B3]">
                                      {source.pageStart !== null && (
                                        <span>Page {source.pageStart}</span>
                                      )}

                                      {source.sectionNumber && (
                                        <span>
                                          Section {source.sectionNumber}
                                        </span>
                                      )}

                                      {source.heading && (
                                        <span>{source.heading}</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* THINKING */}
            {isSending && (
              <div className="flex items-center gap-3.5">
                <div className="flex h-8 w-8 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB]">
                  <LoaderCircle
                    size={14}
                    className="animate-spin text-[#667085]"
                  />
                </div>

                <p className="text-[11.5px] text-[#98A2B3]">
                  Reviewing case and legal resources...
                </p>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* COMPOSER */}
      <div className="border-t border-[#E7E9EE] bg-[#FAFAFB] p-3 sm:p-4">
        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-[900px] items-end gap-2"
        >
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();

                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Ask about this case..."
            maxLength={10000}
            rows={2}
            disabled={isSending}
            className="min-h-[50px] flex-1 resize-none border border-[#DDE1E8] bg-white px-3.5 py-3 text-[13px] leading-5 text-[#18212F] outline-none placeholder:text-[#98A2B3] focus:border-[#667694] disabled:bg-[#F8F9FB]"
          />

          <button
            type="submit"
            disabled={isSending || message.trim().length < 2}
            className="flex h-[50px] w-[50px] shrink-0 items-center justify-center bg-[#17223B] text-white transition-colors hover:bg-[#243250] disabled:cursor-not-allowed disabled:opacity-40"
            title="Send"
          >
            {isSending ? (
              <LoaderCircle size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </button>
        </form>

        <p className="mx-auto mt-2 max-w-[900px] text-[10px] text-[#98A2B3]">
          Legal AI responses should be reviewed before relying on them.
        </p>
      </div>
    </section>
  );
}

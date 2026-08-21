import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  BookOpen,
  LoaderCircle,
  MessageSquareText,
  MoreHorizontal,
  Pencil,
  Plus,
  Send,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";

import {
  createAiConversation,
  deleteAiConversation,
  getAiConversation,
  getAiConversations,
  sendAiMessage,
  updateAiConversation,
} from "../../api/aiConversations";
import { getCases } from "../../api/cases";

import type {
  AiConversationDetail,
  AiConversationListItem,
  AiMessage,
  AiSource,
} from "../../types/ai";
import type { CaseRecord } from "../../types/case";

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

export default function AIPage() {
  const [conversations, setConversations] = useState<AiConversationListItem[]>(
    [],
  );

  const [cases, setCases] = useState<CaseRecord[]>([]);

  const [activeConversation, setActiveConversation] =
    useState<AiConversationDetail | null>(null);

  const [message, setMessage] = useState("");

  const [draftCaseId, setDraftCaseId] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const [isConversationLoading, setIsConversationLoading] = useState(false);

  const [isSending, setIsSending] = useState(false);

  const [messageSources, setMessageSources] = useState<
    Record<string, AiSource[]>
  >({});

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [renameConversation, setRenameConversation] =
    useState<AiConversationListItem | null>(null);

  const [renameTitle, setRenameTitle] = useState("");

  const [deleteConversation, setDeleteConversation] =
    useState<AiConversationListItem | null>(null);

  const [isRenaming, setIsRenaming] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const messageScrollRef = useRef<HTMLDivElement | null>(null);

  const selectedCase = useMemo(
    () => cases.find((item) => item.id === draftCaseId) ?? null,
    [cases, draftCaseId],
  );

  const loadConversationList = useCallback(async () => {
    const data = await getAiConversations();

    setConversations(data);

    return data;
  }, []);

  const openConversation = useCallback(async (conversationId: string) => {
    try {
      setIsConversationLoading(true);
      setMessageSources({});
      setOpenMenuId(null);

      const detail = await getAiConversation(conversationId);

      setActiveConversation(detail);

      setDraftCaseId(detail.caseId ?? "");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load conversation.",
      );
    } finally {
      setIsConversationLoading(false);
    }
  }, []);

  useEffect(() => {
    async function initialise() {
      try {
        setIsLoading(true);

        const [conversationData, caseData] = await Promise.all([
          getAiConversations(),
          getCases(),
        ]);

        setConversations(conversationData);

        setCases(caseData);

        if (conversationData.length > 0) {
          const detail = await getAiConversation(conversationData[0].id);

          setActiveConversation(detail);

          setDraftCaseId(detail.caseId ?? "");
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to load Legal AI.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    void initialise();
  }, []);

  useEffect(() => {
    const container = messageScrollRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [activeConversation?.messages, isSending]);

  function startNewChat() {
    setActiveConversation(null);
    setDraftCaseId("");
    setMessage("");
    setMessageSources({});
    setOpenMenuId(null);
  }

  function openRename(item: AiConversationListItem) {
    setOpenMenuId(null);
    setRenameConversation(item);
    setRenameTitle(item.title);
  }

  function openDelete(item: AiConversationListItem) {
    setOpenMenuId(null);
    setDeleteConversation(item);
  }

  async function handleRename(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!renameConversation) return;

    const cleanTitle = renameTitle.trim();

    if (cleanTitle.length < 2) {
      toast.error("Conversation name must be at least 2 characters.");
      return;
    }

    try {
      setIsRenaming(true);

      await updateAiConversation(renameConversation.id, cleanTitle);

      const refreshedList = await loadConversationList();

      if (activeConversation?.id === renameConversation.id) {
        const detail = await getAiConversation(renameConversation.id);

        setActiveConversation(detail);
      }

      setRenameConversation(null);
      setRenameTitle("");

      toast.success("Conversation renamed successfully.");

      setConversations(refreshedList);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to rename conversation.",
      );
    } finally {
      setIsRenaming(false);
    }
  }

  async function handleDelete() {
    if (!deleteConversation) return;

    try {
      setIsDeleting(true);

      const deletedId = deleteConversation.id;

      await deleteAiConversation(deletedId);

      const refreshedList = await loadConversationList();

      if (activeConversation?.id === deletedId) {
        if (refreshedList.length > 0) {
          const next = await getAiConversation(refreshedList[0].id);

          setActiveConversation(next);

          setDraftCaseId(next.caseId ?? "");
        } else {
          setActiveConversation(null);
          setDraftCaseId("");
        }
      }

      setDeleteConversation(null);

      toast.success("Conversation deleted successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete conversation.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanMessage = message.trim();

    if (cleanMessage.length < 2 || isSending) {
      return;
    }

    try {
      setIsSending(true);
      setMessage("");

      let conversation = activeConversation;

      if (!conversation) {
        const created = await createAiConversation({
          ...(draftCaseId
            ? {
                caseId: draftCaseId,
              }
            : {}),
        });

        conversation = await getAiConversation(created.id);

        setActiveConversation(conversation);
      }

      const optimisticUserMessage: AiMessage = {
        id: `temp-${Date.now()}`,
        conversationId: conversation.id,
        role: "USER",
        content: cleanMessage,
        createdAt: new Date().toISOString(),
      };

      setActiveConversation((current) =>
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

      setActiveConversation(refreshed);

      await loadConversationList();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to send message.",
      );

      if (activeConversation) {
        try {
          const refreshed = await getAiConversation(activeConversation.id);

          setActiveConversation(refreshed);
        } catch {
          // Existing toast is enough.
        }
      }
    } finally {
      setIsSending(false);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex min-h-[520px] w-full max-w-[1180px] items-center justify-center">
        <div className="flex items-center gap-2 text-[12px] text-[#667085]">
          <LoaderCircle size={14} className="animate-spin" />
          Loading Legal AI...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1180px]">
        {/* PAGE HEADER */}
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#172033]">
            Legal AI
          </h1>

          <p className="mt-0.5 text-[13px] text-[#7B8494]">
            Research legal resources or work within a specific case.
          </p>
        </div>

        {/* AI WORKSPACE */}
        <div className="mt-5 flex h-[calc(100dvh-150px)] min-h-[520px] flex-col overflow-hidden border border-[#E4E7EC] bg-white lg:grid lg:h-[calc(100dvh-155px)] lg:min-h-[600px] lg:grid-cols-[250px_1fr]">
          {/* CONVERSATIONS */}
          <aside className="flex max-h-[190px] min-h-0 shrink-0 flex-col overflow-hidden border-b border-[#E4E7EC] bg-[#FAFAFB] lg:max-h-none lg:border-b-0 lg:border-r">
            {/* NEW CHAT */}
            <div className="shrink-0 border-b border-[#E7E9EE] p-3">
              <button
                type="button"
                onClick={startNewChat}
                className="flex h-9 w-full items-center justify-center gap-2 bg-[#17223B] px-3 text-[12px] font-medium text-white transition-colors hover:bg-[#243250]"
              >
                <Plus size={14} />
                New Chat
              </button>
            </div>

            {/* CONVERSATION LIST */}
            <div className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain">
              {conversations.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <MessageSquareText
                    size={17}
                    className="mx-auto text-[#98A2B3]"
                  />

                  <p className="mt-2 text-[11px] text-[#98A2B3]">
                    No saved conversations.
                  </p>
                </div>
              ) : (
                conversations.map((item) => {
                  const active = activeConversation?.id === item.id;

                  const menuOpen = openMenuId === item.id;

                  return (
                    <div
                      key={item.id}
                      className="relative border-b border-[#EEF0F3]"
                    >
                      <button
                        type="button"
                        onClick={() => void openConversation(item.id)}
                        className={`block w-full px-3.5 py-3 pr-10 text-left transition-colors ${
                          active ? "bg-white" : "hover:bg-white"
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <MessageSquareText
                            size={13}
                            className={`mt-0.5 shrink-0 ${
                              active ? "text-[#233A6C]" : "text-[#98A2B3]"
                            }`}
                          />

                          <div className="min-w-0 flex-1">
                            <p
                              className={`truncate text-[11.5px] font-medium ${
                                active ? "text-[#17223B]" : "text-[#475467]"
                              }`}
                            >
                              {item.title}
                            </p>

                            <div className="mt-1 flex items-center justify-between gap-2">
                              <p className="truncate text-[9.5px] text-[#98A2B3]">
                                {item.case
                                  ? item.case.referenceNumber
                                  : "General"}
                              </p>

                              <span className="shrink-0 text-[9px] text-[#B0B7C3]">
                                {formatShortDate(item.updatedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();

                          setOpenMenuId(menuOpen ? null : item.id);
                        }}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center text-[#98A2B3] transition-colors hover:bg-[#F3F5F8] hover:text-[#475467]"
                        title="Conversation options"
                      >
                        <MoreHorizontal size={15} />
                      </button>

                      {menuOpen && (
                        <div className="absolute right-2 top-9 z-30 w-[118px] border border-[#E1E4EA] bg-white py-1 shadow-sm">
                          <button
                            type="button"
                            onClick={() => openRename(item)}
                            className="flex h-8 w-full items-center gap-2 px-3 text-left text-[10.5px] text-[#475467] hover:bg-[#F7F8FA]"
                          >
                            <Pencil size={12} />
                            Rename
                          </button>

                          <button
                            type="button"
                            onClick={() => openDelete(item)}
                            className="flex h-8 w-full items-center gap-2 px-3 text-left text-[10.5px] text-[#934B4B] hover:bg-[#FBF7F7]"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </aside>

          {/* CHAT */}
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {/* CHAT HEADER */}
            <div className="flex min-h-[58px] shrink-0 items-center justify-between gap-3 border-b border-[#E7E9EE] bg-white px-4 py-2.5 sm:px-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[#53627E]" />

                  <p className="truncate text-[12.5px] font-semibold text-[#273449]">
                    {activeConversation
                      ? activeConversation.title
                      : "New Legal Chat"}
                  </p>
                </div>

                {activeConversation?.case && (
                  <p className="mt-0.5 truncate pl-[22px] text-[10px] text-[#98A2B3]">
                    {activeConversation.case.referenceNumber} •{" "}
                    {activeConversation.case.title}
                  </p>
                )}

                {activeConversation && !activeConversation.case && (
                  <p className="mt-0.5 pl-[22px] text-[10px] text-[#98A2B3]">
                    General legal research
                  </p>
                )}
              </div>

              {!activeConversation && (
                <select
                  value={draftCaseId}
                  onChange={(event) => setDraftCaseId(event.target.value)}
                  className="h-8 max-w-[240px] border border-[#DDE1E8] bg-white px-2.5 text-[10.5px] text-[#475467] outline-none focus:border-[#667694]"
                >
                  <option value="">General Legal Chat</option>

                  {cases.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.referenceNumber} — {item.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* MESSAGES */}
            <div
              ref={messageScrollRef}
              className="flex min-h-0 flex-1 touch-pan-y flex-col overflow-y-auto overscroll-contain px-4 py-5 sm:px-6"
            >
              {isConversationLoading ? (
                <div className="flex flex-1 items-center justify-center">
                  <LoaderCircle
                    size={16}
                    className="animate-spin text-[#667085]"
                  />
                </div>
              ) : !activeConversation ||
                activeConversation.messages.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
                  <div className="flex h-11 w-11 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[#53627E]">
                    <Sparkles size={18} />
                  </div>

                  <h2 className="mt-3 text-[14px] font-semibold text-[#273449]">
                    {selectedCase ? "Ask about this case" : "Ask Legal AI"}
                  </h2>

                  <p className="mt-1 max-w-[460px] text-[11px] leading-5 text-[#98A2B3]">
                    {selectedCase
                      ? `This conversation will be linked to ${selectedCase.referenceNumber} and can use its case context with available legal resources.`
                      : "Research the legal resources available in your firm's knowledge base."}
                  </p>

                  <div className="mt-5 flex max-w-[700px] flex-wrap justify-center gap-2">
                    {(selectedCase
                      ? [
                          "What legal issues should be reviewed in this case?",
                          "What laws may apply to this case?",
                          "Summarize the immediate legal actions to consider.",
                        ]
                      : [
                          "What legal resources are available for cybercrime matters?",
                          "Explain the relevant legal provisions for digital evidence.",
                          "What laws are available in the knowledge base?",
                        ]
                    ).map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => setMessage(prompt)}
                        className="border border-[#E1E4EA] bg-white px-3 py-2 text-[10.5px] text-[#53627E] transition-colors hover:bg-[#F8F9FB]"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mx-auto flex w-full max-w-[880px] flex-col gap-7">
                  {activeConversation.messages.map((item) => {
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
                          <div className="w-full max-w-[830px]">
                            <div className="flex gap-3.5">
                              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB] text-[#53627E]">
                                <Sparkles size={14} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="text-[13.5px] leading-[1.8] text-[#344054]">
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                      h1: ({ children }) => (
                                        <h1 className="mb-3 mt-6 text-[19px] font-semibold text-[#172033] first:mt-0">
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
                                    }}
                                  >
                                    {item.content}
                                  </ReactMarkdown>
                                </div>

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
                                              <span>
                                                Page {source.pageStart}
                                              </span>
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

                  {isSending && (
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-8 w-8 items-center justify-center border border-[#E1E4EA] bg-[#F8F9FB]">
                        <LoaderCircle
                          size={14}
                          className="animate-spin text-[#667085]"
                        />
                      </div>

                      <p className="text-[11.5px] text-[#98A2B3]">
                        Reviewing legal resources...
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* COMPOSER */}
            <div className="shrink-0 border-t border-[#E7E9EE] bg-[#FAFAFB] p-3 sm:p-4">
              <form
                onSubmit={handleSubmit}
                className="mx-auto flex w-full max-w-[880px] items-end gap-2"
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
                  placeholder="Ask Legal AI..."
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

              <p className="mx-auto mt-2 max-w-[880px] text-[10px] text-[#98A2B3]">
                Legal AI responses should be reviewed before relying on them.
              </p>
            </div>
          </main>
        </div>
      </div>

      {/* RENAME MODAL */}
      {renameConversation && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#101828]/25 px-4">
          <form
            onSubmit={handleRename}
            className="w-full max-w-[360px] border border-[#E4E7EC] bg-white"
          >
            <div className="flex items-center justify-between border-b border-[#E7E9EE] px-4 py-3">
              <div>
                <h2 className="text-[13px] font-semibold text-[#273449]">
                  Rename conversation
                </h2>

                <p className="mt-0.5 text-[10.5px] text-[#98A2B3]">
                  Give this chat a clear name.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isRenaming) {
                    setRenameConversation(null);
                  }
                }}
                className="flex h-7 w-7 items-center justify-center text-[#98A2B3] hover:bg-[#F5F6F8]"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-4">
              <label className="mb-1.5 block text-[11px] font-medium text-[#475467]">
                Conversation name
              </label>

              <input
                autoFocus
                value={renameTitle}
                onChange={(event) => setRenameTitle(event.target.value)}
                maxLength={250}
                className="h-9 w-full border border-[#DDE1E8] px-3 text-[12px] text-[#18212F] outline-none focus:border-[#667694]"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-[#E7E9EE] px-4 py-3">
              <button
                type="button"
                disabled={isRenaming}
                onClick={() => setRenameConversation(null)}
                className="h-8 border border-[#DDE1E8] bg-white px-3 text-[11px] font-medium text-[#475467]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isRenaming || renameTitle.trim().length < 2}
                className="h-8 bg-[#17223B] px-3 text-[11px] font-medium text-white disabled:opacity-50"
              >
                {isRenaming ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteConversation && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#101828]/25 px-4">
          <div className="w-full max-w-[340px] border border-[#E4E7EC] bg-white">
            <div className="px-4 py-4">
              <h2 className="text-[13px] font-semibold text-[#273449]">
                Delete conversation?
              </h2>

              <p className="mt-1.5 text-[11px] leading-5 text-[#667085]">
                This will permanently delete this conversation and its messages.
              </p>

              <p className="mt-3 truncate border border-[#EEF0F3] bg-[#FAFAFB] px-3 py-2 text-[10.5px] font-medium text-[#475467]">
                {deleteConversation.title}
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#E7E9EE] px-4 py-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteConversation(null)}
                className="h-8 border border-[#DDE1E8] bg-white px-3 text-[11px] font-medium text-[#475467]"
              >
                No
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={() => void handleDelete()}
                className="h-8 bg-[#17223B] px-3 text-[11px] font-medium text-white disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

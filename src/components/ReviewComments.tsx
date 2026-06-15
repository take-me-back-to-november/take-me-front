import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  createReviewNestedReply,
  createReviewRootReply,
} from "@/api/reviewMessages";
import { getApiErrorMessage } from "@/api/getApiErrorMessage";
import { CardAuthorHeader } from "@/components/CardAuthorHeader";
import { Icon } from "@/components/Icon";
import { ReviewCommentForm } from "@/components/ReviewCommentForm";
import { useAuth } from "@/context/AuthContext";
import { useRelativeTime } from "@/hooks/useRelativeTime";
import { buildMessageTree } from "@/lib/buildMessageTree";
import {
  appendCachedReviewMessage,
  getCachedReviewMessages,
  prefetchReviewMessages,
} from "@/lib/reviewMessagesCache";
import { interactive, layout, typography } from "@/lib/designSystem";
import { cn } from "@/lib/cn";
import type { MessageTreeNode, SongReviewMessage } from "@/types/api";

const ROOT_REPLY_TARGET = "__root__";
const THREAD_INDENT_PX = 14;
const MAX_THREAD_DEPTH = 8;

interface ReviewCommentsProps {
  reviewId: string;
}

interface CommentThreadProps {
  message: MessageTreeNode;
  reviewId: string;
  depth: number;
  replyingTo: string | null;
  messagesById: Map<string, SongReviewMessage>;
  onReply: (messageId: string) => void;
  onCancelReply: () => void;
  onReplyPosted: (message: SongReviewMessage) => void;
}

function getAuthorName(
  message: SongReviewMessage | undefined,
  fallback: string,
): string {
  return message?.user?.name ?? fallback;
}

function CommentThread({
  message,
  reviewId,
  depth,
  replyingTo,
  messagesById,
  onReply,
  onCancelReply,
  onReplyPosted,
}: CommentThreadProps) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const relativeTime = useRelativeTime(message.created_at);
  const authorName = getAuthorName(message, t("common.reviewer"));
  const isReplying = replyingTo === message.id;
  const isNested = depth > 0;
  const cappedDepth = Math.min(depth, MAX_THREAD_DEPTH);
  const parentMessage = message.parent_id
    ? messagesById.get(message.parent_id)
    : undefined;
  const parentName = parentMessage
    ? getAuthorName(parentMessage, t("common.reviewer"))
    : null;

  const handleNestedReply = async (text: string) => {
    if (!token) return;

    const created = await createReviewNestedReply(token, reviewId, message.id, { text });
    onReplyPosted(created);
    onCancelReply();
  };

  return (
    <>
      <article
        className={cn(
          layout.commentThreadRow,
          isNested && layout.commentThreadNested,
        )}
        style={
          isNested
            ? {
                marginLeft: `${cappedDepth * THREAD_INDENT_PX}px`,
                paddingLeft: "12px",
              }
            : undefined
        }
      >
        {parentName && (
          <p className="mb-xs flex items-center gap-1 text-label-sm text-on-surface-variant/60">
            <Icon name="reply" size="sm" className="shrink-0 -scale-x-100" />
            <span className="truncate">
              {t("reviewComments.replyingTo", { name: parentName })}
            </span>
          </p>
        )}

        <CardAuthorHeader
          name={authorName}
          avatarUrl={message.user?.picture_url ?? undefined}
          timestamp={relativeTime}
          timestampDateTime={message.created_at}
          avatarSize="sm"
        />

        <p className={cn(typography.cardBody, "mt-xs text-body-sm")}>{message.text}</p>

        {token && (
          <button
            type="button"
            className={cn(interactive.textAction, "mt-xs text-[0.8rem]")}
            onClick={() => (isReplying ? onCancelReply() : onReply(message.id))}
          >
            {isReplying ? t("reviewComments.cancel") : t("reviewComments.reply")}
          </button>
        )}

        {isReplying && (
          <ReviewCommentForm
            compact
            autoFocus
            onSubmit={handleNestedReply}
            onCancel={onCancelReply}
          />
        )}
      </article>

      {message.children.map((child) => (
        <CommentThread
          key={child.id}
          message={child}
          reviewId={reviewId}
          depth={depth + 1}
          replyingTo={replyingTo}
          messagesById={messagesById}
          onReply={onReply}
          onCancelReply={onCancelReply}
          onReplyPosted={onReplyPosted}
        />
      ))}
    </>
  );
}

export function ReviewComments({ reviewId }: ReviewCommentsProps) {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<SongReviewMessage[]>(
    () => getCachedReviewMessages(reviewId) ?? [],
  );
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(() => getCachedReviewMessages(reviewId) !== undefined);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const fetched = await prefetchReviewMessages(token, reviewId);
      setMessages(fetched);
      setLoaded(true);
    } catch (err) {
      setError(getApiErrorMessage(err, t, "reviewComments.loadError"));
    } finally {
      setLoading(false);
    }
  }, [reviewId, t, token]);

  useEffect(() => {
    setExpanded(false);
    setReplyingTo(null);

    if (!token) return;

    const cached = getCachedReviewMessages(reviewId);
    if (cached) {
      setMessages(cached);
      setLoaded(true);
      setError(null);
      return;
    }

    setMessages([]);
    setLoaded(false);
    setError(null);
    setLoading(true);

    let cancelled = false;

    void prefetchReviewMessages(token, reviewId)
      .then((fetched) => {
        if (cancelled) return;
        setMessages(fetched);
        setLoaded(true);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(getApiErrorMessage(err, t, "reviewComments.loadError"));
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reviewId, token, t]);

  const handleReplyPosted = (message: SongReviewMessage) => {
    appendCachedReviewMessage(reviewId, message);
    setMessages((current) => [...current, message]);
    setReplyingTo(null);
  };

  const handleRootReply = async (text: string) => {
    if (!token) return;

    const created = await createReviewRootReply(token, reviewId, { text });
    handleReplyPosted(created);
  };

  const messageTree = buildMessageTree(messages);
  const messagesById = useMemo(
    () => new Map(messages.map((message) => [message.id, message])),
    [messages],
  );
  const commentCount = messages.length;
  const toggleLabel =
    loaded && commentCount > 0
      ? t("reviewComments.toggleWithCount", { count: commentCount })
      : t("reviewComments.toggle");

  if (!token) return null;

  return (
    <section className={layout.commentSection} aria-label={t("reviewComments.toggle")}>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-sm rounded-lg px-xs py-xs text-left transition-default hover:bg-surface-container-high/60"
      >
        <span className="flex items-center gap-sm text-body-md font-medium text-on-surface">
          <Icon name="chat_bubble_outline" size="sm" />
          {toggleLabel}
        </span>
        <Icon
          name={expanded ? "expand_less" : "expand_more"}
          size="sm"
          className="text-on-surface-variant"
        />
      </button>

      {expanded && (
        <div className={layout.commentPanel}>
          {loading ? (
            <div className="py-sm">
              <div className="mb-sm flex items-center gap-sm">
                <div className="h-7 w-7 rounded-full shimmer" />
                <div className="flex flex-col gap-unit">
                  <div className="h-3 w-20 rounded shimmer" />
                  <div className="h-2 w-14 rounded shimmer" />
                </div>
              </div>
              <div className="h-10 rounded shimmer" />
            </div>
          ) : error ? (
            <div className="flex flex-col gap-sm">
              <p className="text-body-sm text-error">{error}</p>
              <button
                type="button"
                className={interactive.textAction}
                onClick={() => void loadMessages()}
              >
                {t("common.retry")}
              </button>
            </div>
          ) : (
            <>
              <div className={layout.commentCtaArea}>
                {replyingTo === ROOT_REPLY_TARGET ? (
                  <ReviewCommentForm
                    autoFocus
                    onSubmit={handleRootReply}
                    onCancel={() => setReplyingTo(null)}
                  />
                ) : (
                  <button
                    type="button"
                    className={interactive.commentTrigger}
                    onClick={() => setReplyingTo(ROOT_REPLY_TARGET)}
                  >
                    <Icon name="add_comment" size="sm" />
                    {t("reviewComments.addComment")}
                  </button>
                )}
              </div>

              {messageTree.length > 0 ? (
                <div className={layout.commentThreadList}>
                  {messageTree.map((message) => (
                    <CommentThread
                      key={message.id}
                      message={message}
                      reviewId={reviewId}
                      depth={0}
                      replyingTo={replyingTo}
                      messagesById={messagesById}
                      onReply={setReplyingTo}
                      onCancelReply={() => setReplyingTo(null)}
                      onReplyPosted={handleReplyPosted}
                    />
                  ))}
                </div>
              ) : (
                loaded && (
                  <div className={layout.commentEmpty}>
                    <Icon
                      name="forum"
                      size="md"
                      className="text-on-surface-variant/45"
                    />
                    <p className="max-w-[240px] text-body-sm text-on-surface-variant">
                      {t("reviewComments.empty")}
                    </p>
                  </div>
                )
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}

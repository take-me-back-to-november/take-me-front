import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/Button";
import { CharacterLimitIndicator } from "@/components/CharacterLimitIndicator";
import { cn } from "@/lib/cn";

const MAX_TEXT_LENGTH = 1000;

interface ReviewCommentFormProps {
  onSubmit: (text: string) => Promise<void>;
  onCancel?: () => void;
  autoFocus?: boolean;
  compact?: boolean;
}

export function ReviewCommentForm({
  onSubmit,
  onCancel,
  autoFocus = false,
  compact = false,
}: ReviewCommentFormProps) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(autoFocus);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = text.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      await onSubmit(text.trim());
      setText("");
      onCancel?.();
    } catch {
      setError(t("reviewComments.postError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-sm", compact ? "mt-sm" : "mt-md")}>
      <div className="relative">
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value.slice(0, MAX_TEXT_LENGTH))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoFocus={autoFocus}
          placeholder={t("reviewComments.placeholder")}
          rows={compact ? 2 : 3}
          className="w-full resize-y rounded-lg border-none bg-surface-container-high p-sm pb-xl text-body-md text-on-surface placeholder:text-on-surface-variant/50 transition-default focus:ring-1 focus:ring-primary focus:outline-none"
        />
        <div className="absolute right-sm bottom-sm">
          <CharacterLimitIndicator
            visible={focused}
            length={text.length}
            max={MAX_TEXT_LENGTH}
          />
        </div>
      </div>

      {error && <p className="text-body-sm text-error">{error}</p>}

      <div className="flex items-center justify-end gap-sm">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={submitting}>
            {t("reviewComments.cancel")}
          </Button>
        )}
        <Button onClick={() => void handleSubmit()} disabled={!canSubmit}>
          {submitting ? t("reviewComments.posting") : t("reviewComments.post")}
        </Button>
      </div>
    </div>
  );
}

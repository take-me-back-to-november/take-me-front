import type { MessageTreeNode, SongReviewMessage } from "@/types/api";

export function buildMessageTree(messages: SongReviewMessage[]): MessageTreeNode[] {
  const nodes = new Map<string, MessageTreeNode>();

  for (const message of messages) {
    nodes.set(message.id, { ...message, children: [] });
  }

  const roots: MessageTreeNode[] = [];

  for (const message of messages) {
    const node = nodes.get(message.id);
    if (!node) continue;

    if (message.parent_id) {
      const parent = nodes.get(message.parent_id);
      if (parent) {
        parent.children.push(node);
      }
      continue;
    }

    roots.push(node);
  }

  return roots;
}

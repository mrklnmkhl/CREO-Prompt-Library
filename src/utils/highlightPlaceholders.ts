import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import type { Plugin } from 'unified';

const PLACEHOLDER_REGEX = /\[([^\]]+)\]/g;

/**
 * Remark plugin that turns `[Placeholder]` tokens in prompt text into
 * `<mark data-placeholder="Placeholder">` nodes, so they can be rendered
 * as highlighted, fillable tokens instead of plain markdown text.
 */
const remarkHighlightPlaceholders: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'text', (node: any, index, parent) => {
      if (!parent || index === undefined) return;
      PLACEHOLDER_REGEX.lastIndex = 0;
      if (!PLACEHOLDER_REGEX.test(node.value)) return;
      PLACEHOLDER_REGEX.lastIndex = 0;

      const newNodes: any[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      while ((match = PLACEHOLDER_REGEX.exec(node.value))) {
        if (match.index > lastIndex) {
          newNodes.push({ type: 'text', value: node.value.slice(lastIndex, match.index) });
        }
        newNodes.push({
          type: 'placeholder',
          data: { hName: 'mark', hProperties: { 'data-placeholder': match[1] } },
          children: [{ type: 'text', value: match[0] }],
        });
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < node.value.length) {
        newNodes.push({ type: 'text', value: node.value.slice(lastIndex) });
      }

      parent.children.splice(index, 1, ...newNodes);
      return index + newNodes.length;
    });
  };
};

export default remarkHighlightPlaceholders;

import { $inputRule } from "@milkdown/utils"
import { InputRule } from "@milkdown/prose/inputrules"
import { TextSelection } from "@milkdown/prose/state";
import { MilkdownPlugin } from "@milkdown/kit/ctx";

export const mermaidInputRule = $inputRule(
  () => new InputRule(
    /```mermaid\s*([\s\S]*?)\s*```$/g,
    (state, match, start, end) => {
      const [text] = match;
      if (!text) return null;

      // 创建 mermaid 节点
      const tr = state.tr;
      const nodeType = state.schema.nodes.diagram;
      const attrs = { value: text.trim() };
      const node = nodeType.create(attrs, undefined, undefined);
      tr.replaceWith(start, end, node);

      // 设置光标位置在新插入的 mermaid 节点后面
      const pos = start + node.nodeSize;
      tr.setSelection(TextSelection.create(tr.doc, pos));

      return tr;
    },
    { inCode: true }
  )
);
export const mermaidPlugin: MilkdownPlugin[] = [mermaidInputRule].flat()
import { Ctx, Meta, MilkdownPlugin } from "@milkdown/kit/ctx"
import { $nodeAttr, $nodeSchema } from "@milkdown/utils"
import { $remark, $prose } from "@milkdown/utils"
import { RootContent } from "mdast"
import { visit } from 'unist-util-visit'
import { Plugin, PluginKey, Selection, TextSelection } from "@milkdown/prose/state"
import { EditorView, NodeViewConstructor } from "@milkdown/prose/view"
import { Node as ProseNode, Slice } from "@milkdown/prose/model"
import { editorViewCtx } from "@milkdown/kit/core"
import { unified } from "unified"
import remarkParse from 'remark-parse'
import remarkStringify from 'remark-stringify'

export function punctuationRegexp(holePlaceholder: string) {
  return new RegExp(`\\\\(?=[^\\w\\s${holePlaceholder}\\\\]|_)`, 'g')
}

/** remark 插件：移除所有转义符，只保留被转义字符本身 */
function remarkRemoveEscapes() {
  return (tree: any) => {
    visit(tree, 'text', (node: any) => {
      if (typeof node.value === 'string') {
        node.value = node.value.replace(/\\([^\w\s])/g, '$1')
      }
    })
  }
}
/** inlineSyncPlugin：只更新当前文本块，保持光标 */
export const inlineSyncPlugin = $prose((ctx: Ctx) => {
  const key = new PluginKey('inlineSyncPlugin')
  let rafId: number | null = null

  return new Plugin({
    key,
    state: {
      init: () => null,
      apply(tr, _old, _oldState, newState) {
        const view = ctx.get(editorViewCtx)
        if (!view.hasFocus?.() || !view.editable) return null
        if (!tr.docChanged) return null
        if (tr.getMeta(key)) return null

        // 节流
        if (rafId) {
          cancelAnimationFrame(rafId)
        }
        rafId = requestAnimationFrame(() => {
          rafId = null

          const { state, dispatch } = view
          const { selection, doc, schema } = state
          const { $from } = selection

          // 当前光标所在的块级范围
          const range = $from.blockRange()
          if (!range) return
          const start = range.start
          const end = range.end

          // 原始块文本
          const blockText = doc.textBetween(start, end, '', '')

          // 用 remark 解析并去转义
          const processor = unified()
            .use(remarkParse)
            // .use(remarkRemoveEscapes)
            .use(remarkStringify, true)

          const ast = processor.parse(blockText)
          let newText = processor.stringify(ast)
          if (newText !== blockText) {
            // 用 replaceWith 直接替换
            let tr2 = state.tr.replaceWith(
              start,
              end,
              schema.text(newText)
            )
            // 计算新光标位置，确保不超过文档长度
            const maxPos = tr2.doc.content.size
            const newPos = Math.min(start + newText.length, maxPos)
            tr2 = tr2.setSelection(TextSelection.create(tr2.doc, newPos))
            tr2 = tr2.setMeta(key, true)
            dispatch(tr2)
          }
        })

        return null
      },
    },
  })
})
export function createHtmlNodeView(): NodeViewConstructor {
  return (node: ProseNode, view: EditorView, getPos) => {
    let editing = false
    const pos = getPos() as number;
    const dom = document.createElement('div')
    dom.classList.add('html-block')
    dom.setAttribute('data-type', 'html')
    dom.setAttribute('contenteditable', 'true')

    const contentDOM = document.createElement('div')
    contentDOM.classList.add('html-source')
    contentDOM.setAttribute('contenteditable', 'true')

    const rendered = document.createElement('div')
    rendered.classList.add('html-rendered')
    rendered.setAttribute('data-rendered', 'true')
    rendered.innerHTML = node.attrs.value
    // 切换到编辑状态
    const enterEdit = () => {
      if (editing) return
      editing = true

      // 更新编辑内容
      contentDOM.innerText = rendered.innerHTML
      dom.innerHTML = ''
      dom.appendChild(contentDOM)

      setTimeout(() => {
        view.focus()
        // ✅ 将光标移至最后
        const selection = window.getSelection()
        const range = document.createRange()

        const lastTextNode = contentDOM.firstChild
        if (lastTextNode) {
          const len = lastTextNode.textContent?.length ?? 0
          range.setStart(lastTextNode, len)
          range.setEnd(lastTextNode, len)
          selection?.removeAllRanges()
          selection?.addRange(range)
        }
      }, 0)
    }
    // 切换到渲染状态
    const exitEdit = () => {
      if (!editing) return;
      editing = false;
      // 构造并派发 transaction，更新节点 attrs.value
      const newValue = contentDOM.innerText;
      const tr = view.state.tr;
      tr.setNodeMarkup(
        pos,               // 节点位置
        undefined,         // 保持类型不变
        { value: newValue } // 更新 attrs
      );
      view.dispatch(tr);
      // 更新预览
      rendered.innerHTML = newValue;
      dom.innerHTML = '';
      dom.appendChild(rendered);
    };

    // 点击进入编辑
    document.addEventListener('selectionchange', handleSelectionChange)
    function handleSelectionChange() {
      const selection = document.getSelection()
      if (!selection || !selection.anchorNode) return

      const anchorNode = selection.anchorNode
      const inThisNode = dom.contains(anchorNode)

      if (inThisNode && !editing) {
        requestAnimationFrame(() => enterEdit())
      } else if (!inThisNode && editing) {
        requestAnimationFrame(() => exitEdit())
      }
    }
    // 初始状态是渲染状态
    dom.appendChild(rendered)

    return {
      dom,
      contentDOM,
      update(updatedNode) {
        if (updatedNode.type !== node.type) return false
        if (!editing) {
          rendered.innerHTML = updatedNode.attrs.value
        }
        return true
      },
      ignoreMutation: () => editing,
      stopEvent: () => editing,
      destroy() {
        document.removeEventListener('selectionchange', handleSelectionChange)
      }
    }
  }
}

export const proseHtml = $prose(() => {
  return new Plugin({
    props: {
      nodeViews: {
        html: createHtmlNodeView(),
      },
      handleKeyDown(view, event) {
        const { selection } = view.state
        const node = selection.$anchor.node()
        if (node.type.name === 'html') {
          if (event.key === 'Enter') {
            // 在 html 节点内按下 Enter 键时，阻止默认行为，跳出当前段落，并在后面插入一个新的段落
            event.preventDefault()
            const { tr } = view.state
            const pos = selection.$anchor.end()
            console.log('selection::: ', selection);
            tr.setSelection(Selection.near(tr.doc.resolve(pos + 1)))
            view.dispatch(tr)
            return true
          }
        }

        return false
      },
    },

  })
})

export const remarkHtmlSplitter = $remark('remarkHtmlSplitter', () => () => (tree) => {
  visit(tree, (node, index, parent) => {
    if (!parent || (node.type !== 'html')) return
    if (!('children' in parent)) return

    const value: string = node.value
    console.log('node.value::: ', node.value);
    const htmlMatch = value.match(/^<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>[\s\S]*<\/\1>/)
    if (!htmlMatch) return

    const htmlPart = htmlMatch[0]
    const rest = value.slice(htmlPart.length).trim()
    const newHtmlNode: RootContent = {
      type: 'html',
      value: htmlPart,
    }
    const newTextNode: RootContent | null = rest
      ? { type: 'text', value: rest }
      : null
    const children = parent.children
    const newNodes: RootContent[] = [newHtmlNode]
    if (newTextNode) newNodes.push(newTextNode)
    children.splice(index!, 1, ...newNodes)
  })
})


export const htmlAttr = $nodeAttr('html')
export function withMeta<T extends MilkdownPlugin>(
  plugin: T,
  meta: Partial<Meta> & Pick<Meta, 'displayName'>
): T {
  Object.assign(plugin, {
    meta: {
      package: '@milkdown/preset-commonmark',
      ...meta,
    },
  })

  return plugin
}

withMeta(htmlAttr, {
  displayName: 'Attr<html>',
  group: 'Html',
})
export const htmlSchema = $nodeSchema('html', (ctx) => {
  ctx.inject(htmlAttr.key)
  return {
    inline: true,
    code: true,
    group: 'inline',
    content: 'text*',
    attrs: {
      value: {
        default: '',
        validate: 'string',
      },
    },
    toDOM: (node) => {
      let value = node.attrs.value
      const tagMatch = value.match(/<(\w+)/)
      const tagName = tagMatch ? tagMatch[1] : 'span'
      const match = value.match(new RegExp(`<${tagName}\\s+([^>]+)>(.*?)<\/${tagName}>`))
      if (!match) return [tagName, { 'data-type': 'html', 'data-value': value }, value.replaceAll(/<[^>]+>/g, '')]
      const attrs = match[1]?.replace(/=/g, ':').replaceAll(/ /g, '').split(' ').reduce((acc: any, attr: any) => {
        const [key, ...valueParts] = attr.split(':')
        const value = valueParts.join(':').replaceAll(/"/g, '')
        acc[key] = value.replaceAll(/"|'/g, '')
        return acc
      }, {})
      const attr = {
        ...ctx.get(htmlAttr.key)(node),
        value: value,
        'data-type': 'html',
        ...attrs,
      }
      const el = document.createElement(tagName)
      Object.keys(attr).forEach((key) => {
        el.setAttribute(key, attr[key])
      })
      el.innerHTML = value.replace(/<[^>]+>/g, '')
      return el
    },
    parseMarkdown: {
      match: ({ type }) => Boolean(type === 'html'),
      runner: (state, node, type) => {
        state.addNode(type, { value: (node.value as string) })
      },
    },
    toMarkdown: {
      match: (node) => node.type.name === 'html',
      runner: (state, node) => {
        state.addNode('html', undefined, node.attrs.value)
      },
    },
  }
})
export const htmlPlugin: MilkdownPlugin[] = [htmlSchema, remarkHtmlSplitter, proseHtml].flat()
import { Meta, MilkdownPlugin } from "@milkdown/kit/ctx"
import { $nodeAttr, $nodeSchema } from "@milkdown/utils"
import { $remark, $prose } from "@milkdown/utils"
import { RootContent } from "mdast"
import { visit } from 'unist-util-visit'
import { Plugin } from "@milkdown/prose/state"
import { Decoration, DecorationSet } from "@milkdown/prose/view"
import he from "he"

export const proseHtmlUnescape = $prose(() => {
  return new Plugin({
    props: {
      decorations(state) {
        const decorations: Decoration[] = []
        state.doc.descendants((node, pos) => {
          const htmlMatch = node.text?.match(/<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>([\s\S]*)<\/\1>/)
          if (!htmlMatch || !node.text) return
          // 创建一个 DOM 节点并渲染 HTML
          const wrapper = document.createElement(htmlMatch[1] || 'span')
          const attrs = htmlMatch[2]?.split(' ').reduce((acc: any, attr: string) => {
            const [key, value] = attr.split('=')
            if (value) {
              acc[key] = value.replace(/['"]/g, '')
            }
            return acc
          }, {})
          wrapper.setAttribute('data-type', 'html')
          wrapper.setAttribute('data-value', htmlMatch[3])
          if (attrs) {
            Object.keys(attrs).forEach(key => {
              wrapper.setAttribute(key, attrs[key])
            })
          }
          wrapper.innerHTML = htmlMatch[3]
          const deco = Decoration.widget(pos - 1, () => wrapper, {
            side: -1,
            key: `html-${pos}`,
          })
          decorations.push(deco)
        })
        return DecorationSet.create(state.doc, decorations)
      },
    },
  })
})

export const remarkHtmlSplitter = $remark('remarkHtmlSplitter', () => () => (tree) => {
  visit(tree, 'html', (node, index, parent) => {
    const value: string = node.value
    const children = parent!.children
    // 例子：把 html 部分抽出来
    const htmlMatch = value.match(/^<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>[\s\S]*<\/\1>/)
    if (!htmlMatch) return
    const htmlPart = htmlMatch[0]
    const rest = value.slice(htmlPart.length).trim()
    const newNodes: RootContent[] = []
    // html node
    newNodes.push({
      type: 'text',
      value: he.decode(htmlPart),
    })
    // 如果有剩下的文本
    if (rest) {
      newNodes.push({ type: 'text', value: rest })
    }
    // 替换当前节点
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
    atom: true,
    group: 'inline',
    inline: true,
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
export const htmlPlugin: MilkdownPlugin[] = [htmlSchema, remarkHtmlSplitter, proseHtmlUnescape].flat()
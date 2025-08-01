import { Meta, MilkdownPlugin } from "@milkdown/kit/ctx"
import { $nodeAttr, $nodeSchema } from "@milkdown/utils"

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
      // 提取出该创建什么标签
      const tagMatch = node.attrs.value.match(/<(\w+)/)
      const tagName = tagMatch ? tagMatch[1] : 'span'
      // <div align=\"center\" style=\"color:red\">center</div> 我需要提取出 所有的属性 和内容 
      const attrs = node.attrs.value.match(/<div\s+([^>]+)>(.*?)<\/div>/)[1].replace(/=/g, ':').split(' ').reduce((acc: any, attr: any) => {
        const [key, ...valueParts] = attr.split(':')
        const value = valueParts.join(':').replace(/"/g, '') // 去掉引
        acc[key] = value.replace(/"/g, '')
        return acc
      }, {})
      const tag = document.createElement(tagName)
      const attr = {
        ...ctx.get(htmlAttr.key)(node),
        ...attrs,
      }
      tag.textContent = node.attrs.value.replace(/<[^>]+>/g, '')
      return [tagName, attr, node.attrs.value.replace(/<[^>]+>/g, '')]
    },
    parseDOM: [
      {
        tag: 'span[data-type="html"]',
        getAttrs: (dom) => {
          return {
            value: dom.dataset.value ?? '',
          }
        },
      },
    ],
    parseMarkdown: {
      match: ({ type }) => Boolean(type === 'html'),
      runner: (state, node, type) => {
        // 这里直接去掉标签，直接渲染内容
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
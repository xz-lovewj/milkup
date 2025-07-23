import { Uploader } from '@milkdown/kit/plugin/upload'
import type { Node } from '@milkdown/kit/prose/model'
import { uploadImage } from '@/api'

export const uploader: Uploader = async (files, schema) => {
  const images: File[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files.item(i)
    if (!file) {
      continue
    }

    // You can handle whatever the file type you want, we handle image here.
    if (!file.type.includes('image')) {
      continue
    }

    images.push(file)
  }
  const filePath = await window.electronAPI.getFilePathInClipboard()
  if (filePath) {
    const fileName = filePath.split('/').pop() || 'image.png'
    return [schema.nodes.image.createAndFill({ src: filePath, alt: fileName }) as Node]
  } else {
    const arrayBuffer = await images[0].arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const path = await window.electronAPI.wirteTempImage(buffer);
    return [schema.nodes.image.createAndFill({ src: path, alt: images[0].name }) as Node]
  }
  const nodes: Node[] = await Promise.all(
    images.map(async (image) => {
      const src = await uploadImage(image)
      const alt = image.name
      return schema.nodes.image.createAndFill({
        src,
        alt,
      }) as Node
    })
  )

  return nodes
}


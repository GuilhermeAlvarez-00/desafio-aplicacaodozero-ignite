import { useEffect } from 'react'

interface useCommentsProps {
  commentNodeId: string
  post: {
    first_publication_date: string | null
    data: {
      title: string
      banner: {
        url: string
      }
      author: string
      content: {
        heading: string
        body: {
          text: string
        }[]
      }[]
    }
  }
}

export function useComments({ commentNodeId, post }: useCommentsProps) {
  useEffect(() => {
    const scriptParentNode = document.getElementById(commentNodeId)
    if (!scriptParentNode) return
    const script = document.createElement('script')
    script.src = 'https://utteranc.es/client.js'
    script.async = true
    script.setAttribute(
      'repo',
      'GuilhermeAlvarez-00/desafio-aplicacaodozero-ignite'
    )
    script.setAttribute('issue-term', 'pathname')
    script.setAttribute('label', 'comment :speech_balloon:')
    script.setAttribute('theme', 'github-dark')
    script.setAttribute('crossorigin', 'anonymous')

    scriptParentNode.appendChild(script)

    return () => {
      scriptParentNode.removeChild(scriptParentNode.firstChild)
    }
  }, [commentNodeId, post])
}

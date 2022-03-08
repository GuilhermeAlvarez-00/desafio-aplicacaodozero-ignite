import { useComments } from '../../hooks/useComments'

interface CommentsProps {
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

export default function Comments({ post }: CommentsProps) {
  const commentNodeId = 'inject-comments-for-uterances'
  const comments = {
    commentNodeId,
    post,
  }
  useComments(comments)

  return <div id={comments.commentNodeId}></div>
}

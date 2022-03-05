import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { GetStaticPaths, GetStaticProps } from 'next'
import { FiCalendar, FiUser } from 'react-icons/fi'
import { RichText } from 'prismic-dom'
import Prismic from '@prismicio/client'

import Header from '../../components/Header'
import { getPrismicClient } from '../../services/prismic'

import commonStyles from '../../styles/common.module.scss'
import styles from './post.module.scss'

interface Post {
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

interface PostProps {
  post: Post
}

export default function Post({ post }: PostProps) {
  function formatDate(date) {
    const formattedDate = format(new Date(date), 'dd MMM uuuu', {
      locale: ptBR,
    })
    return formattedDate
  }

  return (
    <>
      <Header />
      <img src={post.data.banner.url} alt="imagem" className={styles.banner} />
      <main className={`${commonStyles.container} ${styles.postWrapper}`}>
        <h1>{post.data.title}</h1>

        <div className={commonStyles.details}>
          <span>
            <FiCalendar />
            {formatDate(post.first_publication_date)}
          </span>

          <span>
            <FiUser />
            {post.data.author}
          </span>
        </div>

        {post.data.content.map(content => (
          <article key={content.heading} className={styles.content}>
            <h2>{content.heading}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: RichText.asHtml(content.body),
              }}
            />
          </article>
        ))}
      </main>
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient()
  const posts = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    {}
  )

  const paths = posts.results.map(post => ({
    params: {
      slug: post.uid,
    },
  }))

  return {
    paths,
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params
  const prismic = getPrismicClient()
  const response = await prismic.getByUID('posts', String(slug), {})

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: [...content.body],
      })),
    },
  }

  return {
    props: {
      post,
    },
    revalidate: 60 * 60, // 1 hour
  }
}

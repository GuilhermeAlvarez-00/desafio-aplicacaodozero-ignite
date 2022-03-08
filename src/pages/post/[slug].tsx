import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'
import { GetStaticPaths, GetStaticProps } from 'next'
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi'
import { RichText } from 'prismic-dom'
import Prismic from '@prismicio/client'

import Header from '../../components/Header'
import { getPrismicClient } from '../../services/prismic'

import commonStyles from '../../styles/common.module.scss'
import styles from './post.module.scss'
import { useRouter } from 'next/router'
import Comments from '../../components/Comments'

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
  lastUpdate: string
}

export default function Post({ post, lastUpdate }: PostProps) {
  console.log(lastUpdate)
  function formatDate(date) {
    const formattedDate = format(new Date(date), 'dd MMM uuuu', {
      locale: ptBR,
    })
    return formattedDate
  }

  function formatlastUpdate(date) {
    const currentDate = format(new Date(date), 'dd MMM uuuu HH mm', {
      locale: ptBR,
    }).split(' ')
    const dateFormatted = currentDate.slice(0, 3).join(' ')
    const hourFormatted = currentDate.slice(-2).join(':')

    return `${dateFormatted}, às ${hourFormatted}`
  }

  const router = useRouter()

  if (router.isFallback) {
    return <h2>Carregando...</h2>
  }

  const totalWordsInPost = post.data.content.reduce((acc, cur) => {
    acc += cur.heading.split(' ').length

    const body = cur.body.map(item => item.text.split(' ').length)

    acc += body.reduce((acc, cur) => acc + cur)

    return acc
  }, 0)

  const readingTime = Math.ceil(totalWordsInPost / 200)

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

          <span>
            <FiClock />
            {`${readingTime} min`}
          </span>
          <p
            className={commonStyles.lastUpdate}
          >{`* editado em ${formatlastUpdate(lastUpdate)}`}</p>
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
        <Comments />
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
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
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

  const lastUpdate = response.last_publication_date

  return {
    props: {
      post,
      lastUpdate,
    },
    revalidate: 60 * 60, // 1 hour
  }
}

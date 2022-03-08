import Head from 'next/head'
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
import { PreviewButton } from '../../components/PreviewButton'
import Link from 'next/link'
import { useEffect } from 'react'

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
  preview: boolean
  pagination: {
    prevPost: {
      title: string
      slug: string
    } | null
    nextPost: {
      title: string
      slug: string
    } | null
  } | null
}

export default function Post({
  post,
  lastUpdate,
  preview,
  pagination,
}: PostProps) {
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
      <Head>
        <title>Space Traveling - {post.data.title}</title>
      </Head>
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

        <div className={styles.divider} />

        {pagination && (
          <div className={styles.paginationLinks}>
            {pagination.prevPost && (
              <Link href={`/post/${pagination.prevPost.slug}`}>
                <a className={styles.prevPost}>
                  {pagination.prevPost.title}
                  <span>Post anterior</span>
                </a>
              </Link>
            )}

            {pagination.nextPost && (
              <Link href={`/post/${pagination.nextPost.slug}`}>
                <a className={styles.nextPost}>
                  {pagination.nextPost.title}
                  <span>Próximo post</span>
                </a>
              </Link>
            )}
          </div>
        )}
        <Comments post={post} />
        {preview && <PreviewButton />}
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

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
  params,
}) => {
  const { slug } = params
  const prismic = getPrismicClient()
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  })

  const postsResponse = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts')
  )

  const pagination =
    postsResponse.results.reduce((pagination, currentPost, index, allPosts) => {
      if (currentPost.id === response.id) {
        const prev = allPosts[index - 1]
        const next = allPosts[index + 1]

        let prevPost = null
        let nextPost = null

        if (prev) {
          prevPost = {
            title: prev?.data.title ?? null,
            slug: prev?.uid ?? null,
          }
        }

        if (next) {
          nextPost = {
            title: next?.data.title ?? null,
            slug: next?.uid ?? null,
          }
        }

        const paginationLinks = {
          prevPost,
          nextPost,
        }

        pagination = paginationLinks
      }

      return pagination
    }, {}) ?? null

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
      preview,
      pagination,
    },
    revalidate: 60 * 60, // 1 hour
  }
}

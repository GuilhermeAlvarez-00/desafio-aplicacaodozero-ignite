import { GetStaticProps } from 'next'
import Link from 'next/link'
import { FiCalendar, FiUser } from 'react-icons/fi'
import Prismic from '@prismicio/client'
import { format } from 'date-fns'
import ptBR from 'date-fns/locale/pt-BR'

import Header from '../components/Header'
import { getPrismicClient } from '../services/prismic'

import commonStyles from '../styles/common.module.scss'
import styles from './home.module.scss'
import { useState } from 'react'
import { PreviewButton } from '../components/PreviewButton'
import Head from 'next/head'

interface Post {
  uid?: string
  first_publication_date: string | null
  data: {
    title: string
    subtitle: string
    author: string
  }
}

interface PostPagination {
  next_page: string
  results: Post[]
}

interface HomeProps {
  postsPagination: PostPagination
  preview: boolean
}

export default function Home({ postsPagination, preview }: HomeProps) {
  function formatDate(date) {
    const formattedDate = format(new Date(date), 'dd MMM uuuu', {
      locale: ptBR,
    })
    return formattedDate
  }

  const formattedPosts = postsPagination.results.map(post => ({
    ...post,
    first_publication_date: formatDate(post.first_publication_date),
  }))

  const [posts, setPosts] = useState<Post[]>(formattedPosts)
  const [nextPage, setNextPage] = useState(postsPagination.next_page)

  async function handleLoadMorePosts() {
    const response = await fetch(nextPage)
    const postsResponse = await response.json()

    const newPosts = postsResponse.results.map(post => ({
      uid: post.uid,
      first_publication_date: formatDate(post.first_publication_date),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    }))
    const newNextPage = postsResponse.next_page

    setPosts(state => [...state, ...newPosts])
    setNextPage(newNextPage)
  }

  return (
    <>
      <Head>
        <title>Space Traveling - Posts</title>
      </Head>
      <Header />
      <main className={`${commonStyles.container}`}>
        {posts.map(post => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <a className={styles.postWrapper}>
              <h2>{post.data.title}</h2>
              <p>{post.data.subtitle}</p>

              <div className={commonStyles.details}>
                <span>
                  <FiCalendar />
                  {post.first_publication_date}
                </span>

                <span>
                  <FiUser />
                  {post.data.author}
                </span>
              </div>
            </a>
          </Link>
        ))}

        {nextPage && (
          <button
            className={styles.buttonLoadMorePosts}
            onClick={handleLoadMorePosts}
          >
            Carregar mais posts
          </button>
        )}

        {preview && <PreviewButton />}
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps<HomeProps> = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient()
  const postsResponse = await prismic.query(
    [Prismic.Predicates.at('document.type', 'posts')],
    { pageSize: 1, ref: previewData?.ref ?? null }
  )

  const posts = postsResponse.results.map(post => ({
    uid: post.uid,
    first_publication_date: post.first_publication_date,
    data: {
      title: post.data.title,
      subtitle: post.data.subtitle,
      author: post.data.author,
    },
  }))
  const nextPage = postsResponse.next_page

  console.log(postsResponse)

  return {
    props: {
      postsPagination: {
        next_page: nextPage,
        results: posts,
      },
      preview,
    },
    revalidate: 60 * 60, // 1 hour
  }
}

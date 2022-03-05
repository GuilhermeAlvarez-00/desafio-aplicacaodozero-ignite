import { GetStaticProps } from 'next';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi'

import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home() {
  return (
    <>
      <Header />
      <main className={`${commonStyles.container}`}>
        <Link href="#">
          <a className={styles.postWrapper}>
            <h2>Como utilizar hooks</h2>
            <p>Pensando em sincronização em vez de ciclos de vida</p>

            <div className={commonStyles.details}>
              <span>
                <FiCalendar />
                15 mar 2021
              </span>

              <span>
                <FiUser />
                Joseph Oliveira
              </span>
            </div>
          </a>
        </Link>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
//   // const prismic = getPrismicClient();
//   // const postsResponse = await prismic.query(TODO);
  return {
    props: {},
    revalidate: 60 * 60 // 1 hour
  }
};

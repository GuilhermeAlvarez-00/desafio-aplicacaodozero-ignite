import Link from 'next/link'

import styles from './header.module.scss'
import commonStyles from '../../styles/common.module.scss'

export default function Header() {
  return (
    <header className={styles.header}>
      <nav className={`${styles.navContainer} ${commonStyles.container}`}>
        <Link href="/">
          <a>
            <img src="/images/logo.svg" alt="logo" />
          </a>
        </Link>
      </nav>
    </header>
  )
}

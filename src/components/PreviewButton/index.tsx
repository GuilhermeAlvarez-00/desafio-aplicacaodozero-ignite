import Link from 'next/link'

import styles from './previewButton.module.scss'

export function PreviewButton() {
  return (
    <aside className={styles.buttonContainer}>
      <Link href="/api/exit-preview">
        <a>Sair do modo Preview</a>
      </Link>
    </aside>
  )
}

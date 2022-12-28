import React from 'react'
import styles from './index.module.scss'

interface Props {
  ordered: boolean
  children: React.ReactNode
}

export default function ({ ordered, children }: Props) {
  if (ordered) {
    return <ol className={styles.ol}>{children}</ol>
  }
  return <ul className={styles.ul}>{children}</ul>
}

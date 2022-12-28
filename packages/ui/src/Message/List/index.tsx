import React from 'react'
import styles from './index.module.scss'

interface Props {
  children: React.ReactNode
}

export default function ({ children }: Props) {
  return <ul className={styles.ul}>{children}</ul>
}

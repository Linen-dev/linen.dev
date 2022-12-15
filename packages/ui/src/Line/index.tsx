import React from 'react'
import styles from './index.module.scss'

interface Props {
  children: React.ReactNode
}

export default function Line ({ children }: Props) {
  return <div className={styles.line}>{children}</div>
}

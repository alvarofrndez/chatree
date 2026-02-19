import { useEffect, useState } from 'react'
import styles from './DotLoading.module.scss'

export default function DotLoading({
    text     = 'Creating',
    maxDots  = 3,
    interval = 500,
}) {
    const [dots, setDots] = useState(1)

    useEffect(() => {
        const timer = setInterval(() => {
            setDots(prev => (prev >= maxDots ? 1 : prev + 1))
        }, interval)

        return () => clearInterval(timer)
    }, [maxDots, interval])

    return (
        <span className={styles.dotLoading}>
            {text}
            <span className={styles.dots} aria-hidden="true">
                {Array.from({ length: maxDots }, (_, i) => (
                    <span
                        key={i}
                        className={`${styles.dot} ${i < dots ? styles.visible : ''}`}
                    >
                        .
                    </span>
                ))}
            </span>
        </span>
    )
}
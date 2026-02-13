import { useEffect, useState } from 'react'

export default function DotLoading({
    text = 'Creating',
    maxDots = 3,
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
        <span>
            {text}
            {'.'.repeat(dots)}
        </span>
    )
}
import { forwardRef } from 'react'
import styles from './Input.module.scss'

const Input = forwardRef(({ 
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className = '',
  ...props 
}, ref) => {
  const wrapperClass = [
    styles.inputWrapper,
    fullWidth && styles.fullWidth,
    error && styles.hasError,
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={wrapperClass}>
      {label && (
        <label className={styles.label} htmlFor={props.id}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}
      
      <div className={styles.inputContainer}>
        {leftIcon && (
          <div className={styles.leftIcon}>{leftIcon}</div>
        )}
        
        <input
          ref={ref}
          className={styles.input}
          {...props}
        />
        
        {rightIcon && (
          <div className={styles.rightIcon}>{rightIcon}</div>
        )}
      </div>
      
      {hint && !error && (
        <span className={styles.hint}>{hint}</span>
      )}
      
      {error && (
        <span className={styles.error}>{error}</span>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input

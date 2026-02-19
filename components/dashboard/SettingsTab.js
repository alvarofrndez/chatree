'use client'

import { useState, useRef, useCallback } from 'react'
import { Camera, Loader2, Check, Trash2, User } from 'lucide-react'
import { toast } from 'sonner'
import { updateProfile, deleteAvatar } from '@/lib/services/profile.service'
import styles from './SettingsTab.module.scss'
import DotLoading from '@/components/DotLoading'

const AVATAR_SIZE      = 512
const AVATAR_QUALITY   = 0.90
const MAX_FILE_SIZE_MB = 5
const ACCEPTED_TYPES   = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// ─── Image processing ─────────────────────────────────────────────────────────
function processAvatarImage(file) {
  return new Promise((resolve, reject) => {
    const img       = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      const canvas  = document.createElement('canvas')
      canvas.width  = AVATAR_SIZE
      canvas.height = AVATAR_SIZE

      const ctx     = canvas.getContext('2d')
      const srcSize = Math.min(img.width, img.height)
      const srcX    = (img.width  - srcSize) / 2
      const srcY    = (img.height - srcSize) / 2

      ctx.drawImage(img, srcX, srcY, srcSize, srcSize, 0, 0, AVATAR_SIZE, AVATAR_SIZE)

      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Failed to encode image')),
        'image/webp',
        AVATAR_QUALITY
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image'))
    }

    img.src = objectUrl
  })
}

// ─── Storage upload ───────────────────────────────────────────────────────────
async function uploadAvatarToStorage(supabase, userId, blob) {
  const filename    = `avatar_${Date.now()}.webp`
  const storagePath = `${userId}/${filename}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(storagePath, blob, { contentType: 'image/webp', upsert: false })

  if (error) throw new Error(error.message)

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(storagePath)

  return publicUrl
}

// ─── Avatar Picker ────────────────────────────────────────────────────────────
function AvatarPicker({ currentUrl, preview, onChange, onRemove, uploading }) {
  const inputRef = useRef(null)
  const imageSrc = preview || currentUrl

  return (
    <div className={styles.avatarSection}>
      <div className={styles.avatarWrapper}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="Profile picture preview"
            className={styles.avatarPreview}
            width={96}
            height={96}
          />
        ) : (
          <div className={styles.avatarPlaceholder} aria-hidden="true">
            <User size={40} />
          </div>
        )}

        <button
          type="button"
          className={styles.avatarOverlay}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          aria-label="Change profile picture"
        >
          {uploading
            ? <Loader2 size={20} className={styles.spin} aria-hidden="true" />
            : <Camera  size={20} aria-hidden="true" />
          }
        </button>
      </div>

      <div className={styles.avatarActions}>
        <button
          type="button"
          className={styles.avatarChangeBtn}
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          Change photo
        </button>

        {(currentUrl || preview) && (
          <button
            type="button"
            className={styles.avatarRemoveBtn}
            onClick={onRemove}
            disabled={uploading}
            aria-label="Remove profile picture"
          >
            <Trash2 size={14} aria-hidden="true" />
            Remove
          </button>
        )}
      </div>

      <p className={styles.avatarHint}>
        JPG, PNG or WebP · Max {MAX_FILE_SIZE_MB}MB · Cropped to square · Saved as WebP
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className={styles.hiddenInput}
        aria-hidden="true"
        tabIndex={-1}
        onChange={onChange}
      />
    </div>
  )
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
export default function SettingsTab({ profile, onProfileUpdate }) {
  const [supabaseClient] = useState(() => {
    if (typeof window === 'undefined') return null
    const { createClient } = require('@/lib/supabase/client')
    return createClient()
  })

  const [formData, setFormData] = useState({
    username:   profile?.username   || '',
    full_name:  profile?.full_name  || '',
    bio:        profile?.bio        || '',
    avatar_url: profile?.avatar_url || '',
  })

  // Ephemeral avatar picker state
  const [avatarPreview,     setAvatarPreview]     = useState(null)   // blob URL — instant preview
  const [pendingAvatarBlob, setPendingAvatarBlob] = useState(null)   // processed blob to upload
  const [removeAvatar,      setRemoveAvatar]      = useState(false)  // flag: clear on save

  const [uploading, setUploading] = useState(false)
  const [saving,    setSaving]    = useState(false)

  const isDirty =
    formData.username  !== (profile?.username  || '') ||
    formData.full_name !== (profile?.full_name || '') ||
    formData.bio       !== (profile?.bio       || '') ||
    pendingAvatarBlob  !== null ||
    removeAvatar

  // ── Field change ───────────────────────────────────────────────────────────
  const handleFieldChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // ── Avatar file picked ─────────────────────────────────────────────────────
  const handleAvatarChange = useCallback(async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error('Invalid file type', { description: 'Please upload a JPG, PNG, WebP, or GIF.' })
      return
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error('File too large', { description: `Image must be under ${MAX_FILE_SIZE_MB}MB.` })
      return
    }

    setUploading(true)
    try {
      const blob = await processAvatarImage(file)

      // Revoke any previous pending preview before creating a new one
      setAvatarPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return URL.createObjectURL(blob)
      })
      setPendingAvatarBlob(blob)
      setRemoveAvatar(false)
    } catch (err) {
      toast.error('Could not process image', { description: err.message })
    } finally {
      setUploading(false)
    }
  }, [])

  // ── Avatar remove ──────────────────────────────────────────────────────────
  const handleRemoveAvatar = useCallback(() => {
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setPendingAvatarBlob(null)
    setRemoveAvatar(true)
  }, [])

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault()
    if (!isDirty || saving) return

    setSaving(true)
    try {
      const updates = {
        username:  formData.username.trim(),
        full_name: formData.full_name.trim(),
        bio:       formData.bio.trim(),
      }

      // Resolve the avatar URL that will be committed after this save
      // We track it ourselves so we never depend on result.data being complete.
      let nextAvatarUrl = formData.avatar_url

      if (removeAvatar) {
        if (profile?.avatar_url) await deleteAvatar(profile.avatar_url)
        nextAvatarUrl      = null
        updates.avatar_url = null

      } else if (pendingAvatarBlob) {
        if (profile?.avatar_url) await deleteAvatar(profile.avatar_url)
        const publicUrl    = await uploadAvatarToStorage(supabaseClient, profile.id, pendingAvatarBlob)
        nextAvatarUrl      = publicUrl
        updates.avatar_url = publicUrl
      }

      const result = await updateProfile(updates)

      if (!result.success) {
        toast.error('Could not save changes', { description: result.error })
        return
      }

      // ── Commit UI state in the right order ────────────────────────────────
      //
      // 1. Revoke blob preview — it's no longer needed
      setAvatarPreview((prev) => {
        if (prev) URL.revokeObjectURL(prev)
        return null
      })

      // 2. Clear pending blob and remove flag
      setPendingAvatarBlob(null)
      setRemoveAvatar(false)

      // 3. Persist the new avatar URL into formData so AvatarPicker renders
      //    the correct image via `currentUrl` after preview is cleared.
      //    This is the definitive fix: formData becomes the source of truth.
      setFormData((prev) => ({ ...prev, avatar_url: nextAvatarUrl }))

      // 4. Notify parent with a fully-merged profile so that even if the parent
      //    remounts this component, the profile it passes down has the correct
      //    avatar_url and the useState initialiser picks it up correctly.
      onProfileUpdate?.({
        ...profile,
        ...result.data,
        avatar_url: nextAvatarUrl, // always override — this is what we know is right
      })

      toast.success('Profile updated', {
        description: 'Your changes have been saved successfully.',
      })
    } catch (err) {
      toast.error('Something went wrong', {
        description: err.message || 'Please try again.',
      })
    } finally {
      setSaving(false)
    }
  }

  const bioLength          = formData.bio.length
  const bioLimit           = 160
  const committedAvatarUrl = removeAvatar ? null : formData.avatar_url

  return (
    <section className={styles.settings} aria-label="Profile settings">
      <form onSubmit={handleSave} className={styles.form} noValidate>

        {/* ── Avatar ── */}
        <AvatarPicker
          currentUrl={committedAvatarUrl}
          preview={avatarPreview}
          onChange={handleAvatarChange}
          onRemove={handleRemoveAvatar}
          uploading={uploading}
        />

        <hr className={styles.divider} />

        {/* ── Username ── */}
        <div className={styles.field}>
          <label htmlFor="settings-username" className={styles.label}>
            Username
          </label>
          <div className={styles.inputWrapper}>
            <span className={styles.inputPrefix} aria-hidden="true">@</span>
            <input
              id="settings-username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleFieldChange}
              className={styles.input}
              placeholder="alexchen"
              minLength={3}
              maxLength={30}
              pattern="^[a-zA-Z0-9_-]+$"
              autoComplete="username"
              aria-describedby="username-hint"
              required
            />
          </div>
          <p id="username-hint" className={styles.hint}>
            3–30 characters. Letters, numbers, _ and - only.
            Your profile URL: <strong>/{formData.username || 'username'}</strong>
          </p>
        </div>

        {/* ── Full Name ── */}
        <div className={styles.field}>
          <label htmlFor="settings-fullname" className={styles.label}>
            Full Name
          </label>
          <input
            id="settings-fullname"
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleFieldChange}
            className={styles.input}
            placeholder="Alex Chen"
            maxLength={80}
            autoComplete="name"
          />
        </div>

        {/* ── Bio ── */}
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label htmlFor="settings-bio" className={styles.label}>
              Bio
            </label>
            <span
              className={`${styles.charCount} ${bioLength > bioLimit ? styles.charCountOver : ''}`}
              aria-live="polite"
              aria-label={`${bioLength} of ${bioLimit} characters used`}
            >
              {bioLength}/{bioLimit}
            </span>
          </div>
          <textarea
            id="settings-bio"
            name="bio"
            value={formData.bio}
            onChange={handleFieldChange}
            className={styles.textarea}
            placeholder="Tell people a bit about yourself and what kind of AI conversations you share..."
            maxLength={bioLimit}
            rows={3}
            aria-describedby="bio-hint"
          />
          <p id="bio-hint" className={styles.hint}>
            Appears on your public profile page.
          </p>
        </div>

        {/* ── Submit ── */}
        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={saving || uploading || !isDirty || bioLength > bioLimit}
            aria-busy={saving}
          >
            {saving
              ? <DotLoading text="Saving" />
              : <>Save changes</>
            }
          </button>
        </div>

      </form>
    </section>
  )
}
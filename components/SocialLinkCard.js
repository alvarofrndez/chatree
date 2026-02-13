'use client'

import styles from './SocialLinkCard.module.scss'
import { Trash2, Pencil, Globe } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import {
  SiX,
  SiLinkedin,
  SiGithub,
  SiInstagram,
  SiYoutube,
  SiTiktok,
  SiFacebook,
} from '@icons-pack/react-simple-icons'
import { Mail } from 'lucide-react'

const platformData = {
  twitter: { color: '#000000', rgb: '0, 0, 0', icon: SiX, label: 'X (Twitter)' },
  linkedin: { color: '#0A66C2', rgb: '10, 102, 194', icon: SiLinkedin, label: 'LinkedIn' },
  github: { color: '#181717', rgb: '24, 23, 23', icon: SiGithub, label: 'GitHub' },
  instagram: { color: '#E4405F', rgb: '228, 64, 95', icon: SiInstagram, label: 'Instagram' },
  youtube: { color: '#FF0000', rgb: '255, 0, 0', icon: SiYoutube, label: 'YouTube' },
  tiktok: { color: '#000000', rgb: '0, 0, 0', icon: SiTiktok, label: 'TikTok' },
  facebook: { color: '#1877F2', rgb: '24, 119, 242', icon: SiFacebook, label: 'Facebook' },
  website: { color: '#6366f1', rgb: '99, 102, 241', icon: Globe, label: 'Website' },
  email: { color: '#EA4335', rgb: '234, 67, 53', icon: Mail, label: 'Email' },
  other: { color: '#6366f1', rgb: '99, 102, 241', icon: Globe, label: 'Link' },
}

export default function SocialLinkCard({ 
  link, 
  editable = false, 
  onEdit, 
  onDelete 
}) {
  const data = platformData[link.platform.toLowerCase()] || platformData.other
  const Logo = data.icon
  
  const openLink = () => {
    if (!editable) {
      window.open(link.url, '_blank', 'noopener,noreferrer')
    }
  }
  
  return (
    <div 
      className={`${styles.card} ${editable ? styles.editable : ''}`}
      style={{
        '--platform-color': data.color,
        '--platform-color-rgb': data.rgb,
      }}
      onClick={openLink}
    >
      <div className={styles.content}>
        <div className={styles.iconContainer}>
          <Logo className={styles.svgLogo} />
        </div>
        
        <span className={styles.label}>
          {link.label || data.label}
        </span>
      </div>
      
      {editable && (
        <div className={styles.actions}>
          {/* EDIT */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(link)
            }}
            className={styles.actionBtn}
          >
            <Pencil size={16} />
          </button>

          {/* DELETE */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className={styles.actionBtn}
              >
                <Trash2 size={16} className="text-red-400" />
              </button>
            </AlertDialogTrigger>

            <AlertDialogContent className={styles.alertDialogContent}>
              <AlertDialogHeader className={styles.alertDialogHeader}>
                <AlertDialogTitle className={styles.alertDialogTitle}>
                  Delete this social link?
                </AlertDialogTitle>

                <AlertDialogDescription className={styles.alertDialogDescription}>
                  This action will permanently delete your link to <strong>{link.label || data.label}</strong>.
                  You won't be able to recover it.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter className={styles.alertDialogFooter}>
                <AlertDialogCancel onClick={(e) => {e.stopPropagation()}} className={styles.alertDialogCancel}>
                  Cancel
                </AlertDialogCancel>

                <AlertDialogAction
                  onClick={(e) => {e.stopPropagation(); onDelete(link.id)}}
                  className={styles.alertDialogConfirm}
                >
                  Delete link
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      <div className={styles.glow} />
    </div>
  )
}

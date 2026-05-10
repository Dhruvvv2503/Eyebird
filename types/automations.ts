export type AutomationStatus = 'active' | 'paused' | 'draft'

export interface Automation {
  id: string
  user_id: string
  ig_account_id: string
  name: string
  status: AutomationStatus
  trigger_type: string
  trigger_post_id: string | null
  trigger_post_url: string | null
  trigger_post_thumbnail: string | null
  trigger_keywords: string[]
  trigger_any_word: boolean
  reply_to_comment_publicly: boolean
  opening_dm_enabled: boolean
  opening_dm_text: string | null
  follow_gate_enabled: boolean
  main_dm_text: string
  main_dm_link_text: string | null
  main_dm_link_url: string | null
  test_mode: boolean
  test_instagram_username: string
  total_dms_sent: number
  total_comments_triggered: number
  created_at: string
  updated_at: string
}

export interface AutomationLog {
  id: string
  automation_id: string
  commenter_username: string
  comment_text: string
  dm_sent: boolean
  dm_sent_at: string | null
  error_message: string | null
  test_mode: boolean
  created_at: string
}

export interface InstagramPost {
  id: string
  media_type: string
  media_url: string
  thumbnail_url: string | null
  permalink: string
  timestamp: string
  like_count: number
  comments_count: number
}

export interface AutomationFormState {
  name: string
  trigger_post_id: string | null
  trigger_post_url: string | null
  trigger_post_thumbnail: string | null
  trigger_keywords: string[]
  trigger_any_word: boolean
  reply_to_comment_publicly: boolean
  opening_dm_enabled: boolean
  opening_dm_text: string
  follow_gate_enabled: boolean
  main_dm_text: string
  main_dm_link_text: string
  main_dm_link_url: string
  test_mode: boolean
}

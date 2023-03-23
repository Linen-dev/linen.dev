//
export interface UserInfoResponseBody {
  ok: boolean;
  user: UserInfo;
}
export interface UserInfo {
  id: string;
  team_id: string;
  name: string;
  deleted: boolean;
  color: string;
  real_name: string;
  tz: string;
  tz_label: string;
  tz_offset: number;
  profile: Profile;
  is_admin: boolean;
  is_owner: boolean;
  is_primary_owner: boolean;
  is_restricted: boolean;
  is_ultra_restricted: boolean;
  is_bot: boolean;
  is_app_user: boolean;
  updated: number;
  is_email_confirmed: boolean;
  who_can_share_contact_card: string;
}

export interface Profile {
  title: string;
  phone: string;
  skype: string;
  real_name: string;
  real_name_normalized: string;
  display_name: string;
  display_name_normalized: string;
  fields: any;
  status_text: string;
  status_emoji: string;
  status_emoji_display_info: any[];
  status_expiration: number;
  avatar_hash: string;
  image_original: string;
  is_custom_image: boolean;
  image_24: string;
  image_32: string;
  image_48: string;
  image_72: string;
  image_192: string;
  image_512: string;
  image_1024: string;
  status_text_canonical: string;
  team: string;
}

export interface BotInfo {
  id: string;
  deleted: boolean;
  name: string;
  updated: number;
  app_id: string;
  user_id?: string;
  icons: {
    image_36: string;
    image_48: string;
    image_72: string;
  };
}

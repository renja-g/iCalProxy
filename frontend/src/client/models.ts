export type Body_login_login_access_token = {
  grant_type?: string | null
  username: string
  password: string
  scope?: string
  client_id?: string | null
  client_secret?: string | null
}

export type HTTPValidationError = {
  detail?: Array<ValidationError>
}

export type ICalCreate = {
  ical_url: string
}

export type ICalPublic = {
  ical_url: string
  id: string
  owner_id: string
}

export type ICalUpdate = {
  ical_url?: string | null
}

export type Message = {
  message: string
}

export type Token = {
  access_token: string
  token_type?: string
}

export type UpdatePassword = {
  current_password: string
  new_password: string
}

export type UserPublic = {
  email: string
  is_active?: boolean
  is_superuser?: boolean
  id: string
}

export type UserRegister = {
  email: string
  password: string
}

export type UserUpdateMe = {
  email?: string | null
}

export type ValidationError = {
  loc: Array<string | number>
  msg: string
  type: string
}

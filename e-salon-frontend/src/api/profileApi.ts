import api from './client'
import type { UpdateProfileRequest, UserProfile } from '../types'

export const getProfile = () => api.get<UserProfile>('/user/profile')

export const updateProfile = (data: UpdateProfileRequest) =>
  api.put<UserProfile>('/user/profile', data)

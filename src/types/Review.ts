export interface Review {
  id: string
  rating: number
  createdAt: Date
  comment: string
  name?: string
  canEdit?: boolean
}

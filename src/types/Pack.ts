export interface Pack {
  id: string
  minLearners: number
  maxLearners: number
  discountPercentage: number
  createdAt?: Date
  isActive?: boolean
}

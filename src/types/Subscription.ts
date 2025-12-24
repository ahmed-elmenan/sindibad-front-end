export interface Subscription {
  id: string;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  discountPercentage: number;
  unitPrice: number;
  status: SubscriptionStatus;
} 

import type { SubscriptionStatus } from "@/types/enum/SubscriptionStatus";
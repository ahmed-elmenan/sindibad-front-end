import type { LearnerPayload } from "./Learner";

export type OrganizationType = "SCHOOL" | "ASSOCIATION" | "OTHER";

export type OrganizationStatus = "ACTIVE" | "INACTIVE";

export interface Organization {
  id: string;
  name: string;
  description: string;
  type: OrganizationType;
  status: OrganizationStatus;
  logo: string;
  createdAt: Date;
  updatedAt: Date;
} 


export interface OrganisationPayload {
  type: string;
  name: string;
  city: string;
  address: string;
  websiteUrl: string;
  email: string;
  phoneNumber: string;
  password: string;
  firstName: string;
  lastName: string;
  learners: LearnerPayload[];
}

import type { UserRole } from "./enum/UserRole";

export interface SummaryProfile {
    id: string;
    userName: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    avatar?: string;
    fullName?: string;
}
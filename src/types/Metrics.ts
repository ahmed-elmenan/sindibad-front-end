export type MetricsOrganisation = {
  countTotalLearners: number;
  countFemale: number;
  countMale: number;
  certificatesIssued: number;
  coursesPurchased: number;
  changes?: {
    countTotalLearners?: { value: number; percentage: string; isPositive: boolean };
    countFemale?: { value: number; percentage: string; isPositive: boolean };
    countMale?: { value: number; percentage: string; isPositive: boolean };
    certificatesIssued?: { value: number; percentage: string; isPositive: boolean };
    coursesPurchased?: { value: number; percentage: string; isPositive: boolean };
  };
};

export type CompletedLessonsMetrics = {
  lessonsCompletedList: Record<string, object>;
};

import { Button } from "@/components/ui/button";

interface QuizManagementPageProps {
  courseTitle: string;
  onBack: () => void;
}

const QuizManagementPage = ({
  courseTitle,
  onBack,
}: QuizManagementPageProps) => {
  return (
    <div className="p-6">
      <div>quiz management for course: {courseTitle}</div>
      <div className="flex justify-start">
        <Button variant="secondary" className="mt-4" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
};

export default QuizManagementPage;

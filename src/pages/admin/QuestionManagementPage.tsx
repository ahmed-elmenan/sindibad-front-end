import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  quizManagementService,
  type ExcelQuizQuestion,
  type QuizQuestionAdminResponse,
} from "@/services/quiz-management.service";
import {
  Download,
  Upload,
  Edit,
  Trash,
  Save,
  X,
  ArrowLeft,
} from "lucide-react";
import QuizForm from "@/components/admin/quiz/QuizForm";
import { useNavigate, useParams } from "react-router-dom";
import QuestionDetailsDialog from "@/components/admin/quiz/QuestionDetailsDialog";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function QuestionManagementPage() {
  usePageTitle("questionManagement");
  const { courseId } = useParams<{ courseId: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Add state variables at the component level
  const [selectedQuestion, setSelectedQuestion] =
    useState<QuizQuestionAdminResponse | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pendingQuestions, setPendingQuestions] = useState<ExcelQuizQuestion[]>(
    []
  );

  // Add courseId validation
  useEffect(() => {
    if (!courseId) {
      toast.error("Course ID is required. Please select a course first.");
      navigate("/admin/courses"); // Redirect to courses page
      return;
    }
  }, [courseId, navigate]);

  // Fetch saved questions
  const { data: savedQuestions, isLoading: isLoadingSavedQuestions } = useQuery(
    {
      queryKey: ["saved-questions", courseId],
      queryFn: () => quizManagementService.getSavedQuestions(),
      enabled: !!courseId,
    }
  );

  // Save Excel Data Mutation
  const saveQuestionsMutation = useMutation({
    mutationFn: (data: ExcelQuizQuestion[]) => {
      if (!courseId) {
        throw new Error("Course ID is required");
      }
      return quizManagementService.saveQuizQuestions(data, courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      queryClient.invalidateQueries({
        queryKey: ["saved-questions", courseId],
      });
      toast.success("Questions saved successfully");
      setPendingQuestions([]);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to save questions");
      console.error("Error saving questions:", error);
    },
  });

  const handleDownloadTemplate = async () => {
    try {
      const blob = quizManagementService.generateExcelTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "quiz-template.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Failed to download template");
    }
  };

  const handleExcelUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsedData = await quizManagementService.parseExcelFile(file);
      setPendingQuestions(parsedData);
      toast.success(`${parsedData.length} questions loaded from Excel`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to parse Excel file";
      toast.error(errorMessage);
      console.error("Excel parsing error:", error);
    }

    // Reset the input value to allow uploading the same file again
    event.target.value = "";
  };

  const handleSaveQuestions = () => {
    if (!courseId) {
      toast.error("Please select a course before saving questions.");
      return;
    }

    if (pendingQuestions.length === 0) {
      toast.warning("No questions to save. Please upload questions first.");
      return;
    }

    saveQuestionsMutation.mutate(pendingQuestions);
  };

  const handleClearPendingQuestions = () => {
    setPendingQuestions([]);
    toast.info("Pending questions cleared");
  };

  const handleRemovePendingQuestion = (index: number) => {
    setPendingQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  // Add these functions inside the QuizManagementPage component
  const handleEditQuestion = (question: QuizQuestionAdminResponse) => {
    // TODO: Implement edit functionality
    console.log("Edit question:", question);
    // You can set the question in state and open a modal for editing
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        // TODO: Implement delete functionality
        console.log("Delete question:", questionId);
        // After successful deletion, refetch the questions
        queryClient.invalidateQueries({
          queryKey: ["saved-questions", courseId],
        });
        toast.success("Question deleted successfully");
      } catch {
        toast.error("Failed to delete question");
      }
    }
  };

  // Add this with your other handler functions
  const handleQuestionClick = (question: QuizQuestionAdminResponse) => {
    setSelectedQuestion(question);
    setIsDetailsDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/admin/courses/${courseId}`)}
            className="rounded-full h-10 w-10"
            title="Retour au cours"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <h1 className="text-2xl font-bold">Quiz Management</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleDownloadTemplate}
            className="whitespace-nowrap"
          >
            <Download className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Download Template</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => document.getElementById("excel-upload")?.click()}
            className="whitespace-nowrap"
          >
            <Upload className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Upload Excel</span>
          </Button>
          <input
            id="excel-upload"
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleExcelUpload}
          />
        </div>
      </div>

      {/* Pending Questions Section (From Excel Upload) */}
      {pendingQuestions.length > 0 && (
        <Card className="mb-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <CardTitle className="text-orange-800">
                Pending Questions ({pendingQuestions.length})
                <span className="text-xs sm:text-sm font-normal text-orange-600 ml-2 block sm:inline">
                  Not saved yet
                </span>
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearPendingQuestions}
                  className="whitespace-nowrap"
                >
                  <X className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Clear All</span>
                </Button>
                <Button
                  onClick={handleSaveQuestions}
                  disabled={saveQuestionsMutation.isPending}
                  className="bg-orange-600 hover:bg-orange-700 whitespace-nowrap"
                  size="sm"
                >
                  <Save className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {saveQuestionsMutation.isPending
                      ? "Saving..."
                      : `Save ${pendingQuestions.length} Questions`}
                  </span>
                  <span className="sm:hidden">
                    {saveQuestionsMutation.isPending
                      ? "Saving..."
                      : `Save (${pendingQuestions.length})`}
                  </span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto overflow-x-auto">
              <div className="min-w-full inline-block align-middle">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Option 1
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Option 2
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Option 3
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Option 4
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Correct Options
                      </TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingQuestions.map((row, index) => (
                      <TableRow key={index} className="hover:bg-orange-100">
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell
                          className="max-w-[200px] sm:max-w-xs truncate"
                          title={row.Question}
                        >
                          {row.Question}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {row.Option1}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {row.Option2}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {row.Option3}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {row.Option4}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {row.CorrectOptions}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePendingQuestion(index)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-100"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Questions Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-green-800">
            Saved Questions ({savedQuestions?.length || 0})
            <span className="text-xs sm:text-sm font-normal text-green-600 ml-2 block sm:inline">
              Already saved
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingSavedQuestions ? (
            <div className="text-center py-8">Loading saved questions...</div>
          ) : savedQuestions && savedQuestions.length > 0 ? (
            <div className="max-h-96 overflow-y-auto overflow-x-auto">
              <div className="min-w-full inline-block align-middle">
                <Table className="min-w-[800px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Question</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Option 1
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Option 2
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Option 3
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Option 4
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Correct Option
                      </TableHead>
                      <TableHead className="w-16">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {savedQuestions.map((question, index) => (
                      <TableRow
                        key={question.id}
                        className="hover:bg-green-50 cursor-pointer"
                        onClick={() => handleQuestionClick(question)}
                      >
                        <TableCell className="font-medium">
                          {index + 1}
                        </TableCell>
                        <TableCell
                          className="max-w-[200px] sm:max-w-xs truncate"
                          title={question.question}
                        >
                          {question.question}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {question.option1}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {question.option2}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {question.option3}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {question.option4}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {question.correctOptions}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditQuestion(question);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-800"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteQuestion(question.id);
                              }}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No saved questions found. Upload an Excel file to get started.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Quiz Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Quiz</DialogTitle>
          </DialogHeader>
          <QuizForm onClose={() => setIsAddModalOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Question Details Dialog */}
      <QuestionDetailsDialog
        question={selectedQuestion}
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
        onEdit={handleEditQuestion}
        onDelete={handleDeleteQuestion}
      />
    </div>
  );
}

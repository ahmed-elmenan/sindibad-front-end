import api from "@/lib/axios";
import * as XLSX from 'xlsx';

export interface ExcelQuizQuestion {
  QuizCode: string; // Format: ch1-v1-q1
  Question: string;
  Option1: string;
  Option2: string;
  Option3: string;
  Option4: string;
  CorrectOptions: string;
  CourseId?: string;    
  ChapterName?: string; 
  VideoName?: string;   
}

// Update the export statement to include the interface
export interface QuizQuestionAdminResponse {
  id: string;
  question: string;  // Changed from Question
  option1: string;   // Changed from Option1
  option2: string;   // Changed from Option2
  option3: string;   // Changed from Option3
  option4: string;   // Changed from Option4
  correctOptions: string;
}

export interface ExcelQuizQuestion {
  QuizCode: string; // Format: ch1-v1-q1
  Question: string;
  Option1: string;
  Option2: string;
  Option3: string;
  Option4: string;
  CorrectOptions: string;
  CourseId?: string;    
  ChapterName?: string; 
  VideoName?: string;   
}

export class QuizManagementService {

  generateExcelTemplate(): Blob {
    // Create example questions with different chapter and video combinations
    const exampleQuestions = [
      {
        QuizCode: 'ch1-v1-q1',
        Question: 'What is 2+2?',
        Option1: '3',
        Option2: '4',
        Option3: '5',
        Option4: '6',
        CorrectOptions: '2',
        CourseId: 'course-123',
        ChapterName: 'Introduction to Mathematics',
        VideoName: 'Basic Arithmetic'
      },
      {
        QuizCode: 'ch1-v2-q1',
        Question: 'Example question for Chapter 1, Video 2',
        Option1: 'Option A',
        Option2: 'Option B',
        Option3: 'Option C',
        Option4: 'Option D',
        CorrectOptions: '1',
        CourseId: 'course-123',
        ChapterName: 'Introduction to Mathematics',
        VideoName: 'Advanced Arithmetic'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(exampleQuestions);

    // Update column widths
    worksheet['!cols'] = [
      { wch: 12 },   // --------->>
      { wch: 40 },   // --------->>
      { wch: 20 },   // --------->>
      { wch: 20 },   // --------->>
      { wch: 20 },   // --------->>
      { wch: 20 },   // --------->>
      { wch: 15 },   // --------->>
      { wch: 20 },   // --------->>
      { wch: 30 },   // --------->>
      { wch: 30 }    // --------->>
    ];

    // Add comments for the new fields
    worksheet['!comments'] = {
      A1: {
        t: 'Format: ch[chapter_number]-v[video_number]-q[question_number]\n' +
          'Example: ch1-v1-q1 means Chapter 1, Video 1, Question 1\n\n' +
          'Chapter Numbers: Match with your course chapters\n' +
          'Video Numbers: Match with videos in each chapter\n' +
          'Question Numbers: Sequential numbers for questions in each video'
      },
      H1: { t: 'Course ID: Unique identifier for the course' },
      I1: { t: 'Chapter Name: Descriptive name of the chapter' },
      J1: { t: 'Video Name: Descriptive name of the video' }
    };

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Quiz Questions');

    return new Blob([XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  }

  // Update the parseExcelFile function to validate QuizName format
  async parseExcelFile(file: File): Promise<ExcelQuizQuestion[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (!e.target?.result) {
            throw new Error('Failed to read file content');
          }

          const data = new Uint8Array(e.target.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          if (!workbook.SheetNames.length) {
            throw new Error('Excel file is empty or corrupted');
          }

          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData: ExcelQuizQuestion[] = XLSX.utils.sheet_to_json(worksheet);

          if (!jsonData.length) {
            throw new Error('No data found in Excel file');
          }

          // Validate required columns
          const requiredColumns = ['QuizCode', 'Question', 'Option1', 'Option2', 'Option3', 'Option4', 'CorrectOptions'];
          const missingColumns = requiredColumns.filter(col =>
            !jsonData.every(row => col in row)
          );

          if (missingColumns.length > 0) {
            throw new Error(`Missing required columns: ${missingColumns.join(', ')}`);
          }

          // Validate QuizCode format
          const isValidQuizCode = (code: string) => /^ch\d+-v\d+-q\d+$/.test(code);
          const invalidRows = jsonData.filter(row => !isValidQuizCode(row.QuizCode));

          if (invalidRows.length > 0) {
            throw new Error('Invalid QuizCode format. Please use format: ch1-v1-q1 (Chapter 1, Video 1, Question 1)');
          }

          // Validate that all required fields have values
          const emptyFields = jsonData.find(row =>
            Object.entries(row).some(([key, value]) =>
              requiredColumns.includes(key) && (!value || value.toString().trim() === '')
            )
          );

          if (emptyFields) {
            throw new Error('All fields must have values. Please check for empty cells.');
          }

          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read Excel file'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  async getSavedQuestions(): Promise<QuizQuestionAdminResponse[]> {
    try {
      const response = await api.get(`/admin/quiz-questions`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch saved questions');
    }
  }

  async saveQuizQuestions(questions: ExcelQuizQuestion[], courseId: string): Promise<void> {
    if (!courseId) {
      throw new Error('Course ID is required');
    }

    const validatedQuestions = questions.map(q => {
      const [chapter, video, question] = q.QuizCode.match(/ch(\d+)-v(\d+)-q(\d+)/)?.slice(1) || [];
      
      const correctOptionsArray = q.CorrectOptions.split(',')
        .map(opt => opt.trim())
        .filter(opt => ['1', '2', '3', '4'].includes(opt));
      
      if (correctOptionsArray.length === 0) {
        throw new Error(`Invalid correct options format for question: ${q.Question}. Use comma-separated numbers (1-4)`);
      }

      return {
        question: q.Question?.trim() || '',
        option1: q.Option1?.trim() || '',
        option2: q.Option2?.trim() || '',
        option3: q.Option3?.trim() || '',
        option4: q.Option4?.trim() || '',
        correctOptions: correctOptionsArray.join(','),
        courseId: courseId,
        chapterName: q.ChapterName?.trim() || `Chapter ${chapter}`,
        videoName: q.VideoName?.trim() || `Video ${video}`,
        chapterNumber: parseInt(chapter),
        videoNumber: parseInt(video),
        questionNumber: parseInt(question)
      };
    });

    validatedQuestions.forEach((q, index) => {
      const requiredFields = ['question', 'option1', 'option2', 'option3', 'option4', 'correctOptions', 'courseId'];
      const missingFields = requiredFields.filter(field => !q[field as keyof typeof q]);
      
      if (missingFields.length > 0) {
        throw new Error(`Question ${index + 1} is missing required fields: ${missingFields.join(', ')}`);
      }
    });

    try {
      await api.post('/admin/quizzes/questions/batch', {
        questions: validatedQuestions
      });
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error('Invalid question format. Please check all required fields and formats.');
      }
      throw error;
    }
  }


}

// Add this at the end of the file
export const quizManagementService = new QuizManagementService();
export default quizManagementService;
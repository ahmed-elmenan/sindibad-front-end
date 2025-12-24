import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { quizManagementService } from '@/services/quiz-management.service';

const quizFormSchema = z.object({
  name: z.string()
    .min(1, 'Quiz name is required')
    .regex(/^ch\d+-v\d+-qu\d+$/, 'Quiz name must follow the format: ch1-v1-qu1'),
  chapterId: z.string().min(1, 'Chapter is required'),
  lessonId: z.string().min(1, 'Lesson is required'),
});

type QuizFormValues = z.infer<typeof quizFormSchema>;

interface QuizFormProps {
  onClose: () => void;
  initialData?: QuizFormValues;
}

export default function QuizForm({ onClose, initialData }: QuizFormProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
    defaultValues: initialData || {
      name: '',
      chapterId: '',
      lessonId: '',
    },
  });

  const createQuizMutation = useMutation({
    mutationFn: (data: QuizFormValues) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      return quizManagementService.createQuiz(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast.success('Quiz created successfully');
      onClose();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to create quiz');
    },
  });

  const onSubmit = (data: QuizFormValues) => {
    createQuizMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quiz Name</FormLabel>
              <FormControl>
                <Input placeholder="ch1-v1-qu1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="chapterId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chapter</FormLabel>
              <FormControl>
                <Input placeholder="Select chapter" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lessonId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lesson</FormLabel>
              <FormControl>
                <Input placeholder="Select lesson" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createQuizMutation.isPending}>
            {createQuizMutation.isPending ? 'Creating...' : 'Create Quiz'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
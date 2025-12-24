import { useState, useEffect } from 'react';
import { getCourseById, updateCourse } from '@/services/course.service';
import { getCategories } from '@/services/course.service';
import type { Course } from '@/types/Course';

interface EditCourseFormProps {
  courseId: string;
  onSuccess?: () => void;
}

export function EditCourseForm({ courseId, onSuccess }: EditCourseFormProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const levels = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseData, categoriesData] = await Promise.all([
          getCourseById(courseId),
          getCategories()
        ]);
        setCourse(courseData);
        setCategories(categoriesData);
      } catch (err) {
        setError('Failed to fetch course data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!course) return;

    try {
      const formData = new FormData(e.currentTarget);
      const updatedCourseData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        price: formData.get('price') as string,
        duration: parseInt(formData.get('duration') as string),
        category: formData.get('category') as string,
        level: formData.get('level') as string,
        imgUrl: formData.get('imgUrl') as string || undefined
      };

      await updateCourse(courseId, updatedCourseData);
      onSuccess?.();
    } catch (err) {
      setError('Failed to update course');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          defaultValue={course.title}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          defaultValue={course.description}
          required
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Price
        </label>
        <input
          type="number"
          name="price"
          id="price"
          defaultValue={course.price}
          required
          min="0"
          step="0.01"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
          Duration (minutes)
        </label>
        <input
          type="number"
          name="duration"
          id="duration"
          defaultValue={course.duration}
          required
          min="1"
          step="1"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          name="category"
          id="category"
          defaultValue={course.category}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="level" className="block text-sm font-medium text-gray-700">
          Level
        </label>
        <select
          name="level"
          id="level"
          defaultValue={course.level}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {levels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="imgUrl" className="block text-sm font-medium text-gray-700">
          Image URL
        </label>
        <input
          type="url"
          name="imgUrl"
          id="imgUrl"
          defaultValue={course.imgUrl}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Update Course
        </button>
      </div>
    </form>
  );
}
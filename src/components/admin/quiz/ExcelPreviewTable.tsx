import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ExcelQuizQuestion } from '@/services/quiz-management.service';

interface ExcelPreviewTableProps {
  data: ExcelQuizQuestion[];
  onClose: () => void;
}

export default function ExcelPreviewTable({ data, onClose }: ExcelPreviewTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview Excel Data</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Question</TableHead>
              <TableHead>Option 1</TableHead>
              <TableHead>Option 2</TableHead>
              <TableHead>Option 3</TableHead>
              <TableHead>Option 4</TableHead>
              <TableHead>Correct Options</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.Question}</TableCell>
                <TableCell>{row.Option1}</TableCell>
                <TableCell>{row.Option2}</TableCell>
                <TableCell>{row.Option3}</TableCell>
                <TableCell>{row.Option4}</TableCell>
                <TableCell>{row.CorrectOptions}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button>
            Save Questions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
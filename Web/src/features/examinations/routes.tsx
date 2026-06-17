import { Navigate, Route, Routes } from 'react-router-dom';
import { ExamsListPage } from './ExamsListPage';
import { ExamFormPage } from './ExamFormPage';
import { ExamDetailPage } from './ExamDetailPage';
import { MyExaminationsPage } from './MyExaminationsPage';
import './examinations.css';

/** Staff examinations: term list, create/edit exam, datesheet + results + admit cards. */
export default function ExaminationsRoutes() {
  return (
    <Routes>
      <Route index element={<ExamsListPage />} />
      <Route path="new" element={<ExamFormPage />} />
      <Route path=":id/edit" element={<ExamFormPage />} />
      <Route path=":id" element={<ExamDetailPage />} />
      <Route path="*" element={<Navigate to="/examinations" replace />} />
    </Routes>
  );
}

/** Parent/student read-only examinations: datesheet + published results / report card. */
export function MyExaminationsRoutes() {
  return (
    <Routes>
      <Route index element={<MyExaminationsPage />} />
      <Route path="*" element={<Navigate to="/examinations" replace />} />
    </Routes>
  );
}

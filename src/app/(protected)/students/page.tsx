'use client';

import { BreadcrumbUpdater } from '@/contexts/breadcrumb';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { api } from '@/trpc/react';
import { StudentCard } from '@/components/studentCard/studentCard.component';
import { LoadingContent } from '@/components/LoadingContent';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { SheetCreateStudent } from '@/components/modals/createStudent/sheetCreateStudent.component';

const breadcrumbItems = [
  {
    label: 'Home',
    href: '/dashboard',
  },
  {
    label: 'Alunos',
    href: '/students',
  },
];

export default function StudentsPage() {
  const [showSheet, setShowSheet] = useState(false);
  const studentsApi = api.student.getAll.useQuery({ page: 1, limit: 10 });
  const deleteStudentApi = api.student.delete.useMutation({
    onSuccess: () => {
      studentsApi.refetch();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao deletar aluno',
        description: error.message,
      });
    },
  });

  const { data: studentsData } = studentsApi;

  if (studentsApi.isLoading) {
    return <LoadingContent textLoading="Carregando alunos..." />;
  }

  const handleDeleteStudent = async (studentId: string) => {
    await deleteStudentApi.mutate({ id: studentId });
    toast({
      title: 'Sucesso',
      description: 'Aluno deletado com sucesso',
    });
  };

  return (
    <div className="w-full">
      <BreadcrumbUpdater items={breadcrumbItems} />

      <main className="flex flex-col gap-6 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Alunos</h1>
          <Button onClick={() => setShowSheet(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Aluno
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          {studentsData?.data.map((student) => (
            <StudentCard
              key={student.id}
              name={student.name}
              avatar={student?.avatar || ''}
              email={student.email}
              onClick={() => handleDeleteStudent(student.id)}
            />
          ))}
        </div>

        {showSheet && (
          <SheetCreateStudent
            side="right"
            isOpen={showSheet}
            setIsOpen={setShowSheet}
            refetch={studentsApi.refetch}
          />
        )}
      </main>
    </div>
  );
}

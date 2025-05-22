'use client';

import { useState, useEffect } from 'react';
import { BreadcrumbUpdater } from '@/contexts/breadcrumb';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { api } from '@/trpc/react';
import { StudentCard } from '@/components/studentCard/studentCard.component';
import { LoadingContent } from '@/components/LoadingContent';
import { toast } from '@/hooks/use-toast';
import { SheetCreateStudent } from '@/components/modals/student/createStudent/sheetCreateStudent.component';
import { SheetEditStudent } from '@/components/modals/student/EditStudent/sheetEditStudent.component';
import Search from '@/components/Search';
import { AppPagination } from '@/components/appPagination/appPagination.component';
import { useDebounce } from '@/hooks/useDebounce/useDebounce';
import { AdvancedFilterDatePicker } from '@/components/forms/advancedFilterDatePicker/advancedFilterDatePicker.component';
import { Calendar } from 'lucide-react';
import { AdvancedFilterCheckbox } from '@/components/forms/advancedFilterCheckbox/advancedFilterCheckbox.component';
import { AdvancedFilterCheckboxType } from '@/components/forms/advancedFilterCheckbox/advancedFilterCheckbox.types';

const breadcrumbItems = [
  { label: 'Home', href: '/dashboard' },
  { label: 'Alunos', href: '/students' },
];

const STATUS_OPTIONS: Array<AdvancedFilterCheckboxType> = [
  { id: 'EM DIA', label: 'Em Dia' },
  { id: 'PENDENTE', label: 'Pendente' },
  { id: 'ATRASADO', label: 'Atrasado' },
];

export default function StudentsPage() {
  // Estados
  const [showSheet, setShowSheet] = useState(false);
  const [showSheetEdit, setShowSheetEdit] = useState(false);
  const [dataStudentSelectedID, setDataStudentSelectedID] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [selectedStatuses, setSelectedStatuses] = useState<
    Array<'EM DIA' | 'PENDENTE' | 'ATRASADO'>
  >([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const studentsApi = api.student.getAll.useQuery(
    {
      page,
      limit,
      search: debouncedSearch || undefined,
      status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      from: dateFrom || undefined,
      to: dateTo || undefined,
    },
    { staleTime: 5000 },
  );

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

  const { data: studentsData, isLoading } = studentsApi;

  // Sempre volta à página 1 quando muda filtros
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedStatuses, dateFrom, dateTo, limit]);

  // Handlers
  const handleDeleteStudent = async (studentId: string) => {
    await deleteStudentApi.mutateAsync({ id: studentId });
    toast({
      title: 'Sucesso',
      description: 'Aluno deletado com sucesso',
    });
  };

  const handleEditStudent = (studentId: string) => {
    setDataStudentSelectedID(studentId);
    setShowSheetEdit(true);
  };

  return (
    <div className="w-full pb-[100px]">
      <BreadcrumbUpdater items={breadcrumbItems} />

      <main className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold">Alunos</h1>

        <div className="mt-4 flex items-center md:justify-between">
          <Search
            className="mr-4 w-1/2"
            placeholder="Buscar alunos..."
            onSearch={setSearchTerm}
          />

          <Button onClick={() => setShowSheet(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Adicionar Aluno
          </Button>
        </div>

        <h1 className="mt-4 text-lg font-semibold">Filtros</h1>

        <div className="flex flex-wrap gap-2">
          <AdvancedFilterDatePicker
            title="Buscar datas"
            onChange={({ from, to }) => {
              setDateFrom(from ? from.toISOString() : '');
              setDateTo(to ? to.toISOString() : '');
            }}
            description="Data de criação dos alunos"
            numberOfMonths={1}
            showDeleteButton={false}
            rightIcon={<Calendar />}
          />

          <AdvancedFilterCheckbox
            title="Status"
            description="Filtrar por status"
            options={STATUS_OPTIONS}
            defaultValue={selectedStatuses.map((status) => ({
              id: status,
              label:
                STATUS_OPTIONS.find((o) => o.id === status)?.label || status,
            }))}
            onDelete={() => setSelectedStatuses([])}
            onChange={(next) => {
              setSelectedStatuses(
                next.map(
                  (item) => item.id as 'EM DIA' | 'PENDENTE' | 'ATRASADO',
                ),
              );
            }}
            showCounterIndicator
            showDeleteButton={false}
          />
        </div>

        {isLoading ? (
          <LoadingContent textLoading="Carregando alunos..." />
        ) : (
          <>
            <div className="mt-4 flex flex-col gap-4">
              {studentsData?.data.map((student) => (
                <StudentCard
                  key={student.id}
                  name={student.name}
                  avatar={student?.avatar || ''}
                  email={student.email}
                  status={student.status}
                  planName={student.planName}
                  createdAt={student.createdAt}
                  onDelete={() => handleDeleteStudent(student.id)}
                  onEdit={() => handleEditStudent(student.id)}
                />
              ))}
            </div>

            <div className="mt-6 w-full">
              <AppPagination
                totalItems={studentsData?.pagination.total ?? 0}
                itemsPerPage={limit}
                currentPage={page}
                onPageChange={setPage}
                onItemsPerPageChange={setLimit}
              />
            </div>
          </>
        )}

        {showSheetEdit && (
          <SheetEditStudent
            side="right"
            isOpen={showSheetEdit}
            setIsOpen={setShowSheetEdit}
            refetch={studentsApi.refetch}
            studentId={dataStudentSelectedID}
          />
        )}

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

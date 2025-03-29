"use client";

import { Suspense } from "react";
import { BreadcrumbUpdater } from "@/contexts/breadcrumb";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { api } from "@/trpc/react";
import { StudentCard } from "@/components/studentCard/studentCard.component";

const breadcrumbItems = [
  {
    label: "Home",
    href: "/dashboard",
  },
  {
    label: "Alunos",
    href: "/students",
  },
];

export default function StudentsPage() {
  const studentsApi = api.student.getAll.useQuery({ page: 1, limit: 10 });
  const { data: studentsData } = studentsApi;

  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <div className="w-full">
        <BreadcrumbUpdater items={breadcrumbItems} />

        <main className="flex flex-col gap-6 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Alunos</h1>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Aluno
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {studentsData?.data.map((student) => (
              <StudentCard
                key={student.id}
                name={student.name}
                avatar={student?.avatar!}
                email={student.email}
              />
            ))}
          </div>
        </main>
      </div>
    </Suspense>
  );
}

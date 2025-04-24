'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { FormInputComponent } from '@/components/forms/formInput/formInput.component';
import {
  maskCellphone,
  maskDate,
  maskOnlyText,
  unmaskCellphone,
} from '@/utils/masksUtils';
import { Separator } from '@/components/ui/separator';
import { api } from '@/trpc/react';
import {
  IUpdateStudentTypes,
  updateStudentSchema,
} from '@/server/validations/students';
import { FormFileInputComponent } from '@/components/forms/formFileInput/formFileInput.component';
import { blobUrlToBase64 } from '@/common/utils/files';
import { ISheetEditStudent } from './sheetEditStudent.types';

export const SheetEditStudent: React.FC<ISheetEditStudent> = ({
  side,
  isOpen,
  setIsOpen,
  studentId,
  refetch,
}) => {
  const { toast } = useToast();
  const studentEdit = api.student.getByID.useQuery({
    id: studentId,
  });
  const updateStudent = api.student.updateByID.useMutation();
  const updateUser = api.student.updateAvatar.useMutation();
  const { mutateAsync: uploadFile } = api.files.upload.useMutation();
  const userData = studentEdit.data?.data;

  const form = useForm<IUpdateStudentTypes>({
    resolver: zodResolver(updateStudentSchema),
    defaultValues: {
      id: userData?.id ?? '',
      name: userData?.name ?? '',
      email: userData?.email ?? '',
      phone: userData?.phone ?? '',
      avatarUrl: userData?.avatar ?? '',
      birthDate: userData?.birthDate
        ? userData.birthDate.toISOString()
        : undefined,
    },
    mode: 'onChange',
  });

  const onSubmit = async (data: IUpdateStudentTypes) => {
    try {
      const userEdited = await updateStudent.mutateAsync(data);

      // Update avatar if changed
      if (data.avatarUrl !== userData?.avatar) {
        let avatarRealUrl = '';

        if (data.avatarUrl) {
          const base64 = await blobUrlToBase64(data.avatarUrl);
          const safeFilename = `avatar_${userEdited.data.id}`;

          const result = await uploadFile({
            filename: safeFilename,
            file: base64,
          });

          if (!result?.url) throw new Error('Falha no upload do avatar');

          avatarRealUrl = result.url;

          await updateUser.mutateAsync({
            avatarUrl: avatarRealUrl,
            studentId: userEdited.data.id,
          });
        }
      }

      setIsOpen(false);
      if (refetch) refetch();

      toast({
        title: 'Sucesso',
        description: 'Dados atualizados com sucesso',
        variant: 'default',
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Ocorreu um erro inesperado';
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error(error);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side={side}
        className="min-w-[40vw] items-center overflow-auto xl:min-w-[30vw]"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <SheetHeader className="mx-2 mb-12 flex">
              <div className="mb-8 flex flex-col">
                <SheetTitle className="text-2xl">Editar Aluno</SheetTitle>
                <SheetDescription className="mt-4 text-sm">
                  Faça as alterações necessárias para o aluno selecionado abaixo
                </SheetDescription>
              </div>

              <div className="flex w-full justify-center">
                <FormFileInputComponent
                  control={form.control}
                  name="avatarUrl"
                  label="Imagem do aluno"
                  type="file"
                  accept=".jpg, .jpeg, .png"
                />
              </div>
            </SheetHeader>

            <Separator />

            <div className="mx-2 mb-12 mt-8 grid grid-cols-4 items-center gap-8">
              <div className="col-span-4">
                <FormInputComponent
                  control={form.control}
                  name="name"
                  label="Nome do aluno"
                  type="text"
                  mask={maskOnlyText}
                  placeholder="Nome completo"
                  maxLength={50}
                />
              </div>
              <div className="col-span-4">
                <FormInputComponent
                  control={form.control}
                  name="email"
                  label="Email do aluno"
                  type="email"
                  placeholder="exemplo@exemplo.com"
                  maxLength={50}
                />
              </div>
              <div className="col-span-2">
                <FormInputComponent
                  control={form.control}
                  name="birthDate"
                  label="Data de nascimento"
                  type="text"
                  mask={maskDate}
                  placeholder="DD/MM/AAAA"
                  maxLength={20}
                />
              </div>
              <div className="col-span-2">
                <FormInputComponent
                  control={form.control}
                  name="phone"
                  label="Telefone"
                  mask={maskCellphone}
                  unmask={unmaskCellphone}
                  placeholder="(XX) XXXXX-XXXX"
                  maxLength={20}
                />
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <Button
                type="submit"
                disabled={
                  updateStudent.isPending || form.formState.isSubmitting
                }
              >
                {updateStudent.isPending ? 'Editando aluno...' : 'Editar aluno'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

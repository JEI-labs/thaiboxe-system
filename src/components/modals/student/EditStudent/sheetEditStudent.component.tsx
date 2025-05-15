'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { FormInputComponent } from '@/components/forms/formInput/formInput.component';
import { FormFileInputComponent } from '@/components/forms/formFileInput/formFileInput.component';
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
import { blobUrlToBase64 } from '@/common/utils/files';
import { ISheetEditStudent } from './sheetEditStudent.types';
import { CameraCaptureButton } from '@/components/camera/camera.component';

export const SheetEditStudent: React.FC<ISheetEditStudent> = ({
  side,
  isOpen,
  setIsOpen,
  studentId,
  refetch,
}) => {
  const { toast } = useToast();
  const studentEdit = api.student.getByID.useQuery({ id: studentId });
  const updateStudent = api.student.updateByID.useMutation();
  const updateUserAvatar = api.student.updateAvatar.useMutation();
  const { mutateAsync: uploadFile } = api.files.upload.useMutation();

  const form = useForm<IUpdateStudentTypes>({
    resolver: zodResolver(updateStudentSchema),
    defaultValues: {
      id: '',
      name: '',
      email: '',
      phone: '',
      avatarUrl: '',
      birthDate: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    const user = studentEdit.data?.data;
    if (user) {
      form.reset({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatar ?? '',
        birthDate: user.birthDate
          ? maskDate(new Date(user.birthDate).toLocaleDateString('pt-BR'))
          : '',
      });
    }
  }, [studentEdit.data, form]);

  const onSubmit = async (data: IUpdateStudentTypes) => {
    try {
      const updated = await updateStudent.mutateAsync(data);

      if (data.avatarUrl && data.avatarUrl !== studentEdit.data?.data.avatar) {
        const base64 = await blobUrlToBase64(data.avatarUrl);
        const safeFilename = `avatar_${updated.data.id}`;
        const uploadResult = await uploadFile({
          filename: safeFilename,
          file: base64,
        });
        if (!uploadResult.url) throw new Error('Falha no upload do avatar');

        await updateUserAvatar.mutateAsync({
          avatarUrl: uploadResult.url,
          studentId: updated.data.id,
        });
      }

      setIsOpen(false);
      refetch?.();

      toast({
        title: 'Sucesso',
        description: 'Dados atualizados com sucesso',
        variant: 'default',
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Ocorreu um erro inesperado';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
      console.error(err);
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
            <SheetHeader className="mx-2 mb-8 flex flex-col items-center">
              <SheetTitle className="text-2xl">Editar Aluno</SheetTitle>
              <SheetDescription className="mt-2 text-center text-sm">
                Faça as alterações necessárias para o aluno selecionado abaixo
              </SheetDescription>

              <div className="flex w-full flex-col items-center justify-center gap-2">
                <FormFileInputComponent
                  control={form.control}
                  name="avatarUrl"
                  label="Imagem do aluno"
                  type="file"
                  accept=".jpg, .jpeg, .png"
                  showPreview
                />

                <CameraCaptureButton
                  onCapture={(blobUrl) => {
                    form.setValue('avatarUrl', blobUrl, {
                      shouldValidate: true,
                    });
                  }}
                />
              </div>
            </SheetHeader>

            <Separator />

            <div className="mx-2 my-8 grid grid-cols-4 gap-6">
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
                  maxLength={10}
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
                  maxLength={15}
                />
              </div>
            </div>

            <div className="mb-4 flex justify-end">
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

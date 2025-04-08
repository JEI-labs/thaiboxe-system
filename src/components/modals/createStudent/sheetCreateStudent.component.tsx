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
import { SheetCreateStudentProps } from './sheetCreateStudent.types';
import {
  createStudentSchema,
  defaultCreateStudentValues,
  IStudentCreateTypes,
} from '@/server/validations/students';
import { FormFileInputComponent } from '@/components/forms/formFileInput/formFileInput.component';
import { blobUrlToBase64 } from '@/common/utils/files';

export const SheetCreateStudent: React.FC<SheetCreateStudentProps> = ({
  side,
  isOpen,
  setIsOpen,
  refetch,
}) => {
  const { toast } = useToast();

  const createUser = api.student.create.useMutation();
  const updateUser = api.student.updateAvatar.useMutation();
  const { mutateAsync: uploadFile } = api.files.upload.useMutation();

  const form = useForm<IStudentCreateTypes>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: defaultCreateStudentValues,
    mode: 'onChange',
  });

  const onSubmit = async (data: IStudentCreateTypes) => {
    try {
      const userCreated = await createUser.mutateAsync(data);

      let avatarRealUrl = '';
      if (data.avatarUrl) {
        const base64 = await blobUrlToBase64(data.avatarUrl);

        const result = await uploadFile({
          filename: `avatar_${data.name}`,
          file: base64,
        });

        avatarRealUrl = result.url;
      }

      await updateUser.mutateAsync({
        avatarUrl: avatarRealUrl,
        studentId: userCreated.data.id,
      });

      setIsOpen(false);
      if (refetch) refetch();

      toast({
        title: 'Sucesso',
        description: 'Dados atualizados com sucesso',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao atualizar os dados',
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
                <SheetTitle className="text-2xl">Criar Novo Aluno</SheetTitle>
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
                />
              </div>
              <div className="col-span-4">
                <FormInputComponent
                  control={form.control}
                  name="email"
                  label="Email do aluno"
                  type="email"
                  placeholder="exemplo@exemplo.com"
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
                disabled={createUser.isPending || form.formState.isSubmitting}
              >
                {createUser.isPending ? 'Criando aluno...' : 'Criar aluno'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

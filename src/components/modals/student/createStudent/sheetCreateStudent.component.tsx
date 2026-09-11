'use client';

import { FormDrawer } from '@/components/formDrawer/formDrawer.component';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
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
import { blobUrlToBase64 } from '@/common/utils/files';
import { AvatarField } from '@/components/forms/avatarField/avatarField.component';
import { FormSelectComponent } from '@/components/forms/formSelectInput/formSelectInput.component';
import { getInitials } from '@/utils/masksUtils';

export const SheetCreateStudent: React.FC<SheetCreateStudentProps> = ({
  side,
  isOpen,
  setIsOpen,
  refetch,
}) => {
  const { toast } = useToast();

  const plansApi = api.plans.getAll.useQuery({ page: 1, limit: 100 });
  const { data: plansData } = plansApi;

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

      form.reset(defaultCreateStudentValues);
      setIsOpen(false);
      if (refetch) refetch();

      toast({
        title: 'Aluno criado',
        description: 'O aluno foi matriculado com sucesso.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar o aluno.',
        variant: 'destructive',
      });
      console.error(error);
    }
  };

  // useWatch e não form.watch: este é analisável pelo React Compiler
  const watchedName = useWatch({ control: form.control, name: 'name' });
  const isSubmitting = createUser.isPending || form.formState.isSubmitting;

  return (
    <Form {...form}>
      <FormDrawer
        open={isOpen}
        onOpenChange={setIsOpen}
        side={side}
        title="Criar novo aluno"
        description="Preencha os dados abaixo para matricular um aluno."
        onSubmit={form.handleSubmit(onSubmit)}
        submitLabel="Criar aluno"
        submitPendingLabel="Criando aluno..."
        isSubmitting={isSubmitting}
      >
        <AvatarField
          control={form.control}
          name="avatarUrl"
          fallback={watchedName ? getInitials(watchedName) : undefined}
        />

        <Separator />

        <section className="space-y-4">
          <h3 className="text-muted-foreground text-xs font-medium uppercase">
            Dados pessoais
          </h3>

          <FormInputComponent
            control={form.control}
            name="name"
            label="Nome do aluno"
            type="text"
            mask={maskOnlyText}
            placeholder="Nome completo"
            maxLength={50}
          />

          <FormInputComponent
            control={form.control}
            name="email"
            label="E-mail"
            type="email"
            placeholder="exemplo@exemplo.com"
            maxLength={50}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormInputComponent
              control={form.control}
              name="birthDate"
              label="Data de nascimento"
              type="text"
              mask={maskDate}
              placeholder="DD/MM/AAAA"
              maxLength={10}
            />

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
        </section>

        <Separator />

        <section className="space-y-4">
          <h3 className="text-muted-foreground text-xs font-medium uppercase">
            Matrícula
          </h3>

          <FormSelectComponent
            control={form.control}
            name="planId"
            label="Plano"
            tooltip="Define o valor e a duração da matrícula, e gera as parcelas do aluno."
            placeholder="Selecione o plano"
            options={
              plansData?.data.map((plan) => ({
                value: plan.id,
                // preço e duração no rótulo para dar contexto na hora
                // de escolher; precisa ser string (o Radix usa
                // textValue para busca por digitação)
                textValue: `${plan.name} · ${Number(plan.price).toLocaleString(
                  'pt-BR',
                  {
                    style: 'currency',
                    currency: 'BRL',
                  },
                )} · ${plan.duration} ${plan.duration === 1 ? 'mês' : 'meses'}`,
              })) ?? []
            }
          />
        </section>
      </FormDrawer>
    </Form>
  );
};

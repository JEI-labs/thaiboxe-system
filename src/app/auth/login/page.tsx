'use client';

import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  Mail,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { Form } from '@/components/ui/form';
import { FormInputComponent } from '@/components/forms/formInput/formInput.component';
import { AuthLayout } from '@/components/layout/AuthLayout';

export default function LoginPage(): JSX.Element {
  const [seePass, setSeePass] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const PasswordIcon = seePass ? EyeOff : Eye;

  const formSchema = z.object({
    username: z
      .string()
      .email('Por favor, insira um endereço de e-mail válido.'),
    password: z
      .string()
      .min(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
      .max(20, { message: 'A senha pode ter no máximo 20 caracteres.' }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setDisabled(true);
    const result = await signIn('credentials', { ...data, redirect: false });
    if (result && result.status === 401) {
      setErrorMessage('E-mail ou senha incorreto.');
    } else if (result && result.status === 200) {
      window.location.href = '/dashboard';
      setErrorMessage('');
      form.reset();
    } else {
      setErrorMessage('Houve um erro inexperado, tente novamente mais tarde.');
    }
    setDisabled(false);
  }

  return (
    <AuthLayout>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid w-full gap-6 pb-6">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Bem vindo a Thai-Boxe Manager
              </h1>
              <p className="text-sm text-muted-foreground">Team Sartorato</p>
            </div>
            <div className="grid gap-4">
              <FormInputComponent
                control={form.control}
                label="E-mail"
                name="username"
                type="text"
                placeholder="Digite seu e-mail"
                maxLength={100}
                required
                className="py-6 pl-11"
                disabled={disabled}
                icon={
                  <Mail
                    size={18}
                    className="pointer-events-none absolute left-4 top-4 flex items-center text-muted-foreground"
                  />
                }
              />
              <FormInputComponent
                control={form.control}
                name="password"
                label="Senha"
                type={seePass ? 'text' : 'password'}
                placeholder="Digite sua senha"
                required
                disabled={disabled}
                className="py-6 pl-11"
                icon={
                  <PasswordIcon
                    size={18}
                    className="absolute left-4 top-4 flex cursor-pointer items-center text-muted-foreground"
                    onClick={() => setSeePass(!seePass)}
                  />
                }
              />
              <Link
                href="/auth/forgotpassword"
                className="text-xs text-primary hover:underline"
              >
                Esqueceu sua senha?
              </Link>
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Não foi possivel fazer login</AlertTitle>
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
            </div>

            <Button
              className="w-full bg-primary py-6 font-medium"
              type="submit"
              disabled={disabled}
            >
              {disabled && <LoaderCircle className="mr-1 h-5 animate-spin" />}
              Entrar
              <ArrowRight size={18} className="ml-1" />
            </Button>
          </div>
        </form>
      </Form>
    </AuthLayout>
  );
}

import { cn } from '@/lib/utils';
import { Upload } from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import type {
  ControllerRenderProps,
  FieldValues,
  Path,
  UseControllerProps,
} from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { FormInputFileComponentProps } from './formFIleInput.types';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const FormFileInputComponent = <T extends FieldValues>({
  control,
  name,
  description,
  rules,
  hideErrors,
  accept = '*',
  ...props
}: UseControllerProps<T> & FormInputFileComponentProps): React.JSX.Element => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Função para remover o arquivo
  const handleRemoveFile = (
    field: ControllerRenderProps<T, Path<T> & (string | undefined)>,
  ) => {
    setFileName(null);
    setImagePreview(null);
    field.onChange(null);
  };

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field }): React.JSX.Element => {
        return (
          <FormField
            control={control}
            name={name}
            render={() => (
              <FormItem className={cn(props.generalclassname)}>
                <div className="grid gap-2 text-muted-foreground">
                  <FormLabel className="grid gap-1 text-muted-foreground">
                    <div className="flex items-center">
                      <p className="text-sm md:text-base">{props.label}</p>
                      {props.required && (
                        <span className="ml-1 text-red-400">*</span>
                      )}
                    </div>
                    <div
                      className={cn(
                        'flex w-full flex-col items-center gap-4 overflow-auto whitespace-normal break-words rounded-md border p-2 sm:flex-row sm:p-4',
                        props.cardClassname,
                      )}
                    >
                      {/* Exibir preview da imagem se disponível */}
                      {props.showPreview && imagePreview && (
                        <Image
                          src={imagePreview}
                          alt="Preview do arquivo"
                          width={80}
                          height={80}
                          className="h-20 w-20 rounded-md object-cover sm:h-24 sm:w-24"
                        />
                      )}
                      <label
                        className={cn(
                          buttonVariants({ variant: 'default' }),
                          'w-lg cursor-pointer gap-2 text-center sm:w-auto',
                        )}
                      >
                        <Upload className="h-4 w-4" /> Escolher Arquivo
                        <Input
                          className="hidden"
                          type="file"
                          accept={accept}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const fileURL = URL.createObjectURL(file);
                              setFileName(file.name);
                              field.onChange(fileURL); // Define apenas a string da URL
                              setImagePreview(fileURL);
                            }
                          }}
                        />
                      </label>
                      {description && description}

                      {/* Exibir nome do arquivo e botão de remover */}
                      {fileName && (
                        <div className="flex w-full max-w-full items-center">
                          <p
                            className="w-full max-w-full overflow-hidden whitespace-normal break-words text-center text-sm sm:text-left sm:text-base"
                            title={fileName}
                          >
                            {`Anexado: ${fileName}`}
                          </p>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(field)}
                            className="ml-2 flex text-destructive hover:text-destructive/70"
                          >
                            Remover anexo
                          </button>
                        </div>
                      )}
                    </div>
                  </FormLabel>
                  <FormControl />
                  <div className="flex flex-col justify-between sm:flex-row">
                    {!hideErrors && <FormMessage />}
                    <FormDescription className="mt-1 text-right text-muted-foreground/50 sm:mt-0">
                      * arquivos aceitos: {accept}
                    </FormDescription>
                  </div>
                </div>
              </FormItem>
            )}
          />
        );
      }}
    />
  );
};

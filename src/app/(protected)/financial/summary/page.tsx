'use client';

import { Suspense } from 'react';
// import { api } from '@/trpc/react';
// import { toBase64 } from '@/common/utils/files';
import { BreadcrumbUpdater } from '@/contexts/breadcrumb';

const breadcrumbItems = [
  {
    label: 'Home',
    href: '/dashboard',
  },
  {
    label: 'Dashboard',
    href: '/dashboard',
  },
];

export default function DashboardPage() {
  // const fileInputRef = useRef<HTMLInputElement>(null);
  // const { mutateAsync: uploadFile, isPending } = api.files.upload.useMutation();

  // const handleUpload = async (file: File) => {
  //   const base64 = await toBase64(file);

  //   const result = await uploadFile({
  //     filename: file.name,
  //     file: base64,
  //   });

  //   console.log('URL pública:', result.url);
  // };

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file) {
  //     handleUpload(file);
  //   }
  // };

  // const triggerFileInput = () => {
  //   fileInputRef.current?.click();
  // };

  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <div className="w-full">
        <BreadcrumbUpdater items={breadcrumbItems} />

        <main className="flex flex-col gap-8">
          <div>Dashboard</div>
        </main>

        {/* <div>
          <button
            className="rounded bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
            onClick={triggerFileInput}
            disabled={isPending}
          >
            {isPending ? 'Enviando...' : 'Upload de Imagem'}
          </button>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div> */}
      </div>
    </Suspense>
  );
}

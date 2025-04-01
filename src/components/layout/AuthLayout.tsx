import Image from 'next/image';
import { ScrollArea } from '../ui/scroll-area';

export function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>): JSX.Element {
  return (
    <div className="grid h-screen w-screen lg:grid-cols-2">
      <div className="hidden h-screen w-full overflow-hidden bg-muted lg:block">
        <Image
          src="/images/thaiboxe.jpg"
          alt="Image"
          width="1920"
          height="1080"
          className="bg-muted-background h-full w-full object-cover"
        />
      </div>
      <ScrollArea>
        <div className="flex min-h-screen w-full items-center">
          <div className="mx-auto flex h-fit min-w-[40%] max-w-[70%] flex-col gap-8 py-4">
            <div className="-mb-[30px] flex items-center justify-center">
              <Image
                src="/images/logo.png"
                width={350}
                height={350}
                alt="Logo"
              />
            </div>
            {children}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

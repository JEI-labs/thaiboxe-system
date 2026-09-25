import { SectionTabs } from '@/components/sectionTabs/sectionTabs.component';

/* LayoutProps é helper global do Next 16, gerado no dev/build — sem import. */
export default function FinancialLayout({
  children,
}: LayoutProps<'/financeiro'>) {
  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Financeiro</h1>
        <p className="text-muted-foreground text-sm">
          O dinheiro da academia: o que entrou, o que saiu e o que sobrou.
        </p>
      </div>

      <SectionTabs section="financial" />

      {children}
    </div>
  );
}

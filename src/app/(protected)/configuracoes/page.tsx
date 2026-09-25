import { redirect } from 'next/navigation';

/** As configurações de WhatsApp viraram seção própria. */
export default function SettingsPage() {
  redirect('/whatsapp/conexao');
}

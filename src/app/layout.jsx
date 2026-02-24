import "@/styles/globals.css";
import { AuthProvider } from "@/hooks/useAuth";

export const metadata = {
  title: "SGA — Sistema de Gestão de Atividades",
  description: "Organize tarefas, finanças e hábitos em um só lugar.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

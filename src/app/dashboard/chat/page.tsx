import PageContainer from "@/components/layout/page-container";
import ChatPage from "@/features/chat/components/chat-page";

export const metadata = {
  title: "Dashboard: AI Chat",
};

export default function Page() {
  return (
    <PageContainer scrollable={false}>
      <ChatPage />
    </PageContainer>
  );
}

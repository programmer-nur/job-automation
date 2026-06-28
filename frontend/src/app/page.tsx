import { AppText, AppButton } from "@/components/shared";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <main className="flex flex-col items-center gap-6 py-32 px-4">
        <AppText variant="h1">Job Application Manager</AppText>
        <AppText variant="body" color="muted" className="max-w-md text-center">
          AI-powered platform to discover, evaluate, and manage job applications.
        </AppText>
        <div className="flex items-center gap-3">
          <AppButton variant="primary" size="lg">
            Get Started
          </AppButton>
          <AppButton variant="outline" size="lg">
            Learn More
          </AppButton>
        </div>
      </main>
    </div>
  );
}

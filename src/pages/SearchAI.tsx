import TestAI from "./TestAI";

// Wrapper to render TestAI within the dashboard layout
// TestAI already has its own full UI, we just need to adjust its container
export default function SearchAI() {
  return (
    <div className="h-[calc(100vh-3rem)]">
      <TestAI />
    </div>
  );
}

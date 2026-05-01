import { useEffect, useMemo, useState } from "react";

import { FloatingNav } from "@/components/ui/floating-nav";
import ShaderBackground from "@/components/ui/shader-background";
import { DemoPage } from "@/components/pages/demo-page";
import { DocsPage } from "@/components/pages/docs-page";

type PageKey = "home" | "demo" | "docs";

function App() {
  const resolvePage = useMemo((): PageKey => {
    const currentHash = window.location.hash.replace("#", "");
    if (currentHash === "demo") {
      return "demo";
    }
    if (currentHash === "docs") {
      return "docs";
    }
    return "home";
  }, []);

  const [page, setPage] = useState<PageKey>(resolvePage);

  useEffect(() => {
    const onHashChange = () => {
      const currentHash = window.location.hash.replace("#", "");
      if (currentHash === "demo" || currentHash === "docs" || currentHash === "home") {
        setPage(currentHash);
      } else {
        setPage("home");
      }
    };

    window.addEventListener("hashchange", onHashChange);
    onHashChange();
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050814] text-white">
      <ShaderBackground />
      <FloatingNav />

      {page === "home" ? <DemoPage /> : null}
      {page === "demo" ? <DemoPage /> : null}
      {page === "docs" ? <DocsPage /> : null}
    </div>
  );
}

export default App;

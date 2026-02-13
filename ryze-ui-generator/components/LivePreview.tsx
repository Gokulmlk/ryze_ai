"use client";

import React, { useEffect, useRef, useState } from "react";
import * as Babel from "@babel/standalone";

interface PreviewProps {
  code: string;
  componentLibrary?: Record<string, any>;
}

export default function LivePreview({
  code,
  componentLibrary = {},
}: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState<string | null>(null);

  // Expose library to iframe
  useEffect(() => {

    
    if (typeof window !== "undefined") {
      (window as any).__RYZE_LIB__ = componentLibrary;
    }
  }, [componentLibrary]);

  // ---------- AUTO FIX FUNCTION ----------
  const sanitizeCode = (input: string) => {
    let fixed = input;

    // Remove markdown
    if (fixed.startsWith("```")) {
      fixed = fixed
        .replace(/^```[a-z]*\n/, "")
        .replace(/\n```$/, "");
    }

    // Remove line breaks inside imports
    fixed = fixed.replace(/\n/g, " ");

    // Remove React import
    fixed = fixed.replace(
      /import\s+React.*from\s+['"]react['"]/g,
      ""
    );

    // Handle hooks import
    fixed = fixed.replace(
      /import\s+{([^}]+)}\s+from\s+['"]react['"]/g,
      (_, hooks) => `const { ${hooks} } = React;`
    );

    // Replace ComponentLibrary import
    fixed = fixed.replace(
      /import\s+{([^}]+)}\s+from\s+['"].*ComponentLibrary['"]/g,
      (_, comps) => `const { ${comps} } = window.ComponentLibrary || {};`
    );

    // Ensure default export exists
    if (!fixed.includes("export default")) {
      fixed += "\nexport default GeneratedUI;";
    }

    // Convert export default to window component
    fixed = fixed.replace(
      /export\s+default\s+/g,
      "window.PreviewComponent = "
    );

    return fixed;
  };

  useEffect(() => {
    if (!code || !iframeRef.current) return;

    try {
      const transformedCode = sanitizeCode(code);

      const compiled =
        Babel.transform(transformedCode, {
          presets: ["react"],
        }).code || "";

      const html = `
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin:0; padding:16px; font-family:sans-serif; }
    #error { color:red; white-space:pre-wrap; }
  </style>
</head>
<body>
  <div id="root"></div>
  <div id="error"></div>

  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>

  <script>
    const showError = (msg) => {
      document.getElementById("error").innerText = msg;
    };

    try {
      window.ComponentLibrary = window.parent.__RYZE_LIB__ || {};

      ${compiled}

      const root = ReactDOM.createRoot(document.getElementById("root"));

      try {
        root.render(React.createElement(window.PreviewComponent));
      } catch (e) {
        showError("Render Error: " + e.toString());
      }

    } catch (e) {
      showError("Compile Error: " + e.toString());
    }
  </script>
</body>
</html>
`;

      iframeRef.current.srcdoc = html;
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  }, [code]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="px-4 py-2 bg-white border-b">
        <h3 className="text-sm font-semibold">Live Preview</h3>
      </div>

      <div className="flex-1">
        {error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : (
          <iframe
            ref={iframeRef}
            sandbox="allow-scripts allow-same-origin"
            className="w-full h-full bg-white"
          />
        )}
      </div>
    </div>
  );
}

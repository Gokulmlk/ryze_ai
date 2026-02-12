import React, { Component, ErrorInfo } from 'react';

interface PreviewProps {
  code: string;
}

interface PreviewState {
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  PreviewState
> {
  constructor(props: any) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    this.props.onError?.(error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold mb-2">Render Error</h3>
          <p className="text-red-700 text-sm">{this.state.error.toString()}</p>
          {this.state.errorInfo && (
            <pre className="mt-2 text-xs text-red-600 overflow-auto">
              {this.state.errorInfo.componentStack}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default function LivePreview({ code }: PreviewProps) {
  const [PreviewComponent, setPreviewComponent] = React.useState<React.ComponentType | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!code) {
      setPreviewComponent(null);
      return;
    }

    try {
      // Transform the code to make it executable
      let transformedCode = code;
      
      // Replace import statement with our component library
      transformedCode = transformedCode.replace(
        /import\s+{([^}]+)}\s+from\s+['"].*ComponentLibrary['"]/,
        (match, components) => {
          return `const { ${components} } = window.ComponentLibrary;`;
        }
      );
      
      // Replace import React
      transformedCode = transformedCode.replace(
        /import\s+React.*from\s+['"]react['"]/g,
        'const React = window.React;'
      );
      
      // Extract the component function
      const componentMatch = transformedCode.match(/export default function (\w+)/);
      if (!componentMatch) {
        throw new Error('No default export found');
      }
      
      const componentName = componentMatch[1];
      transformedCode = transformedCode.replace('export default function', 'function');
      
      // Create a function that returns the component
      const functionBody = `
        ${transformedCode}
        return ${componentName};
      `;
      
      const ComponentFactory = new Function('React', 'window', functionBody);
      const Component = ComponentFactory(React, window);
      
      setPreviewComponent(() => Component);
      setError(null);
    } catch (err: any) {
      console.error('Preview error:', err);
      setError(err.message);
      setPreviewComponent(null);
    }
  }, [code]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="px-4 py-2 bg-white border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Live Preview</h3>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-red-800 font-semibold mb-2">Code Error</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        ) : PreviewComponent ? (
          <ErrorBoundary onError={(e) => setError(e.message)}>
            <PreviewComponent />
          </ErrorBoundary>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No preview available</p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useCallback } from 'react';
import { RefreshCw, Github, Zap, Shield, Music2 } from 'lucide-react';
import { FileDropzone } from '@/components/FileDropzone';
import { ConversionProgress } from '@/components/ConversionProgress';
import { ConversionResults } from '@/components/ConversionResults';
import { Button } from '@/components/ui/button';
import { 
  parseKreateSQLite, 
  parseAndSanitizeCSV, 
  generateCubicMusicCSV, 
  detectFileType,
  type ConversionResult 
} from '@/lib/kreate-converter';

type ConversionStatus = 'idle' | 'detecting' | 'parsing' | 'converting' | 'complete' | 'error';

const Index = () => {
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [csvContent, setCsvContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleFileSelect = useCallback(async (file: File) => {
    setFileName(file.name);
    setStatus('detecting');
    setProgress(10);
    setCurrentStep('Analyzing file format...');
    setErrorMessage('');

    try {
      const buffer = await file.arrayBuffer();
      const fileType = detectFileType(buffer);

      setProgress(25);
      setStatus('parsing');
      setCurrentStep(`Detected ${fileType.toUpperCase()} format. Extracting data...`);

      let conversionResult: ConversionResult;

      if (fileType === 'sqlite') {
        setCurrentStep('Parsing SQLite database...');
        setProgress(40);
        conversionResult = await parseKreateSQLite(buffer);
      } else if (fileType === 'csv') {
        setCurrentStep('Parsing CSV file...');
        setProgress(40);
        const text = new TextDecoder('utf-8').decode(buffer);
        conversionResult = parseAndSanitizeCSV(text);
      } else {
        throw new Error('Unsupported file format. Please upload a .sqlite, .db, or .csv file.');
      }

      setProgress(70);
      setStatus('converting');
      setCurrentStep('Generating Cubic Music compatible CSV...');

      const csv = generateCubicMusicCSV(conversionResult);

      setProgress(100);
      setResult(conversionResult);
      setCsvContent(csv);
      setStatus('complete');
      setCurrentStep('Conversion complete!');

    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
      setCurrentStep('Conversion failed');
    }
  }, []);

  const handleReset = () => {
    setStatus('idle');
    setProgress(0);
    setCurrentStep('');
    setResult(null);
    setCsvContent('');
    setFileName('');
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20" 
               style={{ background: 'var(--gradient-glow)' }} />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full opacity-15"
               style={{ background: 'radial-gradient(ellipse at center, hsl(320 70% 55% / 0.3), transparent 70%)' }} />
        </div>

        <div className="relative container max-w-4xl mx-auto px-4 py-12 md:py-20">
          {/* Header */}
          <header className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Kreate → Cubic Music</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              <span className="gradient-text">CSV Converter</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Convert your Kreate backups to Cubic Music compatible format. 
              Fixes malformed CSV entries, cleans corrupted data, and preserves your playlists.
            </p>
          </header>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <FeatureCard 
              icon={<Shield className="w-5 h-5" />}
              title="Safe & Secure"
              description="All processing happens in your browser"
            />
            <FeatureCard 
              icon={<Music2 className="w-5 h-5" />}
              title="Playlist Preservation"
              description="Keeps all your playlists intact"
            />
            <FeatureCard 
              icon={<Zap className="w-5 h-5" />}
              title="Instant Conversion"
              description="No uploads, no waiting"
            />
          </div>

          {/* Main converter area */}
          <div className="space-y-6">
            {status === 'idle' && (
              <FileDropzone 
                onFileSelect={handleFileSelect}
                isProcessing={false}
                acceptedFormats={['.sqlite', '.db', '.csv']}
              />
            )}

            {status !== 'idle' && status !== 'complete' && (
              <>
                <ConversionProgress 
                  status={status}
                  progress={progress}
                  currentStep={currentStep}
                />
                {status === 'error' && (
                  <div className="glass-card rounded-xl p-6 border-destructive/50">
                    <p className="text-destructive mb-4">{errorMessage}</p>
                    <Button variant="outline" onClick={handleReset}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </div>
                )}
              </>
            )}

            {status === 'complete' && result && (
              <>
                <ConversionResults 
                  result={result}
                  csvContent={csvContent}
                  fileName={fileName}
                />
                <Button variant="ghost" onClick={handleReset} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Convert Another File
                </Button>
              </>
            )}
          </div>

          {/* Info section */}
          <section className="mt-16 space-y-8">
            <h2 className="text-2xl font-bold text-center">Why This Converter?</h2>
            
            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="text-warning">⚠️</span>
                The Kreate Export Problem
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Kreate's export system has bugs in its CSV generation that create malformed data breaking standard CSV parsing. 
                This affects not just Cubic Music, but also RiPlay and RiMusic (the original app Kreate was forked from).
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Empty values where numbers should be</li>
                <li>• Incorrect data types</li>
                <li>• Missing required fields</li>
                <li>• Format violations that crash parsers</li>
              </ul>
            </div>

            <div className="glass-card rounded-xl p-6 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <span className="text-success">✅</span>
                What This Tool Does
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Detects and fixes Kreate's malformed CSV entries</li>
                <li>• Cleans corrupted data before import</li>
                <li>• Extracts songs and playlists from SQLite databases</li>
                <li>• Generates Cubic Music compatible CSV format</li>
              </ul>
            </div>
          </section>

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
            <p>Made with 💜 for the Cubic Music community</p>
            <p className="mt-2 text-xs">
              This tool processes files entirely in your browser. No data is uploaded to any server.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="glass-card rounded-xl p-4 text-center">
      <div className="inline-flex p-3 rounded-lg bg-primary/10 text-primary mb-3">
        {icon}
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export default Index;

import { useState, useCallback } from 'react';
import { RefreshCw, Zap, Shield, Music2 } from 'lucide-react';
import { FileDropzone } from '@/components/FileDropzone';
import { ConversionProgress } from '@/components/ConversionProgress';
import { SQLiteViewer } from '@/components/SQLiteViewer';
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

  const handleDownload = useCallback(() => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    // Name reflects it was converted from sqlite
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    link.download = `cubic_music_from_${baseName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [csvContent, fileName]);

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
      <div className="container max-w-2xl mx-auto px-4 py-6 sm:py-12">
        {/* Header */}
        <header className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <span className="text-xs sm:text-sm font-medium text-primary">Kreate → Cubic Music</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3">
            <span className="gradient-text">Backup Converter</span>
          </h1>
          
          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto px-4">
            Convert your Kreate backup to Cubic Music format. 
            Fixes malformed data and preserves your playlists.
          </p>
        </header>

        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-10">
          <FeatureBadge icon={<Shield className="w-3 h-3 sm:w-4 sm:h-4" />} text="Browser Only" />
          <FeatureBadge icon={<Music2 className="w-3 h-3 sm:w-4 sm:h-4" />} text="Keeps Playlists" />
          <FeatureBadge icon={<Zap className="w-3 h-3 sm:w-4 sm:h-4" />} text="Instant" />
        </div>

        {/* Main converter area */}
        <div className="space-y-4 sm:space-y-6">
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
                <div className="glass-card rounded-xl p-4 sm:p-6 border-destructive/50">
                  <p className="text-destructive text-sm sm:text-base mb-4">{errorMessage}</p>
                  <Button variant="outline" onClick={handleReset} size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                </div>
              )}
            </>
          )}

          {status === 'complete' && result && (
            <>
              <SQLiteViewer 
                result={result}
                onDownload={handleDownload}
              />
              <Button variant="ghost" onClick={handleReset} className="w-full" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Convert Another File
              </Button>
            </>
          )}
        </div>

        {/* Info section */}
        {status === 'idle' && (
          <section className="mt-8 sm:mt-12 space-y-4">
            <details className="glass-card rounded-xl overflow-hidden">
              <summary className="p-3 sm:p-4 cursor-pointer hover:bg-muted/30 transition-colors text-sm sm:text-base font-medium">
                ⚠️ Why is this needed?
              </summary>
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-xs sm:text-sm text-muted-foreground space-y-2">
                <p>Kreate's export has bugs that create malformed CSV data.</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Empty values where numbers should be</li>
                  <li>Incorrect data types</li>
                  <li>Format violations that crash parsers</li>
                </ul>
                <p className="pt-2">This affects Cubic Music, RiPlay, and RiMusic.</p>
              </div>
            </details>

            <details className="glass-card rounded-xl overflow-hidden">
              <summary className="p-3 sm:p-4 cursor-pointer hover:bg-muted/30 transition-colors text-sm sm:text-base font-medium">
                ✅ What this tool does
              </summary>
              <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-xs sm:text-sm text-muted-foreground">
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Reads SQLite databases directly</li>
                  <li>Fixes malformed CSV entries</li>
                  <li>Maps Kreate schema to Cubic Music format</li>
                  <li>Generates clean, importable CSV</li>
                </ul>
              </div>
            </details>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-8 sm:mt-12 text-center text-xs text-muted-foreground">
          <p>All processing happens in your browser. No data uploaded.</p>
        </footer>
      </div>
    </div>
  );
};

function FeatureBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-muted/50 border border-border/50">
      <span className="text-primary">{icon}</span>
      <span className="text-xs sm:text-sm text-muted-foreground">{text}</span>
    </div>
  );
}

export default Index;

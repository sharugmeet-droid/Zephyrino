
import React, { useState, useRef, useCallback } from 'react';
import Layout from './components/Layout';
import { AppStep, AnalysisResult, HairstyleSuggestion } from './types';
import { analyzeFace, transformHairstyle } from './services/geminiService';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setOriginalImage(base64);
        startAnalysis(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async (base64: string) => {
    setStep(AppStep.ANALYZING);
    setError(null);
    try {
      const strippedBase64 = base64.split(',')[1];
      const result = await analyzeFace(strippedBase64);
      setAnalysis(result);
      setStep(AppStep.SUGGESTIONS);
    } catch (err: any) {
      setError("We encountered an issue analyzing your photo. Please try another one.");
      setStep(AppStep.UPLOAD);
    }
  };

  const handleTransform = async (prompt: string) => {
    if (!originalImage) return;
    setStep(AppStep.TRANSFORMING);
    setError(null);
    try {
      const strippedBase64 = originalImage.split(',')[1];
      const editedImage = await transformHairstyle(strippedBase64, prompt);
      setResultImage(editedImage);
      setStep(AppStep.RESULT);
    } catch (err: any) {
      setError("Transformation failed. Let's try another style.");
      setStep(AppStep.SUGGESTIONS);
    }
  };

  const reset = () => {
    setStep(AppStep.UPLOAD);
    setOriginalImage(null);
    setResultImage(null);
    setAnalysis(null);
    setCustomPrompt('');
    setError(null);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        
        {/* Error Notification */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg text-sm flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="font-bold">&times;</button>
          </div>
        )}

        {/* Step 1: Upload */}
        {step === AppStep.UPLOAD && (
          <div className="text-center animate-in fade-in duration-700">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-[#2D4F1E]">Your Perfect Cut Awaits</h2>
            <p className="text-[#4A6D3A] text-lg mb-10 max-w-xl mx-auto">
              Upload a clear portrait photo. Zeroxin's AI will analyze your facial structure and visualize premium hairstyles tailored just for you.
            </p>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#E7D7C1] rounded-3xl p-16 bg-white hover:border-[#2D4F1E] hover:bg-[#FDFBF7] cursor-pointer transition-all group"
            >
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#FDFBF7] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-[#2D4F1E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-xl font-medium text-[#2D4F1E]">Upload Portrait</p>
                <p className="text-sm text-[#8DAA91] mt-1">JPEG or PNG, up to 5MB</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
          </div>
        )}

        {/* Step 2: Analyzing / Transforming Loading States */}
        {(step === AppStep.ANALYZING || step === AppStep.TRANSFORMING) && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-24 h-24 border-4 border-[#2D4F1E] border-t-transparent rounded-full animate-spin mb-8"></div>
            <h2 className="text-2xl font-classic text-[#2D4F1E]">
              {step === AppStep.ANALYZING ? "Analyzing Facial Geometry..." : "Visualizing Your New Look..."}
            </h2>
            <p className="text-[#4A6D3A] mt-2">Crafting excellence with neural precision.</p>
          </div>
        )}

        {/* Step 3: Suggestions */}
        {step === AppStep.SUGGESTIONS && analysis && (
          <div className="animate-in slide-in-from-bottom-10 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              {/* Image Preview */}
              <div className="sticky top-8">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img src={originalImage!} alt="Original" className="w-full h-auto object-cover" />
                </div>
                <div className="mt-4 p-4 bg-[#E7D7C1]/30 rounded-2xl">
                  <p className="text-xs uppercase tracking-widest font-bold text-[#4A6D3A] mb-1">Detected Profile</p>
                  <p className="text-lg font-classic text-[#2D4F1E]">{analysis.faceShape} Face Shape</p>
                </div>
              </div>

              {/* Suggestions List */}
              <div>
                <h3 className="text-3xl font-bold text-[#2D4F1E] mb-6">Curated Suggestions</h3>
                <div className="space-y-4 mb-10">
                  {analysis.suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTransform(s.name)}
                      className="w-full text-left p-6 bg-white rounded-2xl border border-[#E7D7C1] hover:border-[#2D4F1E] hover:shadow-lg transition-all group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-lg text-[#2D4F1E]">{s.name}</h4>
                        <span className="text-[10px] bg-[#2D4F1E] text-white px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">Apply</span>
                      </div>
                      <p className="text-sm text-[#4A6D3A] mb-2">{s.description}</p>
                      <p className="text-xs italic text-[#8DAA91]">{s.suitability}</p>
                    </button>
                  ))}
                </div>

                <div className="p-8 bg-[#2D4F1E] text-[#FDFBF7] rounded-3xl">
                  <h4 className="font-classic text-xl mb-4">Or specify your own...</h4>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="e.g., Short textured crop with fade..."
                      className="flex-1 bg-transparent border-b border-[#E7D7C1] py-2 focus:outline-none focus:border-white placeholder-[#8DAA91]"
                    />
                    <button 
                      onClick={() => customPrompt && handleTransform(customPrompt)}
                      disabled={!customPrompt}
                      className="p-2 bg-[#FDFBF7] text-[#2D4F1E] rounded-full disabled:opacity-50"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {step === AppStep.RESULT && resultImage && (
          <div className="text-center animate-in zoom-in-95 duration-700">
            <h2 className="text-4xl font-bold text-[#2D4F1E] mb-8">The Transformation</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="flex flex-col gap-4">
                <div className="rounded-3xl overflow-hidden shadow-lg border border-[#E7D7C1]">
                  <img src={originalImage!} alt="Original" className="w-full h-auto" />
                </div>
                <span className="text-xs uppercase tracking-widest text-[#8DAA91]">Before</span>
              </div>
              <div className="flex flex-col gap-4">
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-[#2D4F1E]">
                  <img src={resultImage} alt="Transformed" className="w-full h-auto" />
                </div>
                <span className="text-xs uppercase tracking-widest font-bold text-[#2D4F1E]">After - Zeroxin.io AI</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={reset}
                className="px-8 py-3 rounded-full border border-[#2D4F1E] text-[#2D4F1E] font-semibold hover:bg-[#FDFBF7] transition-all"
              >
                Try Another Photo
              </button>
              <button 
                onClick={() => setStep(AppStep.SUGGESTIONS)}
                className="px-8 py-3 rounded-full bg-[#E7D7C1] text-[#2D4F1E] font-semibold hover:bg-[#DBC6AB] transition-all"
              >
                Change Style
              </button>
              <a 
                href={resultImage} 
                download="zeroxin-new-look.png"
                className="px-8 py-3 rounded-full bg-[#2D4F1E] text-[#FDFBF7] font-semibold hover:bg-[#1B3022] transition-all shadow-lg"
              >
                Download Masterpiece
              </a>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;

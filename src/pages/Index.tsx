
import React, { useState } from "react";
import { models, benchmarks, getAverageScore } from "@/data/modelData";
import { ModelCard } from "@/components/ModelCard";
import { BenchmarkChart } from "@/components/BenchmarkChart";
import { ModelRadarChart } from "@/components/RadarChart";
import { ModelComparison } from "@/components/ModelComparison";
import { ModelSelector } from "@/components/ModelSelector";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitHubLogoIcon } from '@radix-ui/react-icons';
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

const Index = () => {
  const [selectedModelIds, setSelectedModelIds] = useState<string[]>([]);
  const [selectedBenchmark, setSelectedBenchmark] = useState<string>("mmlu");
  const [selectionView, setSelectionView] = useState<string>("cards");
  const [showMultilingualOnly, setShowMultilingualOnly] = useState<boolean>(false);

  const selectedModels = models.filter(model => 
    selectedModelIds.includes(model.id)
  );

  const toggleModelSelection = (modelId: string) => {
    if (selectedModelIds.includes(modelId)) {
      setSelectedModelIds(selectedModelIds.filter(id => id !== modelId));
    } else {
      // Limit to 3 models for comparison
      if (selectedModelIds.length < 3) {
        setSelectedModelIds([...selectedModelIds, modelId]);
      }
    }
  };

  const handleSelectModel = (modelId: string) => {
    if (!selectedModelIds.includes(modelId) && selectedModelIds.length < 3) {
      setSelectedModelIds([...selectedModelIds, modelId]);
    }
  };

  const handleRemoveModel = (modelId: string) => {
    setSelectedModelIds(selectedModelIds.filter(id => id !== modelId));
  };

  // Sort models by average score
  const sortedModels = [...models].sort((a, b) => 
    getAverageScore(b) - getAverageScore(a)
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Model Benchmark Battle</h1>
              <p className="text-gray-600 mt-2">
                Compare how well different AI language models perform on common NLP tasks and benchmarks
              </p>
            </div>
            <div>
              <a 
                href="https://github.com/yourusername/ai-model-benchmark-battle" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 transition-colors"
              >
                <GitHubLogoIcon className="h-4 w-4" />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Model Selection */}
        <section className="mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold">Model Selection</h2>
            <p className="text-sm text-gray-500 mt-1">
              Select up to 3 models to compare their performance across different benchmarks
            </p>
          </div>

          <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
            <Tabs defaultValue="cards" value={selectionView} onValueChange={setSelectionView}>
              <TabsList className="mb-4">
                <TabsTrigger value="cards">Card View</TabsTrigger>
                <TabsTrigger value="dropdown">Dropdown Select</TabsTrigger>
              </TabsList>
              
              <TabsContent value="cards">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sortedModels.map((model) => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      isSelected={selectedModelIds.includes(model.id)}
                      onClick={() => toggleModelSelection(model.id)}
                    />
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="dropdown">
                <ModelSelector
                  models={sortedModels}
                  selectedModelIds={selectedModelIds}
                  onSelectModel={handleSelectModel}
                  onRemoveModel={handleRemoveModel}
                />
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Benchmark Selection */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Benchmark Selection</h2>
            <p className="text-sm text-gray-500 mt-1">
              Choose a benchmark to visualize performance
            </p>
          </div>
          
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="max-w-md">
              <Select value={selectedBenchmark} onValueChange={setSelectedBenchmark}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a benchmark" />
                </SelectTrigger>
                <SelectContent>
                  {benchmarks
                    .filter(benchmark => !showMultilingualOnly || benchmark.category === 'multilingual')
                    .map((benchmark) => (
                      <SelectItem 
                        key={benchmark.id} 
                        value={benchmark.id}
                        className={benchmark.category === 'multilingual' ? 'text-blue-600 font-medium' : ''}
                      >
                        {benchmark.category === 'multilingual' && <Languages className="inline h-3 w-3 mr-1" />}
                        {benchmark.name} - {benchmark.category}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
              
              <div className="mt-4 space-y-3">
                <Button 
                  variant={showMultilingualOnly ? "default" : "outline"} 
                  size="sm"
                  onClick={() => {
                    setShowMultilingualOnly(!showMultilingualOnly);
                    if (!showMultilingualOnly) {
                      // When enabling multilingual filter, switch to a multilingual benchmark
                      const multilingualBenchmark = benchmarks.find(b => b.category === 'multilingual');
                      if (multilingualBenchmark) {
                        setSelectedBenchmark(multilingualBenchmark.id);
                      }
                    }
                  }}
                  className="gap-2"
                >
                  <Languages className="h-4 w-4" />
                  {showMultilingualOnly ? "Showing Multilingual Benchmarks" : "Show Multilingual Benchmarks"}
                </Button>
                
                {selectedBenchmark && (
                  <div className="rounded-lg bg-blue-50 p-3 text-sm">
                    <p className="font-medium text-blue-800">
                      {benchmarks.find(b => b.id === selectedBenchmark)?.name}
                    </p>
                    <p className="mt-1 text-blue-700">
                      {benchmarks.find(b => b.id === selectedBenchmark)?.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Visualization Section */}
        <section className="space-y-8">
          {/* Benchmark Bar Chart */}
          <BenchmarkChart
            models={models}
            benchmarks={showMultilingualOnly ? 
              benchmarks.filter(b => b.category === 'multilingual') : 
              benchmarks}
            selectedBenchmark={selectedBenchmark}
            onSelectBenchmark={setSelectedBenchmark}
          />

          {/* Radar Chart and Detail Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ModelRadarChart 
              selectedModels={selectedModels}
              benchmarks={benchmarks}
            />
            
            <ModelComparison
              selectedModels={selectedModels}
              benchmarks={benchmarks}
            />
          </div>
        </section>

        {/* About Section */}
        <section className="mt-12 rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">About AI Model Benchmarks</h2>
          <p className="text-gray-600 mb-4">
            These benchmarks evaluate language models on a variety of natural language processing tasks, including 
            question answering, reasoning, knowledge retrieval, code generation, and <span className="font-medium text-blue-600 inline-flex items-center gap-1">
              <Languages className="h-4 w-4" /> multilingual capabilities
            </span>. Performance is measured as a score from 0-100, where higher is better.
          </p>
          
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="text-lg font-medium text-blue-800 flex items-center gap-2 mb-2">
              <Languages className="h-5 w-5" />
              Multilingual Benchmark Details
            </h3>
            <p className="text-blue-700 text-sm">
              Our multilingual benchmarks evaluate how well AI models perform across different languages and translation tasks:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-blue-700">
              <li><strong>XNLI:</strong> Tests natural language inference across 15 languages</li>
              <li><strong>FLORES-101:</strong> Measures translation quality across 101 languages</li>
              <li><strong>MGSM:</strong> Evaluates math problem-solving in 10+ languages</li>
            </ul>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {benchmarks.map((benchmark) => (
              <div key={benchmark.id} className="rounded-lg border p-3">
                <h3 className="font-medium">{benchmark.name}</h3>
                <p className="text-sm text-gray-500">{benchmark.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings,
  Zap,
  Gauge,
  Brain,
  Eye,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Cpu,
  HardDrive
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ModelConfig {
  id: string;
  name: string;
  description: string;
  chatModel: string;
  visionModel: string;
  performance: 'light' | 'balanced' | 'heavy';
  ramUsage: string;
  speed: string;
  quality: string;
  icon: any;
  color: string;
}

const MODEL_CONFIGS: ModelConfig[] = [
  {
    id: 'light',
    name: 'Light Mode',
    description: 'Fast & efficient - minimal resource usage',
    chatModel: 'gemma2:2b',
    visionModel: 'llava:latest',
    performance: 'light',
    ramUsage: '~3GB',
    speed: 'Very Fast',
    quality: 'Good',
    icon: Zap,
    color: 'text-green-500'
  },
  {
    id: 'balanced',
    name: 'Balanced Mode',
    description: 'Good balance of quality and performance',
    chatModel: 'gemma3:4b',
    visionModel: 'llava:7b',
    performance: 'balanced',
    ramUsage: '~6GB',
    speed: 'Fast',
    quality: 'Very Good',
    icon: Gauge,
    color: 'text-blue-500'
  },
  {
    id: 'heavy',
    name: 'Quality Mode',
    description: 'Best quality - high resource usage',
    chatModel: 'gemma3:4b',
    visionModel: 'llava:13b',
    performance: 'heavy',
    ramUsage: '~11GB',
    speed: 'Slower',
    quality: 'Excellent',
    icon: Brain,
    color: 'text-purple-500'
  },
  {
    id: 'vision',
    name: 'LLaVA Vision',
    description: 'Advanced image analysis with LLaVA',
    chatModel: 'gemma3:4b',
    visionModel: 'llava:7b',
    performance: 'balanced',
    ramUsage: '~5GB',
    speed: 'Good',
    quality: 'Excellent Vision',
    icon: Eye,
    color: 'text-emerald-500'
  }
];

interface ModelSelectorProps {
  currentModel: string;
  onModelChange: (config: ModelConfig) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ModelSelector({ 
  currentModel, 
  onModelChange, 
  isOpen, 
  onToggle 
}: ModelSelectorProps) {
  const [selectedConfig, setSelectedConfig] = useState<ModelConfig>(
    MODEL_CONFIGS.find(config => config.id === currentModel) || MODEL_CONFIGS[1]
  );
  
  const [systemStats, setSystemStats] = useState({
    cpu: 0,
    memory: 0,
    modelsLoaded: 0
  });

  // Simulate system stats (in real app, you'd get this from backend)
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStats({
        cpu: Math.floor(Math.random() * 30) + (selectedConfig.performance === 'heavy' ? 60 : selectedConfig.performance === 'balanced' ? 30 : 10),
        memory: Math.floor(Math.random() * 20) + (selectedConfig.performance === 'heavy' ? 70 : selectedConfig.performance === 'balanced' ? 45 : 25),
        modelsLoaded: selectedConfig.performance === 'heavy' ? 2 : selectedConfig.performance === 'balanced' ? 1 : 1
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedConfig.performance]);

  const handleModelSelect = (config: ModelConfig) => {
    setSelectedConfig(config);
    onModelChange(config);
  };

  return (
    <div className="relative">
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className={`flex items-center gap-2 text-white/80 hover:text-white transition-colors ${
          isOpen ? 'bg-white/10' : ''
        }`}
      >
        <Settings className="h-4 w-4" />
        <span className="hidden sm:inline">Models</span>
        {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </Button>

      {/* Model Selector Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 w-80 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Model Configuration</h3>
              <Badge variant="outline" className="text-xs">
                {selectedConfig.performance.toUpperCase()}
              </Badge>
            </div>

            {/* System Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-white/5 rounded-lg">
              <div className="text-center">
                <Cpu className="h-4 w-4 mx-auto mb-1 text-blue-400" />
                <div className="text-xs text-white/60">CPU</div>
                <div className={`text-sm font-mono ${systemStats.cpu > 80 ? 'text-red-400' : systemStats.cpu > 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {systemStats.cpu}%
                </div>
              </div>
              <div className="text-center">
                <HardDrive className="h-4 w-4 mx-auto mb-1 text-green-400" />
                <div className="text-xs text-white/60">RAM</div>
                <div className={`text-sm font-mono ${systemStats.memory > 80 ? 'text-red-400' : systemStats.memory > 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {systemStats.memory}%
                </div>
              </div>
              <div className="text-center">
                <Brain className="h-4 w-4 mx-auto mb-1 text-purple-400" />
                <div className="text-xs text-white/60">Models</div>
                <div className="text-sm font-mono text-blue-400">
                  {systemStats.modelsLoaded}
                </div>
              </div>
            </div>

            {/* Model Options */}
            <div className="space-y-2">
              {MODEL_CONFIGS.map((config) => {
                const Icon = config.icon;
                const isSelected = selectedConfig.id === config.id;
                
                return (
                  <motion.button
                    key={config.id}
                    onClick={() => handleModelSelect(config)}
                    className={`w-full p-3 rounded-lg border transition-all duration-200 text-left ${
                      isSelected 
                        ? 'bg-white/10 border-white/30 shadow-md' 
                        : 'bg-white/5 border-white/10 hover:bg-white/8 hover:border-white/20'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${config.color} bg-white/10`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-medium text-sm">{config.name}</h4>
                          {isSelected && (
                            <Badge variant="secondary" className="text-xs">
                              Active
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-white/60 text-xs mb-2">{config.description}</p>
                        
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <span className="text-white/50">RAM:</span>
                            <span className="ml-1 text-white/80">{config.ramUsage}</span>
                          </div>
                          <div>
                            <span className="text-white/50">Speed:</span>
                            <span className="ml-1 text-white/80">{config.speed}</span>
                          </div>
                          <div>
                            <span className="text-white/50">Quality:</span>
                            <span className="ml-1 text-white/80">{config.quality}</span>
                          </div>
                        </div>
                        
                        {/* Model Details */}
                        <div className="mt-2 pt-2 border-t border-white/10">
                          <div className="flex items-center gap-4 text-xs text-white/50">
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>{config.chatModel}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{config.visionModel}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <p className="text-xs text-white/60 text-center">
                Models will be loaded/unloaded automatically based on selection
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

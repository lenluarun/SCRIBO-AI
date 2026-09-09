import React, { useState } from 'react';
import { 
  GitBranch, 
  Binary, 
  Share2, 
  Sparkles, 
  ExternalLink, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { LectureSession, VisualDiagram, SyllabusSkillNode } from '../types';

interface VisualSkillSynthesisProps {
  lecture: LectureSession;
  onSelectConcept: (conceptTitle: string) => void;
}

export const VisualSkillSynthesis: React.FC<VisualSkillSynthesisProps> = ({
  lecture,
  onSelectConcept,
}) => {
  const [activeTab, setActiveTab] = useState<'flowcharts' | 'formulas' | 'skills'>('flowcharts');
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col h-full min-h-0 overflow-hidden">
      {/* Pillar 03 Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-slate-100 shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Visual Skill Synthesis
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Auto Mermaid & LaTeX
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Spoken processes converted into interactive flowcharts and formulas auto-tagged to syllabus.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('flowcharts')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer min-h-[32px] ${
              activeTab === 'flowcharts'
                ? 'bg-white text-indigo-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
            <span>Flowcharts</span>
          </button>
          <button
            onClick={() => setActiveTab('formulas')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer min-h-[32px] ${
              activeTab === 'formulas'
                ? 'bg-white text-indigo-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Binary className="w-3.5 h-3.5 text-indigo-600" />
            <span>LaTeX Math</span>
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer min-h-[32px] ${
              activeTab === 'skills'
                ? 'bg-white text-indigo-950 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Syllabus ({lecture.syllabusNodes.length})</span>
          </button>
        </div>
      </div>

      {/* Body Area */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
        {activeTab === 'flowcharts' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 leading-relaxed">
              <strong>Interactive Computational Graph:</strong> Synthesized directly from professor's spoken words at timestamps 00:08 - 00:32. Demonstrates the forward activation pass and reverse gradient propagation routes.
            </div>

            {/* Custom Interactive SVG Graph Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                    <span>Backpropagation Computational Graph Flow</span>
                    <span className="text-[10px] font-mono text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded border border-indigo-200 font-bold">
                      UNIT-3.1
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Solid line: Forward Pass (Activations) • Dashed line: Reverse Pass (Gradient Adjoints)
                  </p>
                </div>
              </div>

              {/* Interactive SVG Diagram */}
              <div className="w-full overflow-x-auto py-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-center">
                <svg viewBox="0 0 680 200" className="w-full max-w-[640px] h-auto font-sans select-none">
                  <defs>
                    <marker id="arrowFwd" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L6,3 z" fill="#4f46e5" />
                    </marker>
                    <marker id="arrowRev" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L6,3 z" fill="#e11d48" />
                    </marker>
                  </defs>

                  {/* Node 1: Input X */}
                  <g 
                    onMouseEnter={() => setHoveredNode('node-x')} 
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer transition-transform"
                  >
                    <rect x="20" y="70" width="100" height="50" rx="8" fill="#f8fafc" stroke={hoveredNode === 'node-x' ? '#4f46e5' : '#cbd5e1'} strokeWidth="2" />
                    <text x="70" y="95" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">Input X</text>
                    <text x="70" y="110" fill="#64748b" fontSize="9" textAnchor="middle">[batch, d_in]</text>
                  </g>

                  {/* Forward Arrow 1 */}
                  <path d="M 120 90 L 170 90" stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arrowFwd)" />

                  {/* Node 2: MatMul W1 */}
                  <g 
                    onMouseEnter={() => setHoveredNode('node-w1')} 
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer"
                  >
                    <rect x="175" y="70" width="115" height="50" rx="8" fill="#f8fafc" stroke={hoveredNode === 'node-w1' ? '#4f46e5' : '#cbd5e1'} strokeWidth="2" />
                    <text x="232" y="95" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">Affine (W₁x + b₁)</text>
                    <text x="232" y="110" fill="#64748b" fontSize="9" textAnchor="middle">Linear Layer</text>
                  </g>

                  {/* Forward Arrow 2 */}
                  <path d="M 290 90 L 335 90" stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arrowFwd)" />

                  {/* Node 3: ReLU */}
                  <g 
                    onMouseEnter={() => setHoveredNode('node-relu')} 
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer"
                  >
                    <rect x="340" y="70" width="110" height="50" rx="8" fill="#fffbeb" stroke={hoveredNode === 'node-relu' ? '#d97706' : '#fcd34d'} strokeWidth="2" />
                    <text x="395" y="95" fill="#92400e" fontSize="12" fontWeight="bold" textAnchor="middle">ReLU Activation</text>
                    <text x="395" y="110" fill="#b45309" fontSize="9" textAnchor="middle">max(0, z)</text>
                  </g>

                  {/* Forward Arrow 3 */}
                  <path d="M 450 90 L 495 90" stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arrowFwd)" />

                  {/* Node 4: Loss L */}
                  <g 
                    onMouseEnter={() => setHoveredNode('node-loss')} 
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer"
                  >
                    <rect x="500" y="70" width="120" height="50" rx="8" fill="#eef2ff" stroke={hoveredNode === 'node-loss' ? '#4f46e5' : '#a5b4fc'} strokeWidth="2" />
                    <text x="560" y="95" fill="#312e81" fontSize="12" fontWeight="bold" textAnchor="middle">Loss Function L</text>
                    <text x="560" y="110" fill="#4338ca" fontSize="9" textAnchor="middle">CrossEntropy(y, ŷ)</text>
                  </g>

                  {/* Reverse Pass Curved Arrows (Gradient Backprop) */}
                  <path d="M 560 125 C 560 165, 400 165, 395 125" fill="none" stroke="#e11d48" strokeWidth="2" strokeDasharray="5,3" markerEnd="url(#arrowRev)" />
                  <text x="475" y="175" fill="#be123c" fontSize="10" fontWeight="bold" textAnchor="middle">dL/dz (Upstream Gradient)</text>

                  <path d="M 390 65 C 390 25, 240 25, 235 65" fill="none" stroke="#e11d48" strokeWidth="2" strokeDasharray="5,3" markerEnd="url(#arrowRev)" />
                  <text x="315" y="22" fill="#be123c" fontSize="10" fontWeight="bold" textAnchor="middle">dL/dW = δ · xᵀ (Chain Rule)</text>
                </svg>
              </div>

              {/* Node Inspector Box */}
              <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                <div>
                  <span className="font-bold text-indigo-700">Inspected Element: </span>
                  {hoveredNode === 'node-relu' ? (
                    <span className="text-amber-900 font-medium">
                      ReLU Layer — Note: Derivative is 0 for x &lt; 0 and 1 for x &gt; 0 (Verified textbook truth).
                    </span>
                  ) : hoveredNode === 'node-w1' ? (
                    <span className="text-slate-900 font-medium">
                      Linear layer weights W1 updated via outer product δ^(l) · (a^(l-1))^T.
                    </span>
                  ) : hoveredNode === 'node-loss' ? (
                    <span className="text-indigo-950 font-medium">
                      Scalar objective loss function driving backpropagation backward through the graph.
                    </span>
                  ) : (
                    <span className="text-slate-500">
                      Hover any graph node above to see its localized gradient dynamics.
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onSelectConcept('Backpropagation Chain Rule')}
                  className="shrink-0 flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-bold text-xs cursor-pointer ml-auto"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Ask Scribo</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'formulas' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 leading-relaxed">
              <strong>Dynamic LaTeX Synthesis:</strong> Scribo parses spoken mathematical derivations and formats clean algebraic structures with term-by-term parameter callouts.
            </div>

            {/* Formula 1 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700">
                  Multivariate Matrix Backprop Chain Rule
                </span>
                <span className="text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                  Unit 3.2
                </span>
              </div>

              {/* Rendered Math Card */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 font-mono text-center text-sm sm:text-base text-slate-900 overflow-x-auto tracking-wide shadow-2xs">
                <div className="py-2 font-bold">
                  <span className="text-rose-600">∂L / ∂W⁽ˡ⁾</span>
                  <span className="text-slate-400 mx-2">=</span>
                  <span className="text-amber-700">δ⁽ˡ⁾</span>
                  <span className="text-slate-400 mx-1.5">·</span>
                  <span className="text-emerald-700">(a⁽ˡ⁻¹⁾)ᵀ</span>
                </div>
                <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                  where <span className="text-amber-700 font-bold">δ⁽ˡ⁾</span> = (W⁽ˡ⁺¹⁾)ᵀ δ⁽ˡ⁺¹⁾ ⊙ σ'(z⁽ˡ⁾)
                </div>
              </div>

              {/* Notation Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 pt-1">
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-amber-800 font-bold">δ⁽ˡ⁾ (Error Vector): </span>
                  Adjoint gradient signal propagating backward from layer l+1.
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-emerald-800 font-bold">(a⁽ˡ⁻¹⁾)ᵀ (Activation Transpose): </span>
                  Preserves matrix dimensions (d_out × d_in) during weight update.
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-indigo-800 font-bold">⊙ (Hadamard Product): </span>
                  Elementwise multiplication with localized activation slope.
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                  <span className="text-purple-800 font-bold">σ'(z⁽ˡ⁾) (Activation Derivative): </span>
                  For ReLU: 1 if z &gt; 0, and 0 if z &lt; 0.
                </div>
              </div>
            </div>

            {/* Formula 2: Batch Norm */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700">
                  Batch Normalization Transform
                </span>
                <span className="text-[10px] font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                  Unit 3.4
                </span>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 font-mono text-center text-sm sm:text-base text-emerald-800 font-bold overflow-x-auto tracking-wide shadow-2xs">
                x̂ᵢ = (xᵢ - μ_B) / √(σ_B² + ε) &nbsp;&nbsp;⟶&nbsp;&nbsp; yᵢ = γ · x̂ᵢ + β
              </div>

              <p className="text-xs text-slate-500">
                Correct formulation: Mean centering (x - μ_B) is strictly required before scaling by standard deviation √(σ_B² + ε).
              </p>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
              <strong>Curriculum Skill Tree Alignment:</strong> Every spoken sentence in this lecture is mapped to official university syllabus nodes to measure student progress and highlight topics needing reinforcement.
            </div>

            {lecture.syllabusNodes.map((node) => (
              <div
                key={node.id}
                className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {node.code}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {node.name}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {node.description}
                    </p>
                  </div>

                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${
                    node.status === 'covered'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : node.status === 'in_progress'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : 'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {node.status === 'covered' ? 'Covered ✓' : node.status === 'in_progress' ? 'In Progress' : 'Behind Pace'}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>Course Syllabus Mastery</span>
                    <span className="font-mono font-bold text-slate-900">{node.progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                      style={{ width: `${node.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span>Mapped in {node.lecturesMapped} active lecture sessions</span>
                  {node.misspeaksDetected > 0 && (
                    <span className="text-amber-700 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      {node.misspeaksDetected} misspeak citation logged
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

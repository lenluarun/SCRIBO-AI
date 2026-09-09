import { LectureSession } from '../types';

export const SAMPLE_LECTURES: LectureSession[] = [
  {
    id: 'cs-deep-learning-08',
    title: 'Backpropagation, Chain Rule & Loss Landscapes',
    courseCode: 'CS-482',
    courseName: 'Deep Neural Architectures',
    instructor: 'Prof. Ananya Sen, Ph.D.',
    date: 'Today, 10:15 AM',
    durationMs: 72000, // 72 seconds for demo scrub
    overview: 'Derivation of computational graphs, chain rule propagation across hidden tensor dimensions, gradient vanishing bottlenecks, and non-convex loss surfaces.',
    words: [
      { id: 'w1', text: 'Good', startMs: 0, endMs: 380, confidence: 0.99 },
      { id: 'w2', text: 'morning', startMs: 400, endMs: 850, confidence: 0.98 },
      { id: 'w3', text: 'everyone.', startMs: 870, endMs: 1400, confidence: 0.99 },
      { id: 'w4', text: 'Today', startMs: 1600, endMs: 1980, confidence: 0.97 },
      { id: 'w5', text: 'we', startMs: 2000, endMs: 2200, confidence: 0.99 },
      { id: 'w6', text: 'are', startMs: 2220, endMs: 2400, confidence: 0.99 },
      { id: 'w7', text: 'unraveling', startMs: 2450, endMs: 3100, confidence: 0.96 },
      { id: 'w8', text: 'backpropagation', startMs: 3150, endMs: 4200, confidence: 0.99, isKeyTerm: true },
      { id: 'w9', text: 'across', startMs: 4250, endMs: 4600, confidence: 0.98 },
      { id: 'w10', text: 'deep', startMs: 4650, endMs: 4950, confidence: 0.99 },
      { id: 'w11', text: 'computational', startMs: 5000, endMs: 5800, confidence: 0.98, isKeyTerm: true },
      { id: 'w12', text: 'graphs.', startMs: 5850, endMs: 6400, confidence: 0.99 },

      { id: 'w13', text: 'Remember,', startMs: 7000, endMs: 7600, confidence: 0.98 },
      { id: 'w14', text: 'in', startMs: 7650, endMs: 7800, confidence: 0.99 },
      { id: 'w15', text: 'the', startMs: 7820, endMs: 7980, confidence: 0.99 },
      { id: 'w16', text: 'forward', startMs: 8000, endMs: 8400, confidence: 0.98 },
      { id: 'w17', text: 'pass,', startMs: 8450, endMs: 8850, confidence: 0.99 },
      { id: 'w18', text: 'activations', startMs: 9100, endMs: 9900, confidence: 0.98, isKeyTerm: true },
      { id: 'w19', text: 'flow', startMs: 9950, endMs: 10300, confidence: 0.99 },
      { id: 'w20', text: 'from', startMs: 10350, endMs: 10600, confidence: 0.99 },
      { id: 'w21', text: 'input', startMs: 10650, endMs: 11100, confidence: 0.99 },
      { id: 'w22', text: 'vector', startMs: 11150, endMs: 11600, confidence: 0.99 },
      { id: 'w23', text: 'x', startMs: 11650, endMs: 11950, confidence: 0.99 },
      { id: 'w24', text: 'to', startMs: 12000, endMs: 12150, confidence: 0.99 },
      { id: 'w25', text: 'scalar', startMs: 12200, endMs: 12700, confidence: 0.97 },
      { id: 'w26', text: 'loss', startMs: 12750, endMs: 13200, confidence: 0.99, isKeyTerm: true },
      { id: 'w27', text: 'L.', startMs: 13250, endMs: 13800, confidence: 0.99 },

      { id: 'w28', text: 'Now', startMs: 14500, endMs: 14800, confidence: 0.99 },
      { id: 'w29', text: 'in', startMs: 14850, endMs: 15000, confidence: 0.99 },
      { id: 'w30', text: 'the', startMs: 15020, endMs: 15150, confidence: 0.99 },
      { id: 'w31', text: 'reverse', startMs: 15200, endMs: 15700, confidence: 0.98 },
      { id: 'w32', text: 'pass,', startMs: 15750, endMs: 16200, confidence: 0.99 },
      { id: 'w33', text: 'we', startMs: 16400, endMs: 16600, confidence: 0.99 },
      { id: 'w34', text: 'apply', startMs: 16650, endMs: 17100, confidence: 0.99 },
      { id: 'w35', text: 'the', startMs: 17150, endMs: 17300, confidence: 0.99 },
      { id: 'w36', text: 'multivariate', startMs: 17350, endMs: 18200, confidence: 0.97, isKeyTerm: true },
      { id: 'w37', text: 'chain', startMs: 18250, endMs: 18650, confidence: 0.99, isKeyTerm: true },
      { id: 'w38', text: 'rule.', startMs: 18700, endMs: 19300, confidence: 0.99 },

      // Misspeak sentence 1
      { id: 'w39', text: 'For', startMs: 20000, endMs: 20250, confidence: 0.99 },
      { id: 'w40', text: 'the', startMs: 20280, endMs: 20400, confidence: 0.99 },
      { id: 'w41', text: 'ReLU', startMs: 20450, endMs: 20900, confidence: 0.98, isKeyTerm: true },
      { id: 'w42', text: 'activation,', startMs: 20950, endMs: 21600, confidence: 0.99 },
      { id: 'w43', text: 'notice', startMs: 21800, endMs: 22200, confidence: 0.99 },
      { id: 'w44', text: 'that', startMs: 22250, endMs: 22450, confidence: 0.99 },
      { id: 'w45', text: 'its', startMs: 22500, endMs: 22700, confidence: 0.99 },
      { id: 'w46', text: 'derivative', startMs: 22750, endMs: 23400, confidence: 0.99 },
      { id: 'w47', text: 'when', startMs: 23450, endMs: 23750, confidence: 0.99 },
      { id: 'w48', text: 'x', startMs: 23800, endMs: 24000, confidence: 0.99 },
      { id: 'w49', text: 'is', startMs: 24050, endMs: 24200, confidence: 0.99 },
      { id: 'w50', text: 'negative', startMs: 24250, endMs: 24900, confidence: 0.99 },
      { id: 'w51', text: 'is', startMs: 24950, endMs: 25150, confidence: 0.99 },
      { id: 'w52', text: 'always', startMs: 25200, endMs: 25650, confidence: 0.98 },
      { id: 'w53', text: 'one.', startMs: 25700, endMs: 26300, confidence: 0.99, isFlaggedMisspeak: true, misspeakId: 'm1' },

      { id: 'w54', text: 'This', startMs: 27500, endMs: 27800, confidence: 0.99 },
      { id: 'w55', text: 'gradient', startMs: 27850, endMs: 28400, confidence: 0.99, isKeyTerm: true },
      { id: 'w56', text: 'gets', startMs: 28450, endMs: 28750, confidence: 0.99 },
      { id: 'w57', text: 'multiplied', startMs: 28800, endMs: 29500, confidence: 0.98 },
      { id: 'w58', text: 'by', startMs: 29550, endMs: 29750, confidence: 0.99 },
      { id: 'w59', text: 'the', startMs: 29800, endMs: 29950, confidence: 0.99 },
      { id: 'w60', text: 'incoming', startMs: 30000, endMs: 30550, confidence: 0.98 },
      { id: 'w61', text: 'upstream', startMs: 30600, endMs: 31200, confidence: 0.98, isKeyTerm: true },
      { id: 'w62', text: 'gradient', startMs: 31250, endMs: 31800, confidence: 0.99 },
      { id: 'w63', text: 'dL/dz.', startMs: 31850, endMs: 32600, confidence: 0.97, isKeyTerm: true },

      { id: 'w64', text: 'When', startMs: 33500, endMs: 33800, confidence: 0.99 },
      { id: 'w65', text: 'stacking', startMs: 33850, endMs: 34400, confidence: 0.98 },
      { id: 'w66', text: 'thirty', startMs: 34450, endMs: 34950, confidence: 0.99 },
      { id: 'w67', text: 'layers', startMs: 35000, endMs: 35500, confidence: 0.99 },
      { id: 'w68', text: 'together,', startMs: 35550, endMs: 36200, confidence: 0.99 },
      { id: 'w69', text: 'repeated', startMs: 36500, endMs: 37100, confidence: 0.98 },
      { id: 'w70', text: 'matrix', startMs: 37150, endMs: 37600, confidence: 0.99, isKeyTerm: true },
      { id: 'w71', text: 'multiplications', startMs: 37650, endMs: 38800, confidence: 0.96 },
      { id: 'w72', text: 'can', startMs: 38850, endMs: 39050, confidence: 0.99 },
      { id: 'w73', text: 'cause', startMs: 39100, endMs: 39450, confidence: 0.99 },
      { id: 'w74', text: 'eigenvalues', startMs: 39500, endMs: 40350, confidence: 0.98, isKeyTerm: true },
      { id: 'w75', text: 'to', startMs: 40400, endMs: 40550, confidence: 0.99 },
      { id: 'w76', text: 'vanish', startMs: 40600, endMs: 41200, confidence: 0.99 },
      { id: 'w77', text: 'or', startMs: 41250, endMs: 41450, confidence: 0.99 },
      { id: 'w78', text: 'explode.', startMs: 41500, endMs: 42200, confidence: 0.99 },

      // Misspeak sentence 2
      { id: 'w79', text: 'To', startMs: 43000, endMs: 43200, confidence: 0.99 },
      { id: 'w80', text: 'fix', startMs: 43250, endMs: 43500, confidence: 0.99 },
      { id: 'w81', text: 'vanishing', startMs: 43550, endMs: 44200, confidence: 0.99 },
      { id: 'w82', text: 'gradients,', startMs: 44250, endMs: 45000, confidence: 0.98 },
      { id: 'w83', text: 'Batch', startMs: 45200, endMs: 45600, confidence: 0.99, isKeyTerm: true },
      { id: 'w84', text: 'Normalization', startMs: 45650, endMs: 46600, confidence: 0.98, isKeyTerm: true },
      { id: 'w85', text: 'divides', startMs: 46700, endMs: 47200, confidence: 0.99 },
      { id: 'w86', text: 'by', startMs: 47250, endMs: 47450, confidence: 0.99 },
      { id: 'w87', text: 'the', startMs: 47500, endMs: 47650, confidence: 0.99 },
      { id: 'w88', text: 'standard', startMs: 47700, endMs: 48250, confidence: 0.99 },
      { id: 'w89', text: 'deviation', startMs: 48300, endMs: 48900, confidence: 0.99 },
      { id: 'w90', text: 'without', startMs: 48950, endMs: 49400, confidence: 0.98 },
      { id: 'w91', text: 'subtracting', startMs: 49450, endMs: 50100, confidence: 0.99, isFlaggedMisspeak: true, misspeakId: 'm2' },
      { id: 'w92', text: 'the', startMs: 50150, endMs: 50300, confidence: 0.99, isFlaggedMisspeak: true, misspeakId: 'm2' },
      { id: 'w93', text: 'mean.', startMs: 50350, endMs: 50900, confidence: 0.99, isFlaggedMisspeak: true, misspeakId: 'm2' },

      { id: 'w94', text: 'Lastly,', startMs: 52000, endMs: 52600, confidence: 0.99 },
      { id: 'w95', text: 'residual', startMs: 52700, endMs: 53300, confidence: 0.99, isKeyTerm: true },
      { id: 'w96', text: 'skip', startMs: 53350, endMs: 53750, confidence: 0.99 },
      { id: 'w97', text: 'connections', startMs: 53800, endMs: 54600, confidence: 0.98, isKeyTerm: true },
      { id: 'w98', text: 'allow', startMs: 54650, endMs: 55050, confidence: 0.99 },
      { id: 'w99', text: 'unimpeded', startMs: 55100, endMs: 55850, confidence: 0.96 },
      { id: 'w100', text: 'gradient', startMs: 55900, endMs: 56450, confidence: 0.99 },
      { id: 'w101', text: 'highway', startMs: 56500, endMs: 57100, confidence: 0.97 },
      { id: 'w102', text: 'superhighways', startMs: 57150, endMs: 58100, confidence: 0.95 },
      { id: 'w103', text: 'back', startMs: 58200, endMs: 58500, confidence: 0.99 },
      { id: 'w104', text: 'to', startMs: 58550, endMs: 58750, confidence: 0.99 },
      { id: 'w105', text: 'shallow', startMs: 58800, endMs: 59350, confidence: 0.98 },
      { id: 'w106', text: 'layers.', startMs: 59400, endMs: 60100, confidence: 0.99 }
    ],
    misspeaks: [
      {
        id: 'm1',
        spokenQuote: 'its derivative when x is negative is always one.',
        correctFact: 'd/dx ReLU(x) is 0 for x < 0, and 1 for x > 0 (undefined at 0, sub-gradient commonly chosen as 0).',
        citation: 'Deep Learning (Goodfellow et al.), Chapter 6, Section 6.3.1 (Activation Functions)',
        timestampMs: 25700,
        timeFormatted: '00:25',
        severity: 'correction'
      },
      {
        id: 'm2',
        spokenQuote: 'divides by the standard deviation without subtracting the mean.',
        correctFact: 'Batch Normalization explicitly centers by subtracting mini-batch mean: x̂ = (x - μ_B) / √(σ_B² + ε)',
        citation: 'Ioffe & Szegedy (2015) / CS-482 Syllabus Unit 3.4 (Normalization Techniques)',
        timestampMs: 50350,
        timeFormatted: '00:50',
        severity: 'correction'
      }
    ],
    diagrams: [
      {
        id: 'diag-backprop-flow',
        title: 'Tensor Computational Graph Flow',
        category: 'flowchart',
        mermaidCode: `graph LR
  X[Input Tensor X] --> W1[MatMul W1 + b1]
  W1 --> A1[ReLU Activation]
  A1 --> W2[MatMul W2 + b2]
  W2 --> Loss[Loss Function L]
  Loss -. "dL/dA1 (Upstream)" .-> A1
  A1 -. "dL/dW1 (Chain Rule)" .-> W1`,
        explanation: 'Forward pass evaluates activations in topological order; reverse pass routes gradient tensors via adjoint vector-Jacobian products.',
        skillNodeId: 'skill-chain-rule'
      },
      {
        id: 'diag-gradient-formula',
        title: 'Multivariate Matrix Gradient Formula',
        category: 'formula',
        latexCode: `\\frac{\\partial L}{\\partial W^{(l)}} = \\delta^{(l)} \\cdot \\left(a^{(l-1)}\\right)^T \\quad \\text{where} \\quad \\delta^{(l)} = \\left(W^{(l+1)}\\right)^T \\delta^{(l+1)} \\odot \\sigma'(z^{(l)})`,
        explanation: 'Local gradient calculation: Outer product between the error adjoint vector and preceding activation transpose.',
        skillNodeId: 'skill-matrix-adjoint'
      }
    ],
    syllabusNodes: [
      {
        id: 'skill-chain-rule',
        code: 'UNIT-3.1',
        name: 'Multivariate Chain Rule & Graph Adjoints',
        description: 'Derivation of reverse-mode automatic differentiation in tensor graphs',
        progressPercent: 92,
        status: 'covered',
        lecturesMapped: 3,
        misspeaksDetected: 1
      },
      {
        id: 'skill-matrix-adjoint',
        code: 'UNIT-3.2',
        name: 'Jacobian Products & Vector-Matrix Gradients',
        description: 'Matrix calculus dimensions and memory complexity of backprop caches',
        progressPercent: 78,
        status: 'in_progress',
        lecturesMapped: 2,
        misspeaksDetected: 0
      },
      {
        id: 'skill-batchnorm',
        code: 'UNIT-3.4',
        name: 'Batch & Layer Normalization Dynamics',
        description: 'Internal covariate shift mitigation, learnable scale γ and shift β parameters',
        progressPercent: 64,
        status: 'in_progress',
        lecturesMapped: 1,
        misspeaksDetected: 1
      },
      {
        id: 'skill-skip-connections',
        code: 'UNIT-3.6',
        name: 'Residual Highway & Degradation Resolution',
        description: 'Identity mappings preventing vanishing gradients across ultra-deep depth',
        progressPercent: 35,
        status: 'behind_schedule',
        lecturesMapped: 1,
        misspeaksDetected: 0
      }
    ],
    heatmaps: [
      { timestampSec: 4, timeFormatted: '00:04', rewindCount: 3, confusionIndex: 12, sentenceExcerpt: 'Today we are unraveling backpropagation across deep graphs.' },
      { timestampSec: 18, timeFormatted: '00:18', rewindCount: 14, confusionIndex: 48, sentenceExcerpt: 'Apply the multivariate chain rule across non-linear graph junctions.' },
      { timestampSec: 25, timeFormatted: '00:25', rewindCount: 34, confusionIndex: 92, sentenceExcerpt: 'ReLU derivative assertion (misspeak flagged by on-device RAG).' },
      { timestampSec: 38, timeFormatted: '00:38', rewindCount: 22, confusionIndex: 68, sentenceExcerpt: 'Repeated matrix multiplications cause eigenvalues to vanish or explode.' },
      { timestampSec: 50, timeFormatted: '00:50', rewindCount: 29, confusionIndex: 86, sentenceExcerpt: 'Batch norm standard deviation without mean centering (misspeak flagged).' },
      { timestampSec: 57, timeFormatted: '00:57', rewindCount: 9, confusionIndex: 30, sentenceExcerpt: 'Residual skip connections gradient highways back to shallow layers.' }
    ],
    attendance: [
      { studentId: 'std-101', name: 'Aarav Sharma', rollNo: '23CS014', checkInTime: '10:14:02', acousticHandshakeVerified: true, engagementScore: 94, status: 'Present' },
      { studentId: 'std-102', name: 'Devanshi Rao', rollNo: '23CS028', checkInTime: '10:14:18', acousticHandshakeVerified: true, engagementScore: 89, status: 'Present' },
      { studentId: 'std-103', name: 'Kavya Pillai', rollNo: '23CS035', checkInTime: '10:15:45', acousticHandshakeVerified: true, engagementScore: 91, status: 'Present' },
      { studentId: 'std-104', name: 'Rohan Mehra', rollNo: '23CS042', checkInTime: '10:18:10', acousticHandshakeVerified: true, engagementScore: 78, status: 'Late' },
      { studentId: 'std-105', name: 'Zainab Fatima', rollNo: '23CS059', checkInTime: '10:13:50', acousticHandshakeVerified: true, engagementScore: 96, status: 'Present' },
      { studentId: 'std-106', name: 'Tanmay Joshi', rollNo: '23CS067', checkInTime: '10:14:55', acousticHandshakeVerified: true, engagementScore: 85, status: 'Present' }
    ],
    sections: [
      {
        id: 'sec-cs-1',
        title: 'Forward Pass & Computational Graphs',
        startMs: 0,
        endMs: 19500,
        timeRangeFormatted: '00:00 - 00:19',
        description: 'Topology of deep feedforward directed acyclic graphs, activation flow from input vector x to scalar loss L.',
        keyTerms: ['Backpropagation', 'Computational Graphs', 'Forward Pass', 'Scalar Loss L']
      },
      {
        id: 'sec-cs-2',
        title: 'Multivariate Chain Rule & ReLU Derivatives',
        startMs: 19500,
        endMs: 39500,
        timeRangeFormatted: '00:19 - 00:39',
        description: 'Reverse-mode auto-differentiation, local Jacobian tensors, ReLU piecewise derivative zeroing (d/dx = 0 for x < 0), and dying ReLU mitigation.',
        keyTerms: ['Multivariate Chain Rule', 'ReLU Activation', 'Local Gradient', 'Dying ReLU']
      },
      {
        id: 'sec-cs-3',
        title: 'Vanishing Gradients & ResNet Skip Highways',
        startMs: 39500,
        endMs: 54000,
        timeRangeFormatted: '00:39 - 00:54',
        description: 'Repeated matrix multiplications causing eigenvalue decay across depth; residual identity mappings F(x) + x providing an additive +1 gradient highway.',
        keyTerms: ['Vanishing Gradient', 'Residual Skip Connection', 'Identity Shortcut', 'ResNet']
      },
      {
        id: 'sec-cs-4',
        title: 'Batch Normalization & Covariate Shift',
        startMs: 54000,
        endMs: 72000,
        timeRangeFormatted: '00:54 - 01:12',
        description: 'Mini-batch distribution stabilization via mini-batch mean μ_B and variance σ_B² standardization with learnable affine parameters γ and β.',
        keyTerms: ['Batch Normalization', 'Internal Covariate Shift', 'Mini-batch Mean', 'Scale & Shift']
      }
    ]
  },
  {
    id: 'phys-thermo-14',
    title: 'Carnot Cycles, Reversibility & Statistical Entropy',
    courseCode: 'PHY-210',
    courseName: 'Applied Thermodynamics',
    instructor: 'Dr. Marcus Vance, FInstP',
    date: 'Yesterday, 02:00 PM',
    durationMs: 65000,
    overview: 'Second Law formulation, Carnot engine maximum theoretical thermal efficiency, Clausius inequality, and microstate multiplicity in isolated ensembles.',
    words: [
      { id: 'pw1', text: 'Welcome', startMs: 0, endMs: 450, confidence: 0.99 },
      { id: 'pw2', text: 'class.', startMs: 500, endMs: 900, confidence: 0.99 },
      { id: 'pw3', text: 'Today', startMs: 1100, endMs: 1400, confidence: 0.98 },
      { id: 'pw4', text: 'we', startMs: 1450, endMs: 1650, confidence: 0.99 },
      { id: 'pw5', text: 'quantify', startMs: 1700, endMs: 2300, confidence: 0.97 },
      { id: 'pw6', text: 'the', startMs: 2350, endMs: 2500, confidence: 0.99 },
      { id: 'pw7', text: 'Second', startMs: 2550, endMs: 2950, confidence: 0.99, isKeyTerm: true },
      { id: 'pw8', text: 'Law', startMs: 3000, endMs: 3350, confidence: 0.99, isKeyTerm: true },
      { id: 'pw9', text: 'of', startMs: 3400, endMs: 3550, confidence: 0.99 },
      { id: 'pw10', text: 'Thermodynamics.', startMs: 3600, endMs: 4600, confidence: 0.99, isKeyTerm: true },

      { id: 'pw11', text: 'In', startMs: 5200, endMs: 5400, confidence: 0.99 },
      { id: 'pw12', text: 'an', startMs: 5450, endMs: 5650, confidence: 0.99 },
      { id: 'pw13', text: 'idealized', startMs: 5700, endMs: 6300, confidence: 0.98 },
      { id: 'pw14', text: 'Carnot', startMs: 6350, endMs: 6850, confidence: 0.99, isKeyTerm: true },
      { id: 'pw15', text: 'engine,', startMs: 6900, endMs: 7500, confidence: 0.99 },
      { id: 'pw16', text: 'two', startMs: 7800, endMs: 8100, confidence: 0.99 },
      { id: 'pw17', text: 'isothermal', startMs: 8150, endMs: 8900, confidence: 0.98, isKeyTerm: true },
      { id: 'pw18', text: 'processes', startMs: 8950, endMs: 9600, confidence: 0.99 },
      { id: 'pw19', text: 'alternate', startMs: 9650, endMs: 10200, confidence: 0.98 },
      { id: 'pw20', text: 'with', startMs: 10250, endMs: 10500, confidence: 0.99 },
      { id: 'pw21', text: 'two', startMs: 10550, endMs: 10850, confidence: 0.99 },
      { id: 'pw22', text: 'adiabatic', startMs: 10900, endMs: 11650, confidence: 0.99, isKeyTerm: true },
      { id: 'pw23', text: 'stages.', startMs: 11700, endMs: 12400, confidence: 0.99 },

      // Misspeak sentence
      { id: 'pw24', text: 'Notice', startMs: 13200, endMs: 13600, confidence: 0.99 },
      { id: 'pw25', text: 'that', startMs: 13650, endMs: 13850, confidence: 0.99 },
      { id: 'pw26', text: 'in', startMs: 13900, endMs: 14100, confidence: 0.99 },
      { id: 'pw27', text: 'an', startMs: 14150, endMs: 14300, confidence: 0.99 },
      { id: 'pw28', text: 'isolated', startMs: 14350, endMs: 15000, confidence: 0.99, isKeyTerm: true },
      { id: 'pw29', text: 'system,', startMs: 15050, endMs: 15650, confidence: 0.99 },
      { id: 'pw30', text: 'total', startMs: 15900, endMs: 16300, confidence: 0.99 },
      { id: 'pw31', text: 'entropy', startMs: 16350, endMs: 17000, confidence: 0.99, isKeyTerm: true },
      { id: 'pw32', text: 'always', startMs: 17050, endMs: 17500, confidence: 0.99 },
      { id: 'pw33', text: 'decreases', startMs: 17550, endMs: 18350, confidence: 0.98, isFlaggedMisspeak: true, misspeakId: 'pm1' },
      { id: 'pw34', text: 'over', startMs: 18400, endMs: 18700, confidence: 0.99, isFlaggedMisspeak: true, misspeakId: 'pm1' },
      { id: 'pw35', text: 'time.', startMs: 18750, endMs: 19300, confidence: 0.99, isFlaggedMisspeak: true, misspeakId: 'pm1' },

      { id: 'pw36', text: 'The', startMs: 20200, endMs: 20400, confidence: 0.99 },
      { id: 'pw37', text: 'Carnot', startMs: 20450, endMs: 20950, confidence: 0.99 },
      { id: 'pw38', text: 'efficiency', startMs: 21000, endMs: 21700, confidence: 0.99, isKeyTerm: true },
      { id: 'pw39', text: 'depends', startMs: 21750, endMs: 22250, confidence: 0.99 },
      { id: 'pw40', text: 'solely', startMs: 22300, endMs: 22750, confidence: 0.98 },
      { id: 'pw41', text: 'on', startMs: 22800, endMs: 22950, confidence: 0.99 },
      { id: 'pw42', text: 'absolute', startMs: 23000, endMs: 23550, confidence: 0.99 },
      { id: 'pw43', text: 'temperatures', startMs: 23600, endMs: 24450, confidence: 0.98 },
      { id: 'pw44', text: 'T_cold', startMs: 24500, endMs: 25150, confidence: 0.98 },
      { id: 'pw45', text: 'and', startMs: 25200, endMs: 25400, confidence: 0.99 },
      { id: 'pw46', text: 'T_hot.', startMs: 25450, endMs: 26100, confidence: 0.98 }
    ],
    misspeaks: [
      {
        id: 'pm1',
        spokenQuote: 'total entropy always decreases over time.',
        correctFact: 'Second Law of Thermodynamics: ΔS_total ≥ 0. Entropy in an isolated system never decreases; it increases in spontaneous processes and remains constant in reversible ones.',
        citation: 'University Physics (Young & Freedman), Vol. 1, Chapter 20 (The Second Law)',
        timestampMs: 18350,
        timeFormatted: '00:18',
        severity: 'correction'
      }
    ],
    diagrams: [
      {
        id: 'diag-carnot-pv',
        title: 'Carnot P-V Cycle State Transitions',
        category: 'flowchart',
        mermaidCode: `graph TD
  State1[1: Isothermal Expansion Th] --> State2[2: Adiabatic Expansion]
  State2 --> State3[3: Isothermal Compression Tc]
  State3 --> State4[4: Adiabatic Compression]
  State4 --> State1`,
        explanation: 'Closed loop on Pressure-Volume diagram; enclosed area equals net work output W_net.',
        skillNodeId: 'skill-carnot-efficiency'
      },
      {
        id: 'diag-clausius-formula',
        title: 'Carnot Efficiency & Clausius Inequality',
        category: 'formula',
        latexCode: `\\eta_{\\text{Carnot}} = 1 - \\frac{T_{\\text{cold}}}{T_{\\text{hot}}} \\qquad \\oint \\frac{\\delta Q}{T} \\le 0`,
        explanation: 'Upper theoretical bound for any thermal heat engine operating between two thermal reservoirs.',
        skillNodeId: 'skill-carnot-efficiency'
      }
    ],
    syllabusNodes: [
      {
        id: 'skill-carnot-efficiency',
        code: 'PHY-2.1',
        name: 'Carnot Efficiency Limits & Heat Reservoirs',
        description: 'Derivation of maximum theoretical efficiency η = 1 - Tc/Th',
        progressPercent: 95,
        status: 'covered',
        lecturesMapped: 4,
        misspeaksDetected: 0
      },
      {
        id: 'skill-entropy-secondlaw',
        code: 'PHY-2.2',
        name: 'Clausius Inequality & Entropy Non-decrease',
        description: 'Microscopic entropy S = k_B ln(Ω) and macroscopic heat integrals',
        progressPercent: 68,
        status: 'in_progress',
        lecturesMapped: 2,
        misspeaksDetected: 1
      }
    ],
    heatmaps: [
      { timestampSec: 3, timeFormatted: '00:03', rewindCount: 2, confusionIndex: 10, sentenceExcerpt: 'Quantify the Second Law of Thermodynamics.' },
      { timestampSec: 10, timeFormatted: '00:10', rewindCount: 11, confusionIndex: 42, sentenceExcerpt: 'Isothermal processes alternate with adiabatic stages.' },
      { timestampSec: 18, timeFormatted: '00:18', rewindCount: 38, confusionIndex: 96, sentenceExcerpt: 'Total entropy decreases assertion (flagged misspeak).' },
      { timestampSec: 25, timeFormatted: '00:25', rewindCount: 15, confusionIndex: 51, sentenceExcerpt: 'Carnot efficiency formulation 1 - Tcold/Thot.' }
    ],
    attendance: [
      { studentId: 'std-201', name: 'Ishaan Verma', rollNo: '23PH005', checkInTime: '13:58:12', acousticHandshakeVerified: true, engagementScore: 97, status: 'Present' },
      { studentId: 'std-202', name: 'Simran Kaur', rollNo: '23PH019', checkInTime: '13:59:30', acousticHandshakeVerified: true, engagementScore: 93, status: 'Present' }
    ],
    sections: [
      {
        id: 'sec-phy-1',
        title: 'Second Law Formulation & Heat Reservoirs',
        startMs: 0,
        endMs: 22000,
        timeRangeFormatted: '00:00 - 00:22',
        description: 'Kelvin-Planck & Clausius statements, unidirectional spontaneous heat transfer from hot reservoir Th to cold reservoir Tc.',
        keyTerms: ['Second Law', 'Thermal Reservoirs', 'Kelvin-Planck', 'Isothermal Expansion']
      },
      {
        id: 'sec-phy-2',
        title: 'Carnot Heat Engine & Reversibility Criteria',
        startMs: 22000,
        endMs: 44000,
        timeRangeFormatted: '00:22 - 00:44',
        description: 'Idealized 4-stage reversible cycle, Carnot theorem, upper theoretical efficiency bound η = 1 - (Tc/Th).',
        keyTerms: ['Carnot Cycle', 'Reversible Engine', 'Thermal Efficiency', 'Adiabatic Compression']
      },
      {
        id: 'sec-phy-3',
        title: 'Clausius Inequality & Microstate Multiplicity',
        startMs: 44000,
        endMs: 65000,
        timeRangeFormatted: '00:44 - 01:05',
        description: 'Cyclic line integral ∮ dQ/T ≤ 0, statistical definition of entropy S = k_B ln(Ω) and monotonic non-decrease in isolated systems.',
        keyTerms: ['Clausius Inequality', 'Statistical Entropy', 'Microstate Multiplicity Ω', 'Isolated Ensembles']
      }
    ]
  }
];

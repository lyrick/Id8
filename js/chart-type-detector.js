/**
 * 图表类型自动检测器
 * 根据用户输入的代码自动识别应该使用哪种图表类型
 */

class ChartTypeDetector {
    constructor() {
        // 各种图表类型的特征模式
        this.patterns = {
            // Mermaid图表类型
            'flowchart': {
                regex: /^\s*(graph|flowchart)\s+(TD|BT|RL|LR|TB)/i,
                priority: 10
            },
            'sequence': {
                regex: /^\s*sequenceDiagram/i,
                priority: 10
            },
            'state': {
                regex: /^\s*stateDiagram(-v2)?/i,
                priority: 10
            },
            'class': {
                regex: /^\s*classDiagram(-v2)?/i,
                priority: 10
            },
            'gantt': {
                regex: /^\s*gantt/i,
                priority: 10
            },
            'pie': {
                regex: /^\s*pie(\s+showData)?/i,
                priority: 10
            },
            'er': {
                regex: /^\s*erDiagram/i,
                priority: 10
            },
            'journey': {
                regex: /^\s*journey/i,
                priority: 10
            },
            
            // PlantUML图表类型
            'usecase': {
                regex: /^\s*@startuml[\s\S]*?\b(usecase|actor)\b/i,
                priority: 5
            },
            'activity': {
                regex: /^\s*@startuml[\s\S]*?\b(start|\*\s*-->|partition|if|endif|fork|end fork)\b/i,
                priority: 5
            },
            'component': {
                regex: /^\s*@startuml[\s\S]*?\b(component|interface|package|node)\b/i,
                priority: 5
            },
            
            // Graphviz图表类型
            'digraph': {
                regex: /^\s*digraph\s+\w+\s*\{/i,
                priority: 5
            },
            'graph': {
                regex: /^\s*graph\s+\w+\s*\{/i,
                priority: 5
            },
            'strict': {
                regex: /^\s*strict\s+(digraph|graph)\s+\w+\s*\{/i,
                priority: 5
            },
            
            // MathJax
            'math': {
                regex: /^\s*\\begin\{(equation|align|matrix|pmatrix|bmatrix|vmatrix)\}/i,
                priority: 5
            }
        };
        
        // 关键词匹配模式 - 用于二次判断
        this.keywordPatterns = {
            'flowchart': ['-->','-->', '-->|', '-.->'],
            'sequence': ['->>', '-->>', '->', 'note', 'participant', 'actor'],
            'state': ['state', '[*]', '-->', 'note'],
            'class': ['class', '<|--', '*--', 'o--'],
            'gantt': ['section', 'dateFormat', 'axisFormat', 'title'],
            'pie': ['title', 'showData'],
            'er': ['entity', 'relationship', '||--o{'],
            'journey': ['section', 'title', 'task'],
            'usecase': ['actor', 'usecase', '-->'],
            'activity': ['start', 'stop', 'if', 'then', 'else'],
            'component': ['component', 'interface', '[', ']'],
            'digraph': ['->', 'node', 'edge', 'subgraph'],
            'graph': ['--', 'node', 'edge', 'subgraph'],
            'math': ['\\frac', '\\sum', '\\int', '\\alpha', '\\beta']
        };
    }
    
    /**
     * 检测代码对应的图表类型
     * @param {string} code - 用户输入的代码
     * @param {string} activeRenderer - 当前活动的渲染器
     * @returns {string} 检测到的图表类型ID
     */
    detect(code, activeRenderer) {
        if (!code || typeof code !== 'string') {
            // 如果没有代码或不是字符串，返回默认类型
            return 'flowchart';
        }
        
        // 存储匹配结果
        const matches = [];
        
        // 首先使用正则表达式进行匹配
        for (const [typeId, pattern] of Object.entries(this.patterns)) {
            if (pattern.regex.test(code)) {
                matches.push({
                    typeId,
                    priority: pattern.priority,
                    score: 100 // 正则完全匹配给予高分
                });
            }
        }
        
        // 如果没有正则匹配，使用关键词匹配
        if (matches.length === 0) {
            for (const [typeId, keywords] of Object.entries(this.keywordPatterns)) {
                let score = 0;
                keywords.forEach(keyword => {
                    if (code.includes(keyword)) {
                        score += 10; // 每个关键词匹配加10分
                    }
                });
                
                if (score > 0) {
                    matches.push({
                        typeId,
                        priority: this.patterns[typeId]?.priority || 5,
                        score
                    });
                }
            }
        }
        
        // 如果仍然没有匹配，根据当前渲染器返回默认类型
        if (matches.length === 0) {
            return this.getDefaultTypeForRenderer(activeRenderer);
        }
        
        // 按优先级和分数排序
        matches.sort((a, b) => {
            // 首先按优先级排序
            if (b.priority !== a.priority) {
                return b.priority - a.priority;
            }
            // 然后按分数排序
            return b.score - a.score;
        });
        
        // 返回最匹配的类型
        return matches[0].typeId;
    }
    
    /**
     * 获取指定渲染器的默认图表类型
     * @param {string} renderer - 渲染器ID
     * @returns {string} 默认图表类型ID
     */
    getDefaultTypeForRenderer(renderer) {
        const defaults = {
            'mermaid': 'flowchart',
            'plantuml': 'sequence',
            'graphviz': 'digraph',
            'mathjax': 'math',
            'flowchartjs': 'flowchart'
        };
        
        return defaults[renderer] || 'flowchart';
    }
}

// 创建全局实例
const chartTypeDetector = new ChartTypeDetector();
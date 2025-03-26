/**
 * 渲染器管理器
 * 用于管理和调用不同的图表渲染器
 */

class RendererManager {
    constructor() {
        this.renderers = {};
        this.activeRenderer = 'mermaid';
        this.registerDefaultRenderers();
        this.cdnSources = {
            primary: 'https://cdn.jsdelivr.net/npm/',
            backup: 'https://unpkg.com/'
        };
        this.loadRetries = {}; // 记录加载重试次数
    }

    /**
     * 注册默认的渲染器
     */
    registerDefaultRenderers() {
        // 注册Mermaid渲染器
        this.register('mermaid', {
            render: this.renderMermaid,
            init: () => {
                // Mermaid已通过CDN加载
                mermaid.initialize({
                    startOnLoad: false,
                    theme: 'default',
                    securityLevel: 'loose',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                    gantt: {
                        // 确保甘特图日期格式正确
                        dateFormat: 'YYYY-MM-DD',
                        axisFormat: '%Y-%m-%d',
                        // 禁用里程碑特殊处理，避免日期格式错误
                        displayMode: 'compact'
                    }
                });
                return Promise.resolve();
            },
            isLoaded: () => typeof mermaid !== 'undefined',
            supportedTypes: [
                { id: 'flowchart', name: '流程图', description: '用于展示业务流程或操作步骤' },
                { id: 'sequence', name: '时序图', description: '用于展示系统组件之间的交互' },
                { id: 'state', name: '状态图', description: '用于展示状态转换' },
                { id: 'class', name: '类图', description: '用于表示类及其关系' },
                { id: 'gantt', name: '甘特图', description: '用于项目计划和时间管理' },
                { id: 'pie', name: '饼图', description: '用于数据可视化' },
                { id: 'er', name: 'ER图', description: '用于展示实体关系' },
                { id: 'journey', name: '用户旅程图', description: '用于展示用户体验流程' }
            ]
        });

        // 注册PlantUML渲染器
        this.register('plantuml', {
            render: this.renderPlantUML,
            init: () => {
                // 动态加载PlantUML渲染器
                return this.loadScript('plantuml-encoder@1.4.0/dist/plantuml-encoder.min.js')
                    .then(() => {
                        console.log('PlantUML encoder loaded');
                        // 使用备用方法渲染，不再依赖plantuml-viewer
                        return Promise.resolve();
                    });
            },
            isLoaded: () => typeof plantumlEncoder !== 'undefined',
            supportedTypes: [
                { id: 'class', name: '类图', description: '用于表示类及其关系' },
                { id: 'sequence', name: '时序图', description: '用于展示系统组件之间的交互' },
                { id: 'usecase', name: '用例图', description: '用于展示用户与系统的交互' },
                { id: 'activity', name: '活动图', description: '用于展示活动流程' },
                { id: 'component', name: '组件图', description: '用于展示系统组件' },
                { id: 'state', name: '状态图', description: '用于展示状态转换' }
            ]
        });

        // 注册Graphviz渲染器
        this.register('graphviz', {
            render: this.renderGraphviz,
            init: () => {
                // 动态加载Graphviz渲染器
                // 先加载D3核心库，然后加载WASM，最后加载d3-graphviz
                return this.loadScript('d3@7.8.5/dist/d3.min.js')
                    .then(() => this.loadScript('@hpcc-js/wasm@1.14.1/dist/index.min.js'))
                    .then(() => this.loadScript('d3-graphviz@4.0.0/build/d3-graphviz.min.js'));
            },
            isLoaded: () => typeof d3 !== 'undefined' && typeof d3.graphviz !== 'undefined',
            supportedTypes: [
                { id: 'digraph', name: '有向图', description: '用于展示有向关系' },
                { id: 'graph', name: '无向图', description: '用于展示无向关系' },
                { id: 'strict', name: '严格图', description: '不允许多重边的图' }
            ]
        });

        // 注册MathJax渲染器
        this.register('mathjax', {
            render: this.renderMathJax,
            init: () => {
                // 动态加载MathJax渲染器
                return new Promise((resolve) => {
                    if (typeof MathJax !== 'undefined') {
                        // 确保MathJax已完全加载并初始化
                        if (typeof MathJax.typesetPromise === 'function') {
                            resolve();
                            return;
                        }
                    }
                    
                    window.MathJax = {
                        tex: {
                            inlineMath: [['$', '$'], ['\\(', '\\)']],
                            displayMath: [['$$', '$$'], ['\\[', '\\]']],
                            processEscapes: true
                        },
                        svg: { fontCache: 'global' },
                        startup: { ready: () => { resolve(); } }
                    };
                    
                    this.loadScript('mathjax@3/es5/tex-svg.js');
                });
            },
            isLoaded: () => typeof MathJax !== 'undefined' && typeof MathJax.typesetPromise === 'function',
            supportedTypes: [
                { id: 'math', name: '数学公式', description: '用于展示数学表达式' }
            ]
        });

        // 注册Flowchart.js渲染器
        this.register('flowchartjs', {
            render: this.renderFlowchartJS,
            init: () => {
                // 动态加载Flowchart.js渲染器
                return this.loadScript('raphael@2.3.0/raphael.min.js')
                    .then(() => this.loadScript('flowchart.js@1.15.0/release/flowchart.min.js'));
            },
            isLoaded: () => typeof flowchart !== 'undefined',
            supportedTypes: [
                { id: 'flowchart', name: '简单流程图', description: '用于展示简单的流程' }
            ]
        });
    }

    /**
     * 注册新的渲染器
     * @param {string} name - 渲染器名称
     * @param {object} renderer - 渲染器对象
     */
    register(name, renderer) {
        this.renderers[name] = renderer;
    }

    /**
     * 获取当前活动的渲染器
     * @returns {object} 当前活动的渲染器
     */
    getActiveRenderer() {
        return this.renderers[this.activeRenderer];
    }

    /**
     * 设置当前活动的渲染器
     * @param {string} name - 渲染器名称
     */
    setActiveRenderer(name) {
        if (this.renderers[name]) {
            this.activeRenderer = name;
            return true;
        }
        return false;
    }

    /**
     * 获取所有支持的渲染器
     * @returns {Array} 渲染器列表
     */
    getRenderers() {
        return Object.keys(this.renderers).map(key => ({
            id: key,
            name: this.getRendererDisplayName(key),
            supportedTypes: this.renderers[key].supportedTypes || []
        }));
    }

    /**
     * 获取渲染器显示名称
     * @param {string} rendererId - 渲染器ID
     * @returns {string} 渲染器显示名称
     */
    getRendererDisplayName(rendererId) {
        const displayNames = {
            'mermaid': 'Mermaid',
            'plantuml': 'PlantUML',
            'graphviz': 'Graphviz',
            'mathjax': 'MathJax',
            'flowchartjs': 'Flowchart.js'
        };
        return displayNames[rendererId] || rendererId;
    }

    /**
     * 初始化指定的渲染器
     * @param {string} name - 渲染器名称
     * @returns {Promise} 初始化完成的Promise
     */
    initRenderer(name) {
        const renderer = this.renderers[name];
        if (!renderer) {
            return Promise.reject(new Error(`渲染器 ${name} 不存在`));
        }

        // 如果渲染器已加载，直接返回成功
        if (renderer.isLoaded()) {
            console.log(`渲染器 ${name} 已加载，无需初始化`);
            return Promise.resolve();
        }

        console.log(`开始初始化渲染器 ${name}...`);
        // 添加超时处理，避免无限等待
        return Promise.race([
            renderer.init()
                .then(() => {
                    console.log(`渲染器 ${name} 初始化成功`);
                    return Promise.resolve();
                })
                .catch(error => {
                    console.error(`渲染器 ${name} 初始化失败:`, error);
                    // 如果是主要CDN源失败，尝试使用备用源
                    if (this.cdnSources.backup && !this.loadRetries[name]) {
                        this.loadRetries[name] = true;
                        console.log(`尝试使用备用CDN源加载渲染器 ${name}...`);
                        // 交换主备CDN源
                        const temp = this.cdnSources.primary;
                        this.cdnSources.primary = this.cdnSources.backup;
                        this.cdnSources.backup = temp;
                        // 重试初始化
                        return renderer.init();
                    }
                    throw error;
                }),
            new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`初始化渲染器 ${name} 超时，请刷新页面重试`));
                }, 15000); // 15秒超时
            })
        ]).catch(error => {
            console.error(`初始化渲染器 ${name} 失败:`, error);
            
            // 如果是Mermaid渲染器失败，这是严重错误，直接抛出
            if (name === 'mermaid') {
                throw error;
            }
            
            // 对于其他渲染器，提供降级选项
            if (name !== 'mermaid' && this.renderers['mermaid'] && this.renderers['mermaid'].isLoaded()) {
                console.warn(`渲染器 ${name} 加载失败，将尝试使用Mermaid渲染器`);
                this.activeRenderer = 'mermaid';
                return Promise.resolve();
            }
            
            // 如果没有可用的降级选项，抛出错误
            throw error;
        });
    }

    /**
     * 渲染图表
     * @param {string} code - 图表代码
     * @param {string} container - 容器元素ID
     * @returns {Promise} 渲染完成的Promise
     */
    render(code, container) {
        const renderer = this.getActiveRenderer();
        if (!renderer) {
            return Promise.reject(new Error(`渲染器 ${this.activeRenderer} 不存在`));
        }

        // 确保渲染器已初始化
        if (!renderer.isLoaded()) {
            console.log(`渲染器 ${this.activeRenderer} 未加载，正在初始化...`);
            return this.initRenderer(this.activeRenderer)
                .then(() => {
                    console.log(`渲染器 ${this.activeRenderer} 初始化成功，开始渲染`);
                    // 确保渲染器已正确加载
                    if (!renderer.isLoaded()) {
                        throw new Error(`渲染器 ${this.activeRenderer} 未正确加载`);
                    }
                    return renderer.render(code, container, this);
                })
                .catch(error => {
                    console.error(`渲染失败:`, error);
                    
                    // 如果当前渲染器不是Mermaid，尝试使用Mermaid作为备选
                    if (this.activeRenderer !== 'mermaid' && 
                        this.renderers['mermaid'] && 
                        this.renderers['mermaid'].isLoaded()) {
                        
                        console.warn(`尝试使用Mermaid作为备选渲染器`);
                        this.activeRenderer = 'mermaid';
                        
                        // 递归调用，但限制递归深度为1，避免无限循环
                        return this.renderers['mermaid'].render(code, container, this);
                    }
                    
                    throw error;
                });
        }
        
        return renderer.render(code, container, this);
    }

    /**
     * 加载外部脚本
     * @param {string} url - 脚本URL
     * @returns {Promise} 加载完成的Promise
     */
    loadScript(url) {
        // 如果URL不是完整的URL，添加CDN前缀
        const fullUrl = url.startsWith('http') ? url : this.cdnSources.primary + url;
        const backupUrl = url.startsWith('http') ? url.replace('jsdelivr.net', 'unpkg.com') : this.cdnSources.backup + url;
        
        // 初始化重试计数
        if (!this.loadRetries[url]) {
            this.loadRetries[url] = 0;
        }
        
        return new Promise((resolve, reject) => {
            // 检查脚本是否已加载
            const existingScript = document.querySelector(`script[src="${fullUrl}"]`) || 
                                   document.querySelector(`script[src="${backupUrl}"]`);
            if (existingScript) {
                // 脚本已存在，直接返回成功
                return resolve();
            }
            
            const script = document.createElement('script');
            // 根据重试次数选择URL
            script.src = this.loadRetries[url] === 0 ? fullUrl : backupUrl;
            script.async = true;
            
            // 设置超时处理
            const timeout = setTimeout(() => {
                console.warn(`加载脚本超时: ${script.src}，尝试备用源`);
                this.loadRetries[url]++;
                
                if (this.loadRetries[url] < 2) {
                    // 清除当前脚本
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                    // 重试加载
                    clearTimeout(timeout);
                    this.loadScript(url).then(resolve).catch(reject);
                } else {
                    reject(new Error(`加载脚本超时: ${url}`));
                }
            }, 8000); // 8秒超时
            
            script.onload = () => {
                clearTimeout(timeout);
                resolve();
            };
            
            script.onerror = () => {
                clearTimeout(timeout);
                console.warn(`无法加载脚本: ${script.src}，尝试备用源`);
                this.loadRetries[url]++;
                
                if (this.loadRetries[url] < 2) {
                    // 清除当前脚本
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                    // 重试加载
                    this.loadScript(url).then(resolve).catch(reject);
                } else {
                    reject(new Error(`无法加载脚本: ${url}`));
                }
            };
            
            document.head.appendChild(script);
        });
    }

    /**
     * 渲染Mermaid图表
     * @param {string} code - 图表代码
     * @param {string} container - 容器元素ID
     * @returns {Promise} 渲染完成的Promise
     */
    renderMermaid(code, container) {
        return mermaid.render(`mermaid-svg-${Date.now()}`, code)
            .then(result => {
                document.getElementById(container).innerHTML = result.svg;
                return result;
            });
    }

    /**
     * 渲染PlantUML图表
     * @param {string} code - 图表代码
     * @param {string} container - 容器元素ID
     * @returns {Promise} 渲染完成的Promise
     */
    renderPlantUML(code, container) {
        try {
            const encoded = plantumlEncoder.encode(code);
            const url = `https://www.plantuml.com/plantuml/svg/${encoded}`;
            
            return new Promise((resolve) => {
                const containerEl = document.getElementById(container);
                containerEl.innerHTML = `<img src="${url}" alt="PlantUML Diagram" style="max-width:100%">`;
                resolve({ svg: containerEl.innerHTML });
            });
        } catch (error) {
            console.error('PlantUML渲染错误:', error);
            return Promise.reject(new Error('PlantUML渲染失败: ' + error.message));
        }
    }

    /**
     * 渲染Graphviz图表
     * @param {string} code - 图表代码
     * @param {string} container - 容器元素ID
     * @returns {Promise} 渲染完成的Promise
     */
    renderGraphviz(code, container) {
        return new Promise((resolve, reject) => {
            try {
                const containerEl = document.getElementById(container);
                containerEl.innerHTML = '';
                
                // 检查d3是否正确加载
                if (typeof d3 === 'undefined' || typeof d3.graphviz === 'undefined') {
                    throw new Error('Graphviz库未正确加载，请刷新页面重试');
                }
                
                // 添加错误处理
                try {
                    d3.select(`#${container}`)
                        .graphviz()
                        .renderDot(code)
                        .on('end', () => {
                            resolve({ svg: containerEl.innerHTML });
                        })
                        .on('error', (error) => {
                            reject(new Error('Graphviz渲染错误: ' + error));
                        });
                } catch (error) {
                    throw new Error('Graphviz渲染失败: ' + error.message);
                }
            } catch (error) {
                console.error('Graphviz渲染错误:', error);
                reject(error);
            }
        });
    }

    /**
     * 渲染MathJax公式
     * @param {string} code - 公式代码
     * @param {string} container - 容器元素ID
     * @returns {Promise} 渲染完成的Promise
     */
    renderMathJax(code, container) {
        return new Promise((resolve, reject) => {
            try {
                const containerEl = document.getElementById(container);
                containerEl.innerHTML = `$$${code}$$`;
                
                // 检查MathJax是否正确加载
                if (typeof MathJax === 'undefined' || typeof MathJax.typesetPromise !== 'function') {
                    // 降级处理：使用简单的HTML渲染
                    containerEl.innerHTML = `<div style="text-align:center; padding:10px; font-style:italic;">$$${code}$$</div>`;
                    resolve({ svg: containerEl.innerHTML });
                    return;
                }
                
                MathJax.typesetPromise([containerEl])
                    .then(() => {
                        resolve({ svg: containerEl.innerHTML });
                    })
                    .catch(error => {
                        console.error('MathJax渲染错误:', error);
                        reject(new Error('MathJax渲染失败: ' + error.message));
                    });
            } catch (error) {
                console.error('MathJax渲染错误:', error);
                reject(error);
            }
        });
    }

    /**
     * 渲染Flowchart.js图表
     * @param {string} code - 图表代码
     * @param {string} container - 容器元素ID
     * @returns {Promise} 渲染完成的Promise
     */
    renderFlowchartJS(code, container) {
        return new Promise((resolve, reject) => {
            try {
                const containerEl = document.getElementById(container);
                containerEl.innerHTML = '';
                
                // 检查flowchart是否正确加载
                if (typeof flowchart === 'undefined') {
                    throw new Error('Flowchart.js库未正确加载，请刷新页面重试');
                }
                
                try {
                    const diagram = flowchart.parse(code);
                    diagram.drawSVG(container);
                    resolve({ svg: containerEl.innerHTML });
                } catch (error) {
                    throw new Error('Flowchart.js解析错误: ' + error.message);
                }
            } catch (error) {
                console.error('Flowchart.js渲染错误:', error);
                reject(error);
            }
        });
    }
}

// 创建全局渲染器管理器实例
const rendererManager = new RendererManager();
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
                    flowchart: {
                        // 美化流程图样式
                        curve: 'basis', // 使用平滑曲线
                        diagramPadding: 20,
                        htmlLabels: true,
                        nodeSpacing: 50,
                        rankSpacing: 70,
                        padding: 15,
                        useMaxWidth: true,
                        // 自定义节点样式
                        htmlMode: true,
                        defaultRenderer: 'dagre-wrapper'
                    },
                    // 自定义主题
                    themeVariables: {
                        // 主色调
                        primaryColor: '#FCEA00',
                        primaryTextColor: '#333333',
                        primaryBorderColor: '#FA8A00',
                        // 线条样式
                        lineColor: '#FA8A00',
                        // 节点样式
                        nodeBorder: '#FA8A00',
                        mainBkg: '#FFFDF0',
                        // 文本样式
                        fontSize: '16px',
                        // 其他元素
                        edgeLabelBackground: '#FFFDF0',
                        // 特殊节点样式
                        classBorder: '#33B8DB',
                        classFontSize: '14px',
                        classLabelColor: '#333333',
                        // 状态图样式
                        stateBkg: '#FFFDF0',
                        stateBorder: '#FA8A00',
                        // 序列图样式
                        actorBkg: '#FFFDF0',
                        actorBorder: '#FA8A00',
                        actorTextColor: '#333333',
                        noteBkg: '#FFFDF0',
                        noteBorder: '#FA8A00'
                    },
                    gantt: {
                        // 确保甘特图日期格式正确
                        dateFormat: 'YYYY-MM-DD',
                        axisFormat: '%Y-%m-%d',
                        // 禁用里程碑特殊处理，避免日期格式错误
                        displayMode: 'compact'
                    },
                    er: {
                        // ER图配置
                        diagramPadding: 20,
                        layoutDirection: 'TB',
                        minEntityWidth: 100,
                        minEntityHeight: 75,
                        entityPadding: 15,
                        stroke: '#FA8A00',
                        fill: '#FFFDF0',
                        fontSize: 12,
                        useMaxWidth: true
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
                            console.log('MathJax已加载并准备就绪');
                            resolve();
                            return;
                        }
                    }
                    
                    // 使用与mathjax.js中相同的配置
                    window.MathJax = {
                        tex: {
                            inlineMath: [['$', '$'], ['\\(', '\\)']],
                            displayMath: [['$$', '$$'], ['\\[', '\\]']],
                            processEscapes: true,
                            processEnvironments: true
                        },
                        svg: { fontCache: 'global' },
                        startup: {
                            typeset: false, // 禁用自动排版，我们将手动控制
                            ready: () => {
                                console.log('MathJax准备就绪');
                                resolve();
                            }
                        }
                    };
                    
                    // 尝试使用独立的mathjaxRenderer实例
                    if (typeof mathjaxRenderer !== 'undefined') {
                        console.log('使用独立的MathJax渲染器实例初始化');
                        window.mathjaxRenderer = mathjaxRenderer; // 确保全局可访问
                        return mathjaxRenderer.init().then(resolve);
                    }
                    
                    // 如果没有独立实例，加载MathJax库
                    console.log('加载MathJax库...');
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
        if (renderer.isLoaded && renderer.isLoaded()) {
            console.log(`渲染器 ${name} 已加载，无需初始化`);
            return Promise.resolve();
        }

        console.log(`开始初始化渲染器 ${name}...`);
        
        // 检查是否有独立的渲染器实例
        let initPromise;
        
        // 根据渲染器类型选择不同的初始化策略
        switch(name) {
            case 'plantuml':
                if (typeof plantumlRenderer !== 'undefined') {
                    initPromise = plantumlRenderer.init();
                } else {
                    initPromise = renderer.init();
                }
                break;
            case 'graphviz':
                if (typeof graphvizRenderer !== 'undefined') {
                    initPromise = graphvizRenderer.init();
                } else {
                    initPromise = renderer.init();
                }
                break;
            case 'mathjax':
                if (typeof mathjaxRenderer !== 'undefined') {
                    console.log('使用独立的MathJax渲染器实例初始化');
                    window.mathjaxRenderer = mathjaxRenderer; // 确保全局可访问
                    initPromise = mathjaxRenderer.init();
                } else {
                    console.log('使用内置MathJax初始化方法');
                    initPromise = renderer.init();
                }
                break;
            case 'flowchartjs':
                // 创建FlowchartJSRenderer实例并初始化
                if (typeof FlowchartJSRenderer !== 'undefined') {
                    const flowchartRenderer = new FlowchartJSRenderer();
                    initPromise = flowchartRenderer.init();
                } else {
                    initPromise = renderer.init();
                }
                break;
            default:
                initPromise = renderer.init();
        }
        
        // 添加超时处理，避免无限等待
        return Promise.race([
            initPromise
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
                }, 20000); // 增加到20秒超时，给予更多加载时间
            })
        ]).catch(error => {
            console.error(`初始化渲染器 ${name} 失败:`, error);
            
            // 如果是Mermaid渲染器失败，这是严重错误，直接抛出
            if (name === 'mermaid') {
                throw error;
            }
            
            // 对于其他渲染器，提供降级选项
            if (name !== 'mermaid' && this.renderers['mermaid'] && 
                this.renderers['mermaid'].isLoaded && this.renderers['mermaid'].isLoaded()) {
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

        // 显示加载指示器
        const containerEl = document.getElementById(container);
        if (containerEl) {
            const loadingIndicator = document.createElement('div');
            loadingIndicator.className = 'loading-spinner';
            loadingIndicator.style.display = 'flex';
            loadingIndicator.style.justifyContent = 'center';
            loadingIndicator.style.alignItems = 'center';
            loadingIndicator.style.height = '100px';
            loadingIndicator.innerHTML = `<div>加载 ${this.getRendererDisplayName(this.activeRenderer)} 渲染器...</div>`;
            containerEl.innerHTML = '';
            containerEl.appendChild(loadingIndicator);
        }

        // 确保渲染器已初始化
        const isLoaded = renderer.isLoaded && typeof renderer.isLoaded === 'function' ? renderer.isLoaded() : false;
        if (!isLoaded) {
            console.log(`渲染器 ${this.activeRenderer} 未加载，正在初始化...`);
            return this.initRenderer(this.activeRenderer)
                .then(() => {
                    console.log(`渲染器 ${this.activeRenderer} 初始化成功，开始渲染`);
                    // 确保渲染器已正确加载
                    const nowLoaded = renderer.isLoaded && typeof renderer.isLoaded === 'function' ? renderer.isLoaded() : false;
                    if (!nowLoaded) {
                        throw new Error(`渲染器 ${this.activeRenderer} 未正确加载`);
                    }
                    return renderer.render(code, container, this);
                })
                .catch(error => {
                    console.error(`渲染失败:`, error);
                    
                    // 如果当前渲染器不是Mermaid，尝试使用Mermaid作为备选
                    if (this.activeRenderer !== 'mermaid' && 
                        this.renderers['mermaid'] && 
                        this.renderers['mermaid'].isLoaded && 
                        this.renderers['mermaid'].isLoaded()) {
                        
                        console.warn(`尝试使用Mermaid作为备选渲染器`);
                        this.activeRenderer = 'mermaid';
                        
                        // 显示错误提示
                        if (containerEl) {
                            containerEl.innerHTML = `<div class="error-message" style="color:red;padding:10px;text-align:center;">原渲染器加载失败，已切换到Mermaid渲染器</div>`;
                        }
                        
                        // 递归调用，但限制递归深度为1，避免无限循环
                        return this.renderers['mermaid'].render(code, container, this);
                    }
                    
                    // 显示错误信息
                    if (containerEl) {
                        containerEl.innerHTML = `<div class="error-message" style="color:red;padding:20px;text-align:center;">
                            <h3>渲染失败</h3>
                            <p>${error.message}</p>
                            <p>请检查代码语法或尝试刷新页面</p>
                        </div>`;
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
                console.log(`脚本已加载: ${url}`);
                return resolve();
            }
            
            const script = document.createElement('script');
            // 根据重试次数选择URL
            script.src = this.loadRetries[url] === 0 ? fullUrl : backupUrl;
            script.async = false; // 改为同步加载，确保按顺序加载
            
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
                    console.error(`加载脚本失败(超时): ${url}`);
                    // 即使失败也解析Promise，避免阻塞其他渲染器的加载
                    resolve();
                }
            }, 10000); // 增加超时时间到10秒
            
            script.onload = () => {
                clearTimeout(timeout);
                console.log(`脚本加载成功: ${url}`);
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
                    console.error(`加载脚本失败(错误): ${url}`);
                    // 即使失败也解析Promise，避免阻塞其他渲染器的加载
                    resolve();
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
            // 检查是否有独立的渲染器实例
            if (typeof window.plantumlRenderer !== 'undefined' && typeof window.plantumlRenderer.render === 'function') {
                console.log('使用PlantUML渲染器实例渲染');
                return window.plantumlRenderer.render(code, container);
            }
            
            // 如果没有渲染器实例，尝试创建一个
            if (typeof PlantUMLRenderer === 'function') {
                console.log('创建新的PlantUML渲染器实例');
                window.plantumlRenderer = new PlantUMLRenderer();
                return window.plantumlRenderer.render(code, container);
            }
            
            // 降级方案：直接使用编码器
            if (typeof plantumlEncoder === 'undefined') {
                console.warn('PlantUML编码器未加载，尝试动态加载');
                // 尝试动态加载编码器
                return new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/plantuml-encoder@1.4.0/dist/plantuml-encoder.min.js';
                    script.onload = () => {
                        console.log('PlantUML编码器加载成功');
                        // 重新调用渲染方法
                        this.renderPlantUML(code, container).then(resolve).catch(reject);
                    };
                    script.onerror = () => {
                        reject(new Error('无法加载PlantUML编码器'));
                    };
                    document.head.appendChild(script);
                });
            }
            
            console.log('使用PlantUML编码器渲染');
            const encoded = plantumlEncoder.encode(code);
            const url = `https://www.plantuml.com/plantuml/svg/${encoded}`;
            
            return new Promise((resolve) => {
                const containerEl = document.getElementById(container);
                containerEl.innerHTML = `<img src="${url}" alt="PlantUML Diagram" style="max-width:100%">`;
                resolve({ svg: containerEl.innerHTML });
            });
        } catch (error) {
            console.error('PlantUML渲染错误:', error);
            // 显示错误信息在容器中
            const containerEl = document.getElementById(container);
            containerEl.innerHTML = `<div class="render-error">PlantUML渲染失败: ${error.message}</div>`;
            return Promise.resolve({ svg: containerEl.innerHTML });
        }
    }

    /**
     * 渲染Graphviz图表
     * @param {string} code - 图表代码
     * @param {string} container - 容器元素ID
     * @returns {Promise} 渲染完成的Promise
     */
    renderGraphviz(code, container) {
        // 检查是否有独立的渲染器实例
        if (typeof window.graphvizRenderer !== 'undefined' && typeof window.graphvizRenderer.render === 'function') {
            console.log('使用Graphviz渲染器实例渲染');
            return window.graphvizRenderer.render(code, container);
        }
        
        // 如果没有渲染器实例，尝试创建一个
        if (typeof GraphvizRenderer === 'function') {
            console.log('创建新的Graphviz渲染器实例');
            window.graphvizRenderer = new GraphvizRenderer();
            return window.graphvizRenderer.render(code, container);
        }
        
        // 降级方案：使用内置渲染逻辑
        return new Promise((resolve, reject) => {
            try {
                const containerEl = document.getElementById(container);
                containerEl.innerHTML = '';
                
                // 检查d3是否正确加载
                if (typeof d3 === 'undefined' || typeof d3.graphviz === 'undefined') {
                    console.warn('Graphviz库未正确加载，尝试动态加载');
                    // 尝试动态加载所需库
                    const loadD3 = () => {
                        const script = document.createElement('script');
                        script.src = 'https://cdn.jsdelivr.net/npm/d3@7.8.5/dist/d3.min.js';
                        script.onload = loadWasm;
                        script.onerror = () => {
                            containerEl.innerHTML = `<div class="render-error">无法加载D3库</div>`;
                            resolve({ svg: containerEl.innerHTML });
                        };
                        document.head.appendChild(script);
                    };
                    
                    const loadWasm = () => {
                        const script = document.createElement('script');
                        script.src = 'https://cdn.jsdelivr.net/npm/@hpcc-js/wasm@1.14.1/dist/index.min.js';
                        script.onload = loadGraphviz;
                        script.onerror = () => {
                            containerEl.innerHTML = `<div class="render-error">无法加载WASM库</div>`;
                            resolve({ svg: containerEl.innerHTML });
                        };
                        document.head.appendChild(script);
                    };
                    
                    const loadGraphviz = () => {
                        const script = document.createElement('script');
                        script.src = 'https://cdn.jsdelivr.net/npm/d3-graphviz@4.0.0/build/d3-graphviz.min.js';
                        script.onload = () => {
                            console.log('Graphviz库加载成功');
                            // 重新调用渲染方法
                            this.renderGraphviz(code, container).then(resolve).catch(reject);
                        };
                        script.onerror = () => {
                            containerEl.innerHTML = `<div class="render-error">无法加载Graphviz库</div>`;
                            resolve({ svg: containerEl.innerHTML });
                        };
                        document.head.appendChild(script);
                    };
                    
                    loadD3();
                    return;
                }
                
                console.log('使用D3-Graphviz渲染');
                // 添加错误处理
                try {
                    // 创建一个新的div作为渲染容器，避免ID选择器问题
                    const renderDiv = document.createElement('div');
                    renderDiv.id = `graphviz-render-${Date.now()}`;
                    renderDiv.style.width = '100%';
                    renderDiv.style.height = '100%';
                    containerEl.appendChild(renderDiv);
                    
                    d3.select(`#${renderDiv.id}`)
                        .graphviz()
                        .zoom(true)
                        .fit(true)
                        .width(containerEl.clientWidth || 500)
                        .height(containerEl.clientHeight || 400)
                        .renderDot(code)
                        .on('end', () => {
                            resolve({ svg: containerEl.innerHTML });
                        })
                        .on('error', (error) => {
                            console.error('Graphviz渲染错误:', error);
                            containerEl.innerHTML = `<div class="render-error" style="color: #ff4444; padding: 10px; background-color: #ffe6e6; border-radius: 4px;"><strong>Graphviz渲染错误:</strong> ${error}</div>`;
                            resolve({ svg: containerEl.innerHTML });
                        });
                } catch (error) {
                    console.error('Graphviz渲染失败:', error);
                    containerEl.innerHTML = `<div class="render-error">Graphviz渲染失败: ${error.message}</div>`;
                    resolve({ svg: containerEl.innerHTML });
                }
            } catch (error) {
                console.error('Graphviz渲染错误:', error);
                const containerEl = document.getElementById(container);
                containerEl.innerHTML = `<div class="render-error">Graphviz渲染错误: ${error.message}</div>`;
                resolve({ svg: containerEl.innerHTML });
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
        // 检查是否有独立的渲染器实例
        if (typeof window.mathjaxRenderer !== 'undefined' && typeof window.mathjaxRenderer.render === 'function') {
            console.log('使用MathJax渲染器实例渲染');
            return window.mathjaxRenderer.render(code, container);
        }
        
        // 如果没有渲染器实例，尝试创建一个
        if (typeof MathJaxRenderer === 'function') {
            console.log('创建新的MathJax渲染器实例');
            window.mathjaxRenderer = new MathJaxRenderer();
            return window.mathjaxRenderer.render(code, container);
        }
        
        // 降级方案：使用内置渲染逻辑
        return new Promise((resolve, reject) => {
            try {
                const containerEl = document.getElementById(container);
                
                // 创建公式容器
                const formulaContainer = document.createElement('div');
                formulaContainer.className = 'math-formula';
                formulaContainer.style.display = 'flex';
                formulaContainer.style.justifyContent = 'center';
                formulaContainer.style.alignItems = 'center';
                formulaContainer.style.padding = '20px';
                
                // 添加公式
                // 检查是否已经包含了数学环境标记
                if (code.includes('\\begin{') || code.includes('$$')) {
                    // 已经包含数学环境标记，直接使用
                    formulaContainer.innerHTML = code;
                } else if (code.includes('\n')) {
                    // 多行公式使用块级公式
                    formulaContainer.innerHTML = `$$${code}$$`;
                } else {
                    // 单行公式使用行内公式
                    formulaContainer.innerHTML = `$$${code}$$`;
                }
                
                containerEl.innerHTML = '';
                containerEl.appendChild(formulaContainer);
                
                // 检查MathJax是否正确加载
                if (typeof MathJax === 'undefined' || typeof MathJax.typesetPromise !== 'function') {
                    console.warn('MathJax库未正确加载，尝试使用mathjaxRenderer实例');
                    
                    // 尝试使用独立的mathjaxRenderer实例
                    if (typeof window.mathjaxRenderer === 'undefined') {
                        // 如果没有实例，尝试动态创建
                        if (typeof MathJaxRenderer === 'function') {
                            window.mathjaxRenderer = new MathJaxRenderer();
                            return window.mathjaxRenderer.render(code, container).then(resolve).catch(reject);
                        }
                        
                        // 如果无法创建实例，显示错误信息
                        console.error('无法加载MathJax库');
                        containerEl.innerHTML = `<div style="text-align:center; padding:10px; color:red;">无法加载MathJax库，请刷新页面重试</div>`;
                        resolve({ svg: containerEl.innerHTML });
                        return;
                    }
                    
                    // 使用已有的mathjaxRenderer实例
                    return window.mathjaxRenderer.render(code, container).then(resolve).catch(reject);
                }
                
                console.log('使用MathJax库渲染');
                // 使用MathJax渲染公式，确保传入正确的DOM元素
                MathJax.typesetPromise([formulaContainer])
                    .then(() => {
                        console.log('MathJax渲染成功');
                        resolve({ svg: containerEl.innerHTML });
                    })
                    .catch(error => {
                        console.error('MathJax渲染错误:', error);
                        containerEl.innerHTML = `<div class="render-error" style="color:red; padding:10px;">MathJax渲染失败: ${error.message}</div>`;
                        resolve({ svg: containerEl.innerHTML });
                    });
            } catch (error) {
                console.error('MathJax渲染错误:', error);
                const containerEl = document.getElementById(container);
                if (containerEl) {
                    containerEl.innerHTML = `<div class="render-error" style="color:red; padding:10px;">MathJax渲染错误: ${error.message}</div>`;
                }
                resolve({ svg: containerEl ? containerEl.innerHTML : `<div>渲染错误</div>` });
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
        // 检查是否有独立的渲染器实例
        if (typeof window.FlowchartJSRenderer === 'function') {
            console.log('使用FlowchartJS渲染器实例渲染');
            // 创建实例并使用
            const renderer = new window.FlowchartJSRenderer();
            return renderer.render(code, container);
        }
        
        // 如果没有渲染器类，尝试获取
        if (typeof FlowchartJSRenderer === 'function') {
            console.log('注册FlowchartJS渲染器类');
            window.FlowchartJSRenderer = FlowchartJSRenderer;
            const renderer = new FlowchartJSRenderer();
            return renderer.render(code, container);
        }
        
        // 降级方案：使用内置渲染逻辑
        return new Promise((resolve, reject) => {
            try {
                const containerEl = document.getElementById(container);
                containerEl.innerHTML = '';
                
                // 检查flowchart.js是否正确加载
                if (typeof flowchart === 'undefined' || typeof Raphael === 'undefined') {
                    console.warn('Flowchart.js库未正确加载，尝试动态加载');
                    
                    // 加载Raphael库
                    const loadRaphael = () => {
                        const script = document.createElement('script');
                        script.src = 'https://cdn.jsdelivr.net/npm/raphael@2.3.0/raphael.min.js';
                        script.onload = loadFlowchart;
                        script.onerror = () => {
                            containerEl.innerHTML = `<div class="render-error">无法加载Raphael库</div>`;
                            resolve({ svg: containerEl.innerHTML });
                        };
                        document.head.appendChild(script);
                    };
                    
                    // 加载Flowchart.js库
                    const loadFlowchart = () => {
                        const script = document.createElement('script');
                        script.src = 'https://cdn.jsdelivr.net/npm/flowchart.js@1.15.0/release/flowchart.min.js';
                        script.onload = () => {
                            console.log('Flowchart.js库加载成功');
                            // 重新调用渲染方法
                            this.renderFlowchartJS(code, container).then(resolve).catch(reject);
                        };
                        script.onerror = () => {
                            containerEl.innerHTML = `<div class="render-error">无法加载Flowchart.js库</div>`;
                            resolve({ svg: containerEl.innerHTML });
                        };
                        document.head.appendChild(script);
                    };
                    
                    loadRaphael();
                    return;
                }
                
                console.log('使用Flowchart.js库渲染');
                // 解析流程图代码
                try {
                    const diagram = flowchart.parse(code);
                    
                    // 渲染流程图
                    diagram.drawSVG(container, {
                        'line-width': 2,
                        'line-length': 50,
                        'text-margin': 10,
                        'font-size': 14,
                        'font-color': '#333',
                        'line-color': '#666',
                        'element-color': '#888',
                        'fill': 'white',
                        'yes-text': '是',
                        'no-text': '否',
                        'arrow-end': 'block',
                        'scale': 1,
                        'symbols': {
                            'start': {
                                'font-color': 'white',
                                'element-color': '#44AA44',
                                'fill': '#44AA44'
                            },
                            'end': {
                                'font-color': 'white',
                                'element-color': '#AA4444',
                                'fill': '#AA4444'
                            }
                        },
                        'flowstate': {
                            'past': { 'fill': '#CCCCCC', 'font-size': 12 },
                            'current': { 'fill': '#88AAFF', 'font-color': 'white', 'font-weight': 'bold' },
                            'future': { 'fill': '#FFCC88' },
                            'request': { 'fill': '#AAFFAA' },
                            'invalid': { 'fill': '#FFAAAA' },
                            'approved': { 'fill': '#AAFFAA', 'font-color': '#006600', 'font-weight': 'bold' },
                            'rejected': { 'fill': '#FFAAAA', 'font-color': '#CC0000', 'font-weight': 'bold' }
                        }
                    });
                    
                    resolve({ svg: containerEl.innerHTML });
                } catch (error) {
                    console.error('Flowchart.js解析或渲染错误:', error);
                    containerEl.innerHTML = `<div class="render-error">Flowchart.js解析或渲染错误: ${error.message}</div>`;
                    resolve({ svg: containerEl.innerHTML });
                }
            } catch (error) {
                console.error('Flowchart.js渲染错误:', error);
                const containerEl = document.getElementById(container);
                containerEl.innerHTML = `<div class="render-error">Flowchart.js渲染错误: ${error.message}</div>`;
                resolve({ svg: containerEl.innerHTML });
            }
        });
    }
    }

// 创建全局渲染器管理器实例
const rendererManager = new RendererManager();
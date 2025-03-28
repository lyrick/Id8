/**
 * Graphviz渲染器
 * 用于渲染DOT语言描述的图形
 */

class GraphvizRenderer {
    constructor() {
        this.initialized = false;
        this.loadingPromise = null;
    }

    /**
     * 初始化渲染器
     * @returns {Promise} 初始化完成的Promise
     */
    init() {
        if (this.initialized) {
            return Promise.resolve();
        }

        if (this.loadingPromise) {
            return this.loadingPromise;
        }

        console.log('初始化Graphviz渲染器...');
        
        // 加载D3和Graphviz库
        this.loadingPromise = Promise.all([
            this.loadScript('https://cdn.jsdelivr.net/npm/d3@7.8.5/dist/d3.min.js'),
            this.loadScript('https://cdn.jsdelivr.net/npm/@hpcc-js/wasm@1.14.1/dist/index.min.js')
        ])
        .then(() => this.loadScript('https://cdn.jsdelivr.net/npm/d3-graphviz@4.0.0/build/d3-graphviz.min.js'))
        .then(() => {
            // 初始化@hpcc-js/wasm
            if (typeof hpccWasm !== 'undefined') {
                return hpccWasm.graphviz.init();
            }
            return Promise.resolve();
        })
        .then(() => {
            this.initialized = true;
            console.log('Graphviz渲染器初始化完成');
        })
        .catch(error => {
            console.error('Graphviz渲染器初始化失败:', error);
            this.loadingPromise = null;
            throw error;
        });

        return this.loadingPromise;
    }

    /**
     * 加载外部脚本
     * @param {string} url - 脚本URL
     * @returns {Promise} 加载完成的Promise
     */
    loadScript(url) {
        return new Promise((resolve, reject) => {
            // 检查脚本是否已加载
            const existingScript = document.querySelector(`script[src="${url}"]`);
            if (existingScript) {
                return resolve();
            }
            
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`无法加载脚本: ${url}`));
            
            document.head.appendChild(script);
        });
    }

    /**
     * 渲染Graphviz图表
     * @param {string} code - DOT语言代码
     * @param {string} containerId - 容器元素ID
     * @returns {Promise} 渲染完成的Promise
     */
    render(code, containerId) {
        return new Promise((resolve, reject) => {
            try {
                // 确保渲染器已初始化
                if (!this.initialized) {
                    return this.init().then(() => this.render(code, containerId)).then(resolve).catch(reject);
                }

                const container = document.getElementById(containerId);
                if (!container) {
                    throw new Error(`容器元素 ${containerId} 不存在`);
                }

                // 清空容器
                container.innerHTML = '';
                
                // 添加加载指示器
                const loadingIndicator = document.createElement('div');
                loadingIndicator.className = 'loading-spinner';
                container.appendChild(loadingIndicator);

                // 检查d3和d3.graphviz是否正确加载
                if (typeof d3 === 'undefined') {
                    throw new Error('D3库未加载');
                }
                
                if (typeof d3.graphviz !== 'function') {
                    throw new Error('D3-Graphviz库未正确加载');
                }

                // 使用d3-graphviz渲染DOT代码
                try {
                    // 确保容器有足够的高度
                    container.style.minHeight = '300px';
                    
                    // 创建一个新的div作为渲染容器，避免ID选择器问题
                    const renderDiv = document.createElement('div');
                    renderDiv.id = `graphviz-render-${Date.now()}`;
                    renderDiv.style.width = '100%';
                    renderDiv.style.height = '100%';
                    container.appendChild(renderDiv);
                    
                    const graphviz = d3.select(`#${renderDiv.id}`).graphviz()
                        .zoom(true) // 启用缩放
                        .fit(true)  // 自适应容器大小
                        .scale(1.0) // 初始缩放比例
                        .width(container.clientWidth)
                        .height(container.clientHeight || 400)
                        .transition(() => {
                            return d3.transition("main")
                                .ease(d3.easeLinear)
                                .duration(500);
                        });

                    // 渲染图表
                    graphviz.renderDot(code)
                        .on('end', () => {
                            // 移除加载指示器
                            if (container.contains(loadingIndicator)) {
                                container.removeChild(loadingIndicator);
                            }
                            resolve({ svg: container.innerHTML });
                        })
                        .on('error', (error) => {
                            console.error('Graphviz渲染错误:', error);
                            // 移除加载指示器
                            if (container.contains(loadingIndicator)) {
                                container.removeChild(loadingIndicator);
                            }
                            // 显示错误信息
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'render-error';
                            errorDiv.style.color = '#ff4444';
                            errorDiv.style.padding = '10px';
                            errorDiv.style.backgroundColor = '#ffe6e6';
                            errorDiv.style.borderRadius = '4px';
                            errorDiv.innerHTML = `<strong>Graphviz语法错误:</strong> ${error}`;
                            container.appendChild(errorDiv);
                            resolve({ svg: container.innerHTML }); // 解析Promise而不是拒绝，以便显示错误信息
                        });
                } catch (error) {
                    // 移除加载指示器
                    if (container.contains(loadingIndicator)) {
                        container.removeChild(loadingIndicator);
                    }
                    throw error;
                }
            } catch (error) {
                console.error('Graphviz渲染错误:', error);
                reject(error);
            }
        });
    }

    /**
     * 检查渲染器是否已加载
     * @returns {boolean} 是否已加载
     */
    isLoaded() {
        return typeof d3 !== 'undefined' && typeof d3.graphviz === 'function';
    }
}

// 导出渲染器实例
const graphvizRenderer = new GraphvizRenderer();
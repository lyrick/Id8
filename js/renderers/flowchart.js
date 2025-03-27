/**
 * Flowchart.js渲染器
 * 用于渲染Flowchart.js语法的流程图
 */

class FlowchartJSRenderer {
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

        console.log('初始化Flowchart.js渲染器...');
        
        // 加载Raphael和Flowchart.js库
        this.loadingPromise = this.loadScript('https://cdn.jsdelivr.net/npm/raphael@2.3.0/raphael.min.js')
            .then(() => this.loadScript('https://cdn.jsdelivr.net/npm/flowchart.js@1.15.0/release/flowchart.min.js'))
            .then(() => {
                this.initialized = true;
                console.log('Flowchart.js渲染器初始化完成');
            })
            .catch(error => {
                console.error('Flowchart.js渲染器初始化失败:', error);
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
     * 渲染Flowchart.js图表
     * @param {string} code - Flowchart.js语法代码
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

                // 检查flowchart是否正确加载
                if (typeof flowchart === 'undefined') {
                    throw new Error('Flowchart.js库未正确加载');
                }

                try {
                    // 解析并绘制流程图
                    const diagram = flowchart.parse(code);
                    
                    // 移除加载指示器
                    if (container.contains(loadingIndicator)) {
                        container.removeChild(loadingIndicator);
                    }
                    
                    // 设置图表样式
                    const options = {
                        'line-width': 2,
                        'line-length': 50,
                        'text-margin': 10,
                        'font-size': 14,
                        'font-color': '#333',
                        'line-color': '#666',
                        'element-color': '#666',
                        'fill': 'white',
                        'yes-text': '是',
                        'no-text': '否',
                        'arrow-end': 'block',
                        'scale': 1,
                        'symbols': {
                            'start': {
                                'font-color': 'white',
                                'element-color': '#4CAF50',
                                'fill': '#4CAF50'
                            },
                            'end': {
                                'font-color': 'white',
                                'element-color': '#FF5722',
                                'fill': '#FF5722'
                            }
                        },
                        'flowstate': {
                            'past': { 'fill': '#CCCCCC', 'font-size': 12 },
                            'current': { 'fill': '#E0F7FA', 'font-color': '#00838F', 'font-weight': 'bold' },
                            'future': { 'fill': '#FFFFFF' },
                            'request': { 'fill': '#FFECB3' },
                            'invalid': { 'fill': '#FFCDD2' },
                            'approved': { 'fill': '#C8E6C9', 'font-color': '#388E3C' },
                            'rejected': { 'fill': '#FFCDD2', 'font-color': '#D32F2F' }
                        }
                    };
                    
                    // 绘制图表
                    diagram.drawSVG(containerId, options);
                    
                    // 返回渲染结果
                    resolve({ svg: container.innerHTML });
                } catch (error) {
                    // 移除加载指示器
                    if (container.contains(loadingIndicator)) {
                        container.removeChild(loadingIndicator);
                    }
                    
                    console.error('Flowchart.js解析错误:', error);
                    container.innerHTML = `<div class="error-message">Flowchart.js解析错误: ${error.message}</div>`;
                    reject(error);
                }
            } catch (error) {
                console.error('Flowchart.js渲染错误:', error);
                reject(error);
            }
        });
    }
}
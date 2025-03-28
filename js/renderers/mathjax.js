/**
 * MathJax渲染器
 * 用于渲染数学公式
 */

class MathJaxRenderer {
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

        console.log('初始化MathJax渲染器...');
        
        // 配置MathJax
        window.MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: [['$$', '$$'], ['\\[', '\\]']],
                processEscapes: true,
                processEnvironments: true
            },
            svg: { fontCache: 'global' },
            startup: {
                typeset: false // 禁用自动排版，我们将手动控制
            }
        };
        
        // 加载MathJax库
        this.loadingPromise = this.loadScript('https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js')
            .then(() => {
                // 确保MathJax已完全加载
                return new Promise(resolve => {
                    if (typeof MathJax !== 'undefined' && typeof MathJax.typesetPromise === 'function') {
                        resolve();
                    } else {
                        // 如果MathJax尚未完全初始化，等待startup.ready事件
                        window.MathJax.startup = window.MathJax.startup || {};
                        const originalReady = window.MathJax.startup.ready;
                        window.MathJax.startup.ready = () => {
                            if (originalReady) originalReady();
                            resolve();
                        };
                    }
                });
            })
            .then(() => {
                this.initialized = true;
                console.log('MathJax渲染器初始化完成');
            })
            .catch(error => {
                console.error('MathJax渲染器初始化失败:', error);
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
     * 渲染数学公式
     * @param {string} code - 数学公式代码
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

                // 检查MathJax是否正确加载
                if (typeof MathJax === 'undefined' || typeof MathJax.typesetPromise !== 'function') {
                    throw new Error('MathJax库未正确加载');
                }

                // 创建公式容器
                const formulaContainer = document.createElement('div');
                formulaContainer.className = 'math-formula';
                formulaContainer.style.display = 'flex';
                formulaContainer.style.justifyContent = 'center';
                formulaContainer.style.alignItems = 'center';
                formulaContainer.style.padding = '20px';
                formulaContainer.style.minHeight = '200px';
                
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
                
                container.appendChild(formulaContainer);
                
                // 移除加载指示器
                if (container.contains(loadingIndicator)) {
                    container.removeChild(loadingIndicator);
                }
                
                // 使用MathJax渲染公式
                MathJax.typesetPromise([formulaContainer])
                    .then(() => {
                        resolve({ svg: container.innerHTML });
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
     * 检查渲染器是否已加载
     * @returns {boolean} 是否已加载
     */
    isLoaded() {
        return typeof MathJax !== 'undefined' && typeof MathJax.typesetPromise === 'function';
    }
}

// 导出渲染器实例
const mathjaxRenderer = new MathJaxRenderer();
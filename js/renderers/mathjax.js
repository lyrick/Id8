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
                typeset: false, // 禁用自动排版，我们将手动控制
                ready: () => {
                    console.log('MathJax准备就绪');
                    // 这里不需要做任何事情，只是确保ready事件被捕获
                }
            }
        };
        
        // 加载MathJax库
        this.loadingPromise = this.loadScript('https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-svg.js')
            .then(() => {
                // 确保MathJax已完全加载
                return new Promise(resolve => {
                    // 检查MathJax是否已经可用
                    if (typeof MathJax !== 'undefined' && typeof MathJax.typesetPromise === 'function') {
                        console.log('MathJax已加载并准备就绪');
                        resolve();
                        return;
                    }
                    
                    // 如果MathJax尚未完全初始化，等待startup.ready事件
                    console.log('等待MathJax初始化完成...');
                    window.MathJax.startup = window.MathJax.startup || {};
                    const originalReady = window.MathJax.startup.ready;
                    window.MathJax.startup.ready = () => {
                        if (originalReady) originalReady();
                        console.log('MathJax初始化完成');
                        resolve();
                    };
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
                console.log(`脚本已存在: ${url}`);
                // 如果脚本已加载但可能尚未执行完成，我们等待一小段时间
                setTimeout(resolve, 100);
                return;
            }
            
            console.log(`加载脚本: ${url}`);
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            
            script.onload = () => {
                console.log(`脚本加载成功: ${url}`);
                resolve();
            };
            script.onerror = (e) => {
                console.error(`脚本加载失败: ${url}`, e);
                reject(new Error(`无法加载脚本: ${url}`));
            };
            
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
                console.log(`开始渲染公式到容器: ${containerId}`);
                
                // 确保渲染器已初始化
                if (!this.initialized) {
                    console.log('渲染器尚未初始化，先进行初始化');
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

                // 再次检查MathJax是否正确加载
                if (typeof MathJax === 'undefined') {
                    console.error('MathJax未定义，尝试重新初始化');
                    this.initialized = false;
                    return this.init().then(() => this.render(code, containerId)).then(resolve).catch(reject);
                }
                
                if (typeof MathJax.typesetPromise !== 'function') {
                    console.error('MathJax.typesetPromise不是函数，MathJax未完全加载');
                    throw new Error('MathJax库未正确加载，请刷新页面重试');
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
                
                console.log('调用MathJax.typesetPromise进行渲染');
                // 使用MathJax渲染公式
                MathJax.typesetPromise([formulaContainer])
                    .then(() => {
                        console.log('MathJax渲染成功');
                        resolve({ svg: container.innerHTML });
                    })
                    .catch(error => {
                        console.error('MathJax渲染错误:', error);
                        // 添加友好的错误提示
                        container.innerHTML = `<div class="render-error" style="color:red; padding:10px;">MathJax渲染失败: ${error.message}</div>`;
                        // 我们仍然解析Promise而不是拒绝，这样UI不会崩溃
                        resolve({ svg: container.innerHTML });
                    });
            } catch (error) {
                console.error('MathJax渲染错误:', error);
                // 尝试提供有用的错误信息
                const container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = `<div class="render-error" style="color:red; padding:10px;">MathJax渲染错误: ${error.message}</div>`;
                }
                // 我们仍然解析Promise而不是拒绝，这样UI不会崩溃
                resolve({ svg: container ? container.innerHTML : `<div>渲染错误</div>` });
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
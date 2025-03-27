/**
 * PlantUML渲染器
 * 用于渲染PlantUML语言描述的图形
 */

class PlantUMLRenderer {
    constructor() {
        this.initialized = false;
        this.loadingPromise = null;
        this.serverUrl = 'https://www.plantuml.com/plantuml/svg/';
        this.backupServerUrl = 'https://plantuml.vercel.app/svg/';
        this.currentServerIndex = 0;
        this.servers = [
            'https://www.plantuml.com/plantuml/svg/',
            'https://plantuml.vercel.app/svg/',
            'https://plantuml-server.kkeisuke.dev/svg/'
        ];
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

        console.log('初始化PlantUML渲染器...');
        
        // 加载PlantUML编码器
        this.loadingPromise = this.loadScript('https://cdn.jsdelivr.net/npm/plantuml-encoder@1.4.0/dist/plantuml-encoder.min.js')
            .then(() => {
                this.initialized = true;
                console.log('PlantUML渲染器初始化完成');
            })
            .catch(error => {
                console.error('PlantUML渲染器初始化失败:', error);
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
     * 渲染PlantUML图表
     * @param {string} code - PlantUML语言代码
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

                // 检查plantumlEncoder是否正确加载
                if (typeof plantumlEncoder === 'undefined') {
                    throw new Error('PlantUML编码器未加载');
                }

                // 编码PlantUML代码
                try {
                    // 确保代码有正确的@startuml和@enduml标记
                    let processedCode = code;
                    if (!processedCode.includes('@startuml')) {
                        processedCode = '@startuml\n' + processedCode;
                    }
                    if (!processedCode.includes('@enduml')) {
                        processedCode = processedCode + '\n@enduml';
                    }
                    
                    const encoded = plantumlEncoder.encode(processedCode);
                    const serverUrl = this.servers[this.currentServerIndex];
                    const url = `${serverUrl}${encoded}`;
                    
                    // 创建图像元素
                    const img = new Image();
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    img.alt = 'PlantUML Diagram';
                    
                    // 图像加载成功
                    img.onload = () => {
                        // 移除加载指示器
                        if (container.contains(loadingIndicator)) {
                            container.removeChild(loadingIndicator);
                        }
                        container.appendChild(img);
                        resolve({ svg: container.innerHTML });
                    };
                    
                    // 图像加载失败
                    img.onerror = () => {
                        console.warn(`PlantUML服务器 ${serverUrl} 加载失败，尝试备用服务器`);
                        
                        // 尝试下一个服务器
                        this.currentServerIndex = (this.currentServerIndex + 1) % this.servers.length;
                        
                        // 如果已经尝试了所有服务器，则报错
                        if (this.currentServerIndex === 0) {
                            if (container.contains(loadingIndicator)) {
                                container.removeChild(loadingIndicator);
                            }
                            reject(new Error('所有PlantUML服务器均无法访问，请稍后再试'));
                            return;
                        }
                        
                        // 递归调用，尝试下一个服务器
                        this.render(code, containerId).then(resolve).catch(reject);
                    };
                    
                    // 设置图像源
                    img.src = url;
                } catch (error) {
                    // 移除加载指示器
                    if (container.contains(loadingIndicator)) {
                        container.removeChild(loadingIndicator);
                    }
                    throw error;
                }
            } catch (error) {
                console.error('PlantUML渲染错误:', error);
                reject(error);
            }
        });
    }

    /**
     * 检查渲染器是否已加载
     * @returns {boolean} 是否已加载
     */
    isLoaded() {
        return typeof plantumlEncoder !== 'undefined';
    }
}

// 导出渲染器实例
const plantumlRenderer = new PlantUMLRenderer();
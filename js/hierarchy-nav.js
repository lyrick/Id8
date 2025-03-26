/**
 * 层级导航功能
 * 实现三级层级结构：编辑模式、渲染器类型、图表类型
 */

class HierarchyNavigation {
    constructor() {
        this.activeEditMode = 'markdown'; // 默认编辑模式
        this.activeRenderer = 'mermaid'; // 默认渲染器
        this.activeChartType = 'flowchart'; // 默认图表类型
        this.rendererManager = null; // 渲染器管理器引用
        this.onChangeCallbacks = []; // 变更回调函数列表
    }

    /**
     * 初始化层级导航
     * @param {Object} rendererManager - 渲染器管理器实例
     */
    init(rendererManager) {
        this.rendererManager = rendererManager;
        this.createHierarchyNavigation();
        this.bindEvents();
    }

    /**
     * 创建层级导航结构
     */
    createHierarchyNavigation() {
        const mainContent = document.querySelector('.main-content');
        const oldTabs = document.querySelectorAll('.tabs');
        
        // 移除旧的标签页
        oldTabs.forEach(tab => tab.remove());
        
        // 创建层级导航容器
        const hierarchyNav = document.createElement('div');
        hierarchyNav.className = 'hierarchy-nav';
        
        // 第一级：编辑模式选择
        const level1Title = document.createElement('div');
        level1Title.className = 'hierarchy-title';
        level1Title.textContent = '1. 选择编辑模式';
        
        const level1Selector = document.createElement('div');
        level1Selector.className = 'level1-selector';
        
        const editModes = [
            { id: 'markdown', name: 'Markdown' },
            { id: 'plaintext', name: 'Plaintext' }
        ];
        
        editModes.forEach(mode => {
            const option = document.createElement('div');
            option.className = `level1-option ${mode.id === this.activeEditMode ? 'active' : ''}`;
            option.dataset.mode = mode.id;
            option.textContent = mode.name;
            level1Selector.appendChild(option);
        });
        
        // 第二级：渲染器选择
        const level2Container = document.createElement('div');
        level2Container.className = 'level2-container';
        
        const level2Title = document.createElement('div');
        level2Title.className = 'hierarchy-title';
        level2Title.textContent = '2. 选择渲染器';
        
        const level2Selector = document.createElement('div');
        level2Selector.className = 'level2-selector';
        
        const renderers = this.rendererManager.getRenderers();
        
        renderers.forEach(renderer => {
            const option = document.createElement('div');
            option.className = `level2-option ${renderer.id === this.activeRenderer ? 'active' : ''}`;
            option.dataset.renderer = renderer.id;
            
            const icon = document.createElement('span');
            icon.className = 'icon';
            // 可以根据不同渲染器设置不同图标
            icon.innerHTML = this.getRendererIcon(renderer.id);
            
            const name = document.createElement('span');
            name.textContent = renderer.name;
            
            option.appendChild(icon);
            option.appendChild(name);
            level2Selector.appendChild(option);
        });
        
        // 第三级图表类型选择部分被隐藏，改为自动检测
        // 创建一个隐藏的容器来存储图表类型信息，但不显示在UI上
        const level3Container = document.createElement('div');
        level3Container.className = 'level3-container';
        level3Container.style.display = 'none'; // 隐藏此容器
        
        const level3Selector = document.createElement('div');
        level3Selector.className = 'level3-selector';
        level3Selector.id = 'chart-type-selector';
        level3Container.appendChild(level3Selector);
        
        // 将元素添加到层级导航容器
        hierarchyNav.appendChild(level1Title);
        hierarchyNav.appendChild(level1Selector);
        hierarchyNav.appendChild(level2Container);
        level2Container.appendChild(level2Title);
        level2Container.appendChild(level2Selector);
        hierarchyNav.appendChild(level3Container); // 添加隐藏的容器
        
        // 插入到主内容区域的开头
        mainContent.insertBefore(hierarchyNav, mainContent.firstChild);
        
        // 初始化第三级选择器内容（虽然隐藏，但仍需初始化以支持功能）
        this.updateChartTypeOptions();
    }

    /**
     * 更新图表类型选项
     */
    updateChartTypeOptions() {
        const chartTypeSelector = document.getElementById('chart-type-selector');
        if (!chartTypeSelector) return;
        
        // 清空现有选项
        chartTypeSelector.innerHTML = '';
        
        // 获取当前渲染器支持的图表类型
        const renderer = this.rendererManager.renderers[this.activeRenderer];
        if (!renderer || !renderer.supportedTypes) return;
        
        // 添加新选项
        renderer.supportedTypes.forEach(chartType => {
            const option = document.createElement('div');
            option.className = `level3-option ${chartType.id === this.activeChartType ? 'active' : ''}`;
            option.dataset.chartType = chartType.id;
            
            const icon = document.createElement('div');
            icon.className = 'icon';
            icon.innerHTML = this.getChartTypeIcon(chartType.id);
            
            const title = document.createElement('div');
            title.className = 'title';
            title.textContent = chartType.name;
            
            const description = document.createElement('div');
            description.className = 'description';
            description.textContent = chartType.description;
            
            option.appendChild(icon);
            option.appendChild(title);
            option.appendChild(description);
            
            // 添加工具提示
            option.title = chartType.description;
            
            chartTypeSelector.appendChild(option);
        });
    }

    /**
     * 绑定事件处理
     */
    bindEvents() {
        // 编辑模式选择事件
        document.querySelectorAll('.level1-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.setActiveEditMode(mode);
            });
        });
        
        // 渲染器选择事件
        document.querySelectorAll('.level2-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const renderer = e.currentTarget.dataset.renderer;
                this.setActiveRenderer(renderer);
            });
        });
        
        // 图表类型选择事件 - 使用事件委托，因为这些元素是动态生成的
        document.getElementById('chart-type-selector').addEventListener('click', (e) => {
            const option = e.target.closest('.level3-option');
            if (option) {
                const chartType = option.dataset.chartType;
                this.setActiveChartType(chartType);
            }
        });
    }

    /**
     * 设置活动的编辑模式
     * @param {string} mode - 编辑模式ID
     */
    setActiveEditMode(mode) {
        if (this.activeEditMode === mode) return;
        
        this.activeEditMode = mode;
        
        // 更新UI
        document.querySelectorAll('.level1-option').forEach(option => {
            option.classList.toggle('active', option.dataset.mode === mode);
            if (option.dataset.mode === mode) {
                option.classList.add('pulse-hierarchy');
                setTimeout(() => option.classList.remove('pulse-hierarchy'), 500);
            }
        });
        
        // 显示对应的编辑器
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${mode}-editor`).classList.add('active');
        
        // 触发变更回调
        this.triggerChangeCallbacks();
    }

    /**
     * 设置活动的渲染器
     * @param {string} renderer - 渲染器ID
     */
    setActiveRenderer(renderer) {
        if (this.activeRenderer === renderer) return;
        
        this.activeRenderer = renderer;
        
        // 更新UI
        document.querySelectorAll('.level2-option').forEach(option => {
            option.classList.toggle('active', option.dataset.renderer === renderer);
            if (option.dataset.renderer === renderer) {
                option.classList.add('pulse-hierarchy');
                setTimeout(() => option.classList.remove('pulse-hierarchy'), 500);
            }
        });
        
        // 确保渲染器管理器已初始化
        if (this.rendererManager && typeof this.rendererManager.setActiveRenderer === 'function') {
            // 初始化渲染器
            this.rendererManager.initRenderer(renderer)
                .then(() => {
                    // 更新渲染器管理器中的活动渲染器
                    this.rendererManager.setActiveRenderer(renderer);
                    console.log(`渲染器 ${renderer} 已初始化并设置为活动`);
                })
                .catch(error => {
                    console.error(`初始化渲染器 ${renderer} 失败:`, error);
                    // 如果初始化失败，尝试使用默认的Mermaid渲染器
                    this.activeRenderer = 'mermaid';
                    this.rendererManager.setActiveRenderer('mermaid');
                    // 更新UI显示
                    document.querySelectorAll('.level2-option').forEach(option => {
                        option.classList.toggle('active', option.dataset.renderer === 'mermaid');
                    });
                });
        }
        
        // 更新图表类型选项
        this.updateChartTypeOptions();
        
        // 重置图表类型为当前渲染器的第一个支持类型
        if (this.rendererManager && this.rendererManager.renderers[renderer]) {
            const supportedTypes = this.rendererManager.renderers[renderer].supportedTypes;
            if (supportedTypes && supportedTypes.length > 0) {
                this.setActiveChartType(supportedTypes[0].id);
            }
        }
        
        // 触发变更回调
        this.triggerChangeCallbacks();
    }

    /**
     * 设置活动的图表类型
     * @param {string} chartType - 图表类型ID
     */
    setActiveChartType(chartType) {
        if (this.activeChartType === chartType) return;
        
        this.activeChartType = chartType;
        
        // 更新UI
        document.querySelectorAll('.level3-option').forEach(option => {
            option.classList.toggle('active', option.dataset.chartType === chartType);
            if (option.dataset.chartType === chartType) {
                option.classList.add('pulse-hierarchy');
                setTimeout(() => option.classList.remove('pulse-hierarchy'), 500);
            }
        });
        
        // 加载对应的示例代码
        this.loadExampleCode(chartType);
        
        // 触发变更回调
        this.triggerChangeCallbacks();
    }

    /**
     * 加载示例代码
     * @param {string} chartType - 图表类型ID
     */
    loadExampleCode(chartType) {
        // 从扩展示例中获取代码
        let exampleCode = '';
        
        if (extendedExamples && 
            extendedExamples[this.activeRenderer] && 
            extendedExamples[this.activeRenderer][chartType]) {
            exampleCode = extendedExamples[this.activeRenderer][chartType];
        } else if (examples && examples[chartType]) {
            // 兼容原有示例
            exampleCode = examples[chartType];
        }
        
        if (exampleCode) {
            // 根据当前编辑模式设置示例代码
            if (this.activeEditMode === 'markdown') {
                document.getElementById('markdown-input').value = exampleCode;
            } else {
                document.getElementById('plaintext-input').value = exampleCode;
            }
            
            // 显示加载示例提示
            toast.info(`已加载${chartType}示例`);
        }
    }

    /**
     * 获取渲染器图标HTML
     * @param {string} rendererId - 渲染器ID
     * @returns {string} 图标HTML
     */
    getRendererIcon(rendererId) {
        const icons = {
            'mermaid': '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 2L2 12h3v8h14v-8h3L12 2zm0 2.8L19.2 12H4.8L12 4.8z"/></svg>',
            'plantuml': '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/></svg>',
            'graphviz': '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>',
            'mathjax': '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h2v10H7V7zm4 0h2v10h-2V7zm4 0h2v10h-2V7z"/></svg>',
            'flowchartjs': '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/></svg>'
        };
        
        return icons[rendererId] || '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M12 2L2 12h3v8h14v-8h3L12 2z"/></svg>';
    }

    /**
     * 获取图表类型图标HTML
     * @param {string} chartTypeId - 图表类型ID
     * @returns {string} 图标HTML
     */
    getChartTypeIcon(chartTypeId) {
        const icons = {
            'flowchart': '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/></svg>',
            'sequence': '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h2v10H7V7zm8 0h2v10h-2V7z"/></svg>',
            'state': '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>',
            'class': '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/></svg>',
            'gantt': '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h8v2H7v-2zm0 4h6v2H7v-2z"/></svg>',
            'pie': '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>',
            'er': '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/></svg>',
            'journey': '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/></svg>',
            'math': '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h2v10H7V7zm4 0h2v10h-2V7zm4 0h2v10h-2V7z"/></svg>',
            'digraph': '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>',
            'graph': '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>',
            'strict': '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>',
            'usecase': '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>',
            'activity': '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/></svg>',
            'component': '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/></svg>'
        };
        
        return icons[chartTypeId] || '<svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2L2 12h3v8h14v-8h3L12 2z"/></svg>';
    }

    /**
     * 添加变更回调函数
     * @param {Function} callback - 回调函数
     */
    onChange(callback) {
        if (typeof callback === 'function') {
            this.onChangeCallbacks.push(callback);
        }
    }

    /**
     * 触发所有变更回调函数
     */
    triggerChangeCallbacks() {
        const state = {
            editMode: this.activeEditMode,
            renderer: this.activeRenderer,
            chartType: this.activeChartType
        };
        
        this.onChangeCallbacks.forEach(callback => {
            callback(state);
        });
    }

    /**
     * 获取当前状态
     * @returns {Object} 当前状态对象
     */
    getState() {
        return {
            editMode: this.activeEditMode,
            renderer: this.activeRenderer,
            chartType: this.activeChartType
        };
    }
}

// 创建全局实例
const hierarchyNav = new HierarchyNavigation();
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
        level1Title.id = 'level1-title';
        
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
        level2Title.id = 'level2-title';
        
        const level2Selector = document.createElement('div');
        level2Selector.className = 'level2-selector';
        level2Selector.id = 'level2-selector';
        
        // 获取所有渲染器，但根据当前编辑模式过滤可用的渲染器
        const renderers = this.getCompatibleRenderers(this.activeEditMode);
        
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
        
        // 第三级：图表类型选择
        const level3Container = document.createElement('div');
        level3Container.className = 'level3-container';
        
        const level3Title = document.createElement('div');
        level3Title.className = 'hierarchy-title';
        level3Title.textContent = '3. 选择图表类型';
        level3Title.id = 'level3-title';
        
        const level3Selector = document.createElement('div');
        level3Selector.className = 'level3-selector';
        level3Selector.id = 'chart-type-selector';
        level3Container.appendChild(level3Title);
        level3Container.appendChild(level3Selector);
        
        // 将元素添加到层级导航容器
        hierarchyNav.appendChild(level1Title);
        hierarchyNav.appendChild(level1Selector);
        hierarchyNav.appendChild(level2Container);
        level2Container.appendChild(level2Title);
        level2Container.appendChild(level2Selector);
        hierarchyNav.appendChild(level3Container);
        
        // 插入到主内容区域的开头
        mainContent.insertBefore(hierarchyNav, mainContent.firstChild);
        
        // 初始化第三级选择器内容
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
        // 使用事件委托绑定所有层级导航的点击事件，避免直接绑定可能尚未完全渲染的元素
        document.addEventListener('click', (e) => {
            // 编辑模式选择事件
            const level1Option = e.target.closest('.level1-option');
            if (level1Option) {
                const mode = level1Option.dataset.mode;
                this.setActiveEditMode(mode);
                return;
            }
            
            // 渲染器选择事件
            const level2Option = e.target.closest('.level2-option');
            if (level2Option) {
                const renderer = level2Option.dataset.renderer;
                this.setActiveRenderer(renderer);
                return;
            }
            
            // 图表类型选择事件
            const level3Option = e.target.closest('.level3-option');
            if (level3Option) {
                const chartType = level3Option.dataset.chartType;
                this.setActiveChartType(chartType);
                return;
            }
        });

    }

    /**
     * 获取与编辑模式兼容的渲染器列表
     * @param {string} editMode - 编辑模式ID
     * @returns {Array} 兼容的渲染器列表
     */
    getCompatibleRenderers(editMode) {
        const allRenderers = this.rendererManager.getRenderers();
        
        // 所有编辑模式都兼容Mermaid渲染器
        if (editMode === 'markdown') {
            // Markdown模式兼容所有渲染器
            return allRenderers;
        } else if (editMode === 'plaintext') {
            // 纯文本模式只兼容部分渲染器
            return allRenderers.filter(renderer => 
                ['mermaid', 'graphviz'].includes(renderer.id)
            );
        }
        
        // 默认返回所有渲染器
        return allRenderers;
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
        
        // 更新可用的渲染器选项
        this.updateRendererOptions(mode);
        
        // 触发变更回调
        this.triggerChangeCallbacks();
    }
    
    /**
     * 更新渲染器选项
     * @param {string} editMode - 编辑模式ID
     */
    updateRendererOptions(editMode) {
        const level2Selector = document.getElementById('level2-selector');
        if (!level2Selector) return;
        
        // 清空现有选项
        level2Selector.innerHTML = '';
        
        // 获取兼容的渲染器
        const compatibleRenderers = this.getCompatibleRenderers(editMode);
        
        // 检查当前渲染器是否兼容
        const isCurrentRendererCompatible = compatibleRenderers.some(r => r.id === this.activeRenderer);
        
        // 如果当前渲染器不兼容，切换到默认的Mermaid渲染器
        if (!isCurrentRendererCompatible) {
            this.activeRenderer = 'mermaid';
        }
        
        // 添加新选项
        compatibleRenderers.forEach(renderer => {
            const option = document.createElement('div');
            option.className = `level2-option ${renderer.id === this.activeRenderer ? 'active' : ''}`;
            option.dataset.renderer = renderer.id;
            
            const icon = document.createElement('span');
            icon.className = 'icon';
            icon.innerHTML = this.getRendererIcon(renderer.id);
            
            const name = document.createElement('span');
            name.textContent = renderer.name;
            
            option.appendChild(icon);
            option.appendChild(name);
            level2Selector.appendChild(option);
        });
        
        // 更新图表类型选项
        this.updateChartTypeOptions();
        
        // 更新示例模板
        this.updateExampleCards();
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
                    
                    // 更新示例卡片
                    this.updateExampleCards();
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
                    
                    // 更新示例卡片
                    this.updateExampleCards();
                    
                    // 显示错误提示
                    toast.error(`渲染器 ${renderer} 不可用，使用Mermaid渲染器`);
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
            const chartTypeName = this.getChartTypeName(chartType);
            toast.info(`已加载${chartTypeName}示例`);
        }
    }
    
    /**
     * 获取图表类型的显示名称
     * @param {string} chartTypeId - 图表类型ID
     * @returns {string} 图表类型名称
     */
    getChartTypeName(chartTypeId) {
        // 从渲染器管理器中获取图表类型名称
        if (this.rendererManager && this.rendererManager.renderers[this.activeRenderer]) {
            const supportedTypes = this.rendererManager.renderers[this.activeRenderer].supportedTypes;
            if (supportedTypes) {
                const chartType = supportedTypes.find(type => type.id === chartTypeId);
                if (chartType) return chartType.name;
            }
        }
        
        // 默认名称映射
        const defaultNames = {
            'flowchart': '流程图',
            'sequence': '时序图',
            'state': '状态图',
            'class': '类图',
            'gantt': '甘特图',
            'pie': '饼图',
            'er': 'ER图',
            'journey': '用户旅程图',
            'usecase': '用例图',
            'activity': '活动图',
            'component': '组件图',
            'digraph': '有向图',
            'graph': '无向图',
            'strict': '严格图',
            'math': '数学公式'
        };
        
        return defaultNames[chartTypeId] || chartTypeId;
    }
    
    /**
     * 更新示例卡片
     * 根据当前选择的渲染器显示对应的示例卡片
     */
    updateExampleCards() {
        const exampleCards = document.querySelectorAll('.example-card');
        const examplesSection = document.querySelector('.examples-section');
        
        if (!examplesSection || !exampleCards.length) return;
        
        // 获取当前渲染器支持的图表类型
        const supportedTypes = [];
        if (this.rendererManager && this.rendererManager.renderers[this.activeRenderer]) {
            const rendererTypes = this.rendererManager.renderers[this.activeRenderer].supportedTypes;
            if (rendererTypes) {
                supportedTypes.push(...rendererTypes.map(type => type.id));
            }
        }
        
        // 检查扩展示例中是否有当前渲染器的示例
        const hasExtendedExamples = extendedExamples && extendedExamples[this.activeRenderer];
        
        // 遍历所有示例卡片，显示或隐藏
        exampleCards.forEach(card => {
            const exampleType = card.dataset.example;
            
            // 检查是否有此类型的示例代码
            let hasExample = false;
            
            if (hasExtendedExamples && extendedExamples[this.activeRenderer][exampleType]) {
                hasExample = true;
            } else if (examples && examples[exampleType] && supportedTypes.includes(exampleType)) {
                hasExample = true;
            }
            
            // 显示或隐藏卡片
            if (hasExample && supportedTypes.includes(exampleType)) {
                card.style.display = '';
                
                // 更新卡片标题和描述
                const titleElement = card.querySelector('.example-title');
                const descElement = card.querySelector('.example-body');
                
                if (titleElement && this.rendererManager.renderers[this.activeRenderer].supportedTypes) {
                    const typeInfo = this.rendererManager.renderers[this.activeRenderer].supportedTypes
                        .find(type => type.id === exampleType);
                    
                    if (typeInfo) {
                        titleElement.textContent = typeInfo.name;
                        if (descElement && typeInfo.description) {
                            descElement.textContent = typeInfo.description;
                        }
                    }
                }
            } else {
                card.style.display = 'none';
            }
        });
        
        // 检查是否所有卡片都被隐藏
        const visibleCards = Array.from(exampleCards).filter(card => card.style.display !== 'none');
        
        // 如果没有可见的卡片，隐藏整个示例部分
        if (visibleCards.length === 0) {
            examplesSection.style.display = 'none';
        } else {
            examplesSection.style.display = '';
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
            'plantuml': '<svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z"/></svg>',
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
/**
 * 流程图生成工具主应用脚本
 * 支持多种图表库和渲染器
 */

// 防抖函数 - 减少频繁操作导致的性能问题
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// 确保DOM完全加载后再执行脚本
document.addEventListener('DOMContentLoaded', function() {
    // DOM元素 - 使用缓存减少DOM查询开销
    const tabContents = document.querySelectorAll('.tab-content');
    const markdownInput = document.getElementById('markdown-input');
    const plaintextInput = document.getElementById('plaintext-input');
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const clearBtn = document.getElementById('clear-btn');
    const previewContainer = document.getElementById('preview-container');
    const mermaidDiagram = document.getElementById('mermaid-diagram');
    const colorOptions = document.querySelectorAll('.color-option');
    const exampleCards = document.querySelectorAll('.example-card');

    // 当前活动的编辑器和渲染器
    let activeEditor = 'markdown';
    let currentBgColor = '#ffffff';
    let activeRenderer = 'mermaid';
    let activeChartType = 'flowchart';
    
    // 检查html2canvas是否已加载
    const checkHtml2Canvas = () => {
        return typeof html2canvas !== 'undefined';
    };

    // 初始化渲染器管理器
    const rendererManager = initRendererManager();
    
    // 初始化层级导航
    hierarchyNav.init(rendererManager);
    
    // 监听层级导航变化
    hierarchyNav.onChange((state) => {
        // 更新当前活动的编辑器和渲染器
        activeEditor = state.editMode;
        activeRenderer = state.renderer;
        activeChartType = state.chartType;
        
        // 如果已有图表，重新生成以应用新设置
        if (mermaidDiagram.innerHTML) {
            generateDiagram();
        }
    });


    // 生成流程图
    generateBtn.addEventListener('click', generateDiagram);

    // 下载图片
    downloadBtn.addEventListener('click', downloadDiagram);

    // 清空内容
    clearBtn.addEventListener('click', () => {
        if (activeEditor === 'markdown') {
            markdownInput.value = '';
        } else {
            plaintextInput.value = '';
        }
        mermaidDiagram.innerHTML = '';
        clearBtn.classList.add('pulse');
        setTimeout(() => {
            clearBtn.classList.remove('pulse');
        }, 500);
        
        // 显示清空成功提示
        toast.info('内容已清空');
    });

    // 选择背景颜色
    colorOptions.forEach(option => {
        option.addEventListener('click', () => {
            // 移除所有活动状态
            colorOptions.forEach(o => o.classList.remove('active'));
            
            // 设置当前活动颜色
            option.classList.add('active');
            currentBgColor = option.dataset.color;
            
            // 更新预览背景
            previewContainer.style.backgroundColor = currentBgColor;
            
            // 如果已有图表，重新生成以应用新背景
            if (mermaidDiagram.innerHTML) {
                generateDiagram();
            }
            
            // 添加微动效
            option.classList.add('pulse');
            setTimeout(() => {
                option.classList.remove('pulse');
            }, 500);
        });
    });

    // 使用事件委托处理示例卡片点击
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.example-card');
        if (!card) return;
        
        const exampleType = card.dataset.example;
        if (!exampleType) return;
        
        // 获取当前层级导航状态
        const navState = hierarchyNav.getState();
        activeRenderer = navState.renderer;
        activeEditor = navState.editMode;
        
        // 获取示例代码
        let exampleCode;
        if (extendedExamples && extendedExamples[activeRenderer] && extendedExamples[activeRenderer][exampleType]) {
            exampleCode = extendedExamples[activeRenderer][exampleType];
        } else if (examples && examples[exampleType]) {
            exampleCode = examples[exampleType];
        } else {
            toast.error('未找到示例代码');
            return;
        }
        
        // 设置编辑器内容
        if (activeEditor === 'markdown') {
            markdownInput.value = exampleCode;
        } else {
            plaintextInput.value = exampleCode;
        }
        
        // 更新层级导航中的图表类型
        hierarchyNav.setActiveChartType(exampleType);
        
        // 添加微动效
        card.classList.add('pulse');
        setTimeout(() => {
            card.classList.remove('pulse');
        }, 500);
        
        // 显示加载示例提示
        const cardTitle = card.querySelector('.example-title')?.textContent || '图表';
        toast.info(`已加载${cardTitle}示例`);
        
        // 使用防抖函数延迟生成图表，避免UI阻塞
        setTimeout(() => {
            generateDiagram();
        }, 100);
    });

    
    // 初始化时更新示例卡片
    hierarchyNav.updateExampleCards();


    // 生成流程图函数
    function generateDiagram() {
        let code;
        
        if (activeEditor === 'markdown') {
            code = markdownInput.value.trim();
        } else {
            code = plaintextInput.value.trim();
        }
        
        if (!code) {
            mermaidDiagram.innerHTML = '<div style="color: #666; text-align: center; padding: 20px;">请输入流程图代码</div>';
            return;
        }

        // 实体名称语法验证
        const chineseEntityPattern = /[\u4e00-\u9fa5]/;
        if (code.includes('erDiagram') && chineseEntityPattern.test(code)) {
            throw new Error('ER图实体名称必须使用英文命名(如Customer/Order)\n正确格式示例：\nerDiagram\n  CUSTOMER ||--o{ ORDER : places\n  ORDER ||--|{ LINE-ITEM : contains\n\n• 请使用下划线替代中文和特殊字符\n• 关系描述使用英文动词短语')
        }
        
        // 获取当前层级导航状态
        const navState = hierarchyNav.getState();
        activeRenderer = navState.renderer;
        
        // 自动检测图表类型
        activeChartType = chartTypeDetector.detect(code, activeRenderer);
        
        // 更新层级导航中的图表类型（不会显示在UI上，但会保持内部状态一致）
        hierarchyNav.setActiveChartType(activeChartType);
        
        // 显示加载中提示
        const loadingToast = toast.loading('正在生成流程图...');
        
        // 禁用生成按钮，防止重复点击
        generateBtn.disabled = true;
        
        try {
            // 清空之前的图表
            mermaidDiagram.innerHTML = '';
            
            // 设置预览区域背景色
            previewContainer.style.backgroundColor = currentBgColor;
            
            // 使用setTimeout将渲染操作放入下一个事件循环，避免UI阻塞
            setTimeout(() => {
                try {
                    // 确保渲染器已初始化
                    const rendererSet = rendererManager.setActiveRenderer(activeRenderer);
                    
                    // 如果设置渲染器失败，尝试使用默认的Mermaid渲染器
                    if (!rendererSet) {
                        console.warn(`渲染器 ${activeRenderer} 不可用，使用Mermaid渲染器`);
                        rendererManager.setActiveRenderer('mermaid');
                        // 更新UI显示
                        rendererTabs.forEach(tab => {
                            tab.classList.remove('active');
                            if (tab.dataset.renderer === 'mermaid') {
                                tab.classList.add('active');
                            }
                        });
                        activeRenderer = 'mermaid';
                    }
                    
                    // 渲染新图表
                    rendererManager.render(code, 'mermaid-diagram')
                        .then(result => {
                            // 添加微动效
                            generateBtn.classList.add('pulse');
                            setTimeout(() => {
                                generateBtn.classList.remove('pulse');
                            }, 500);
                            
                            // 隐藏加载提示并显示成功提示
                            loadingToast.hide();
                            toast.success('流程图生成成功');
                            
                            // 恢复按钮状态
                            generateBtn.disabled = false;
                        })
                        .catch(error => {
                            handleRenderError(error, loadingToast);
                        });
                } catch (error) {
                    handleRenderError(error, loadingToast);
                }
            }, 50);
        } catch (error) {
            handleRenderError(error, loadingToast);
        }
    }
    
    // 处理渲染错误的函数
    function handleRenderError(error, loadingToast) {
        console.error('图表渲染错误:', error);
    toast.error(`ER图语法错误: ${error.message.split('\n')[0]}`, 5000);
        
        // 隐藏加载提示
        if (loadingToast) loadingToast.hide();
        
        // 获取更友好的错误信息
        let errorMessage = error.message || '图表语法错误，请检查您的代码';
        let errorTip = '';
        
        // 针对特定错误提供更友好的提示
        if (errorMessage.includes('Invalid date:Milestone')) {
            errorMessage = '甘特图日期格式错误';
            errorTip = '提示：里程碑应使用格式 "milestone, after taskId, 0d"，确保日期格式为 YYYY-MM-DD';
        } else if (errorMessage.includes('无法加载脚本')) {
            errorMessage = '外部库加载失败';
            errorTip = '提示：正在尝试使用备用源加载，请稍后再试，或尝试使用其他渲染器';
        } else if (errorMessage.includes('库未正确加载')) {
            errorMessage = '渲染库加载失败';
            errorTip = '提示：请刷新页面重试，或尝试使用其他渲染器（如Mermaid）';
        } else if (errorMessage.includes('渲染失败')) {
            // 保留原始错误信息
            errorTip = '提示：请检查语法是否正确，或尝试使用其他渲染器';
        } else if (errorMessage.includes('加载脚本超时')) {
            errorMessage = '网络连接缓慢，加载超时';
            errorTip = '提示：请检查网络连接，或尝试使用已加载的渲染器（如Mermaid）';
        }
        
        // 显示错误提示
        toast.error(`流程图生成失败: ${errorMessage}`);
        
        // 在预览区域显示错误信息
        if (error.message.includes('erDiagram')) {
            mermaidDiagram.innerHTML = `<div style="color: #ff4444; padding: 10px; background-color: #ffe6e6; border-radius: 4px;">
                <strong>错误:</strong> ${error.message || 'ER图语法错误，请检查您的代码'}
                <p style="margin-top: 12px; font-size: 13px;">建议使用以下格式：\nerDiagram\n  实体1 ||--o{ 实体2 : 关系</p>
            </div>`;
        } else {
            mermaidDiagram.innerHTML = `<div style="color: #ff4444; padding: 10px; background-color: #ffe6e6; border-radius: 4px;">
                <strong>错误:</strong> ${errorMessage}
                ${errorTip ? `<p style="margin-top: 8px; font-size: 14px;">${errorTip}</p>` : ''}
                <p style="margin-top: 12px; font-size: 13px;">建议使用Mermaid渲染器，它已预加载并更稳定</p>
            </div>`;
        }
        
        // 恢复按钮状态
        generateBtn.disabled = false;
    }

    // 按需加载html2canvas库
    function loadHtml2Canvas() {
        return new Promise((resolve, reject) => {
            if (checkHtml2Canvas()) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('无法加载html2canvas库'));
            document.head.appendChild(script);
        });
    }

    // 下载图表为图片
    async function downloadDiagram() {
        if (!mermaidDiagram.innerHTML) {
            toast.error('请先生成流程图');
            return;
        }
        
        // 显示加载中提示
        const loadingToast = toast.loading('正在生成图片...');
        
        // 禁用下载按钮，防止重复点击
        downloadBtn.disabled = true;
        
        try {
            // 添加微动效
            downloadBtn.classList.add('pulse');
            setTimeout(() => {
                downloadBtn.classList.remove('pulse');
            }, 500);
            
            // 确保html2canvas已加载
            if (!checkHtml2Canvas()) {
                await loadHtml2Canvas();
            }
            
            // 设置背景色
            const originalBg = previewContainer.style.backgroundColor;
            previewContainer.style.backgroundColor = currentBgColor;
            
            // 使用setTimeout避免UI阻塞
            setTimeout(async () => {
                try {
                    // 使用html2canvas捕获图表
                    const canvas = await html2canvas(previewContainer, {
                        backgroundColor: currentBgColor,
                        scale: 2, // 提高分辨率
                        logging: false
                    });
                    
                    // 恢复原始背景
                    previewContainer.style.backgroundColor = originalBg;
                    
                    // 创建下载链接
                    const link = document.createElement('a');
                    link.download = `流程图_${new Date().toISOString().slice(0, 10)}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    
                    // 隐藏加载提示并显示成功提示
                    loadingToast.hide();
                    toast.success('图片已成功下载');
                } catch (error) {
                    console.error('下载图片错误:', error);
                    loadingToast.hide();
                    toast.error('下载图片失败，请重试');
                } finally {
                    // 恢复按钮状态
                    downloadBtn.disabled = false;
                }
            }, 50);
        } catch (error) {
            console.error('下载图片错误:', error);
            loadingToast.hide();
            toast.error('下载图片失败，请重试');
            downloadBtn.disabled = false;
        }
    }

    // 初始化渲染器管理器
    function initRendererManager() {
        // 如果已经加载了渲染器管理器，直接返回
        if (typeof window.rendererManager !== 'undefined') {
            return window.rendererManager;
        }
        
        try {
            // 检查RendererManager类是否已加载
            if (typeof RendererManager === 'function') {
                // 创建新的渲染器管理器实例
                const manager = new RendererManager();
                window.rendererManager = manager;
                return manager;
            } else {
                // 动态加载渲染器管理器脚本
                const script = document.createElement('script');
                script.src = 'js/renderers/renderer-manager.js';
                script.async = false;
                document.head.appendChild(script);
                
                // 动态加载扩展示例脚本
                const examplesScript = document.createElement('script');
                examplesScript.src = 'js/examples-extended.js';
                examplesScript.async = false;
                document.head.appendChild(examplesScript);
                
                // 创建一个基本的渲染器管理器作为备选
                return {
                    setActiveRenderer: () => true,
                    render: (code, container) => {
                        mermaid.initialize({
                            startOnLoad: false,
                            securityLevel: 'loose',
                            er: {
                                diagramPadding: 20,
                                useMaxWidth: true
                            }
                        });
                        return mermaid.render('mermaid-svg', code).then(result => {
                            document.getElementById(container).innerHTML = result.svg;
                            return result;
                        });
                    }
                };
            }
        } catch (error) {
            console.error('初始化渲染器管理器失败:', error);
            // 创建一个基本的渲染器管理器作为备选
            return {
                setActiveRenderer: () => true,
                render: (code, container) => mermaid.render('mermaid-svg', code).then(result => {
                    document.getElementById(container).innerHTML = result.svg;
                    return result;
                })
            };
        }
    }

    // 初始化设置
    previewContainer.style.backgroundColor = currentBgColor;

    // 添加输入框实时预览（使用防抖函数优化性能）
    markdownInput.addEventListener('input', debounce(generateDiagram, 1000));
    plaintextInput.addEventListener('input', debounce(generateDiagram, 1000));
    
    // 更新渲染器选项卡
    function updateRendererTabs() {
        // 获取渲染器容器
        const rendererTabsContainer = document.querySelector('.tabs:nth-child(2)');
        if (!rendererTabsContainer) return;
        
        // 清空现有选项卡
        rendererTabsContainer.innerHTML = '';
        
        // 添加支持的渲染器选项卡
        const renderers = [
            { id: 'mermaid', name: 'Mermaid' },
            { id: 'plantuml', name: 'PlantUML' },
            { id: 'graphviz', name: 'Graphviz' },
            { id: 'flowchartjs', name: 'Flowchart.js' },
            { id: 'mathjax', name: 'MathJax' }
        ];
        
        renderers.forEach((renderer, index) => {
            const tab = document.createElement('div');
            tab.className = `renderer-tab${index === 0 ? ' active' : ''}`;
            tab.dataset.renderer = renderer.id;
            tab.textContent = renderer.name;
            rendererTabsContainer.appendChild(tab);
            
            // 添加点击事件
            tab.addEventListener('click', () => {
                // 移除所有活动状态
                document.querySelectorAll('.renderer-tab').forEach(t => t.classList.remove('active'));
                
                // 设置当前活动渲染器
                tab.classList.add('active');
                activeRenderer = renderer.id;
                
                // 更新层级导航中的渲染器
                if (hierarchyNav && typeof hierarchyNav.setActiveRenderer === 'function') {
                    hierarchyNav.setActiveRenderer(renderer.id);
                }
                
                // 添加微动效
                tab.classList.add('pulse');
                setTimeout(() => {
                    tab.classList.remove('pulse');
                }, 500);
                
                // 如果已有图表，重新生成以应用新渲染器
                if (mermaidDiagram.innerHTML) {
                    generateDiagram();
                }
                
                // 更新示例卡片
                updateExampleCards(renderer.id);
            });
        });
    }
    
    // 更新示例卡片
    function updateExampleCards(rendererId) {
        // 获取示例容器
        const examplesGrid = document.querySelector('.examples-grid');
        if (!examplesGrid) return;
        
        // 清空现有示例卡片
        examplesGrid.innerHTML = '';
        
        // 获取当前渲染器支持的图表类型
        let supportedTypes = [];
        if (typeof rendererManager !== 'undefined' && rendererManager.renderers && rendererManager.renderers[rendererId]) {
            supportedTypes = rendererManager.renderers[rendererId].supportedTypes || [];
        } else if (rendererId === 'mermaid') {
            // 默认Mermaid支持的图表类型
            supportedTypes = [
                { id: 'flowchart', name: '流程图', description: '用于展示业务流程或操作步骤' },
                { id: 'sequence', name: '时序图', description: '用于展示系统组件之间的交互' },
                { id: 'state', name: '状态图', description: '用于展示状态转换' },
                { id: 'class', name: '类图', description: '用于表示类及其关系' },
                { id: 'gantt', name: '甘特图', description: '项目计划和时间管理图表' }
            ];
        }
        
        // 添加示例卡片
        supportedTypes.forEach(type => {
            const card = document.createElement('div');
            card.className = 'example-card';
            card.dataset.example = type.id;
            
            // 获取当前语言的文本
            let typeName = type.name;
            let typeDesc = type.description;
            
            // 如果存在语言切换器，尝试获取翻译文本
            if (typeof languageSwitcher !== 'undefined' && languageSwitcher.getText) {
                const key = `${type.id}_title`;
                const descKey = `${type.id}_desc`;
                if (languageSwitcher.getText(key) !== key) {
                    typeName = languageSwitcher.getText(key);
                }
                if (languageSwitcher.getText(descKey) !== descKey) {
                    typeDesc = languageSwitcher.getText(descKey);
                }
            }
            
            card.innerHTML = `
                <div class="example-header">
                    <div class="example-title">${typeName}</div>
                </div>
                <div class="example-body">
                    ${typeDesc}
                </div>
            `;
            
            examplesGrid.appendChild(card);
            
            // 添加点击事件
            card.addEventListener('click', () => {
                let exampleCode;
                
                // 从扩展示例中获取代码
                if (extendedExamples && extendedExamples[rendererId] && extendedExamples[rendererId][type.id]) {
                    exampleCode = extendedExamples[rendererId][type.id];
                } else if (examples && examples[type.id]) {
                    // 兼容原有示例
                    exampleCode = examples[type.id];
                } else {
                    toast.error('未找到示例代码');
                    return;
                }
                
                if (activeEditor === 'markdown') {
                    markdownInput.value = exampleCode;
                } else {
                    plaintextInput.value = exampleCode;
                }
                
                // 更新层级导航中的图表类型
                if (hierarchyNav && typeof hierarchyNav.setActiveChartType === 'function') {
                    hierarchyNav.setActiveChartType(type.id);
                }
                
                // 显示加载示例提示
                toast.info(`已加载${typeName}示例`);
                
                // 使用防抖函数延迟生成图表，避免UI阻塞
                setTimeout(() => {
                    generateDiagram();
                }, 100);
                
                // 添加微动效
                card.classList.add('pulse');
                setTimeout(() => {
                    card.classList.remove('pulse');
                }, 500);
            });
        });
    }
    
    // 初始化渲染器选项卡和示例卡片
    setTimeout(() => {
        // 确保层级导航已正确初始化
        if (typeof hierarchyNav !== 'undefined' && hierarchyNav.createHierarchyNavigation) {
            // 如果层级导航未初始化，则手动初始化
            if (!document.querySelector('.hierarchy-nav')) {
                hierarchyNav.init(rendererManager);
            }
        }
        
        // 更新语言切换器文本
        if (typeof languageSwitcher !== 'undefined') {
            languageSwitcher.updatePageContent();
        }
        
        // 初始化图像控制器
        if (typeof imageControls !== 'undefined') {
            imageControls.init();
        }
        
        // 确保渲染器管理器已初始化
        if (typeof rendererManager === 'undefined' || !rendererManager.getRenderers) {
            console.warn('渲染器管理器未正确初始化，使用默认设置');
        }
        
        // 更新渲染器选项卡和示例卡片
        updateRendererTabs();
        updateExampleCards(activeRenderer);
        
        // 生成一个默认的流程图示例
        if (!mermaidDiagram.innerHTML && markdownInput.value) {
            generateDiagram();
        }
        
        // 监听语言变更事件，更新示例卡片
        document.addEventListener('languageChanged', () => {
            updateExampleCards(activeRenderer);
        });
    }, 500);
});
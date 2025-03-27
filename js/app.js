// 示例模板已在HTML中通过script标签引入
// examples变量现在是全局变量

// 初始化Mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: 'default',
    securityLevel: 'loose',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
});

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
    const tabs = document.querySelectorAll('.tab');
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
    const rendererTabs = document.querySelectorAll('.renderer-tab');

    // 当前活动的编辑器和渲染器
    let activeEditor = 'markdown';
    let currentBgColor = '#ffffff';
    let activeRenderer = 'mermaid';
    
    // 检查html2canvas是否已加载
    const checkHtml2Canvas = () => {
        return typeof html2canvas !== 'undefined';
    };

    // 切换标签页
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有活动状态
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // 设置当前活动标签
            tab.classList.add('active');
            activeEditor = tab.dataset.tab;
            
            // 激活对应的内容区域
            document.getElementById(`${activeEditor}-editor`).classList.add('active');
            
            // 添加微动效
            tab.classList.add('pulse');
            setTimeout(() => {
                tab.classList.remove('pulse');
            }, 500);
        });
    });

    // 切换渲染器（目前只支持Mermaid）
    rendererTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有活动状态
            rendererTabs.forEach(t => t.classList.remove('active'));
            
            // 设置当前活动渲染器
            tab.classList.add('active');
            activeRenderer = tab.dataset.renderer;
            
            // 添加微动效
            tab.classList.add('pulse');
            setTimeout(() => {
                tab.classList.remove('pulse');
            }, 500);
            
            // 如果已有图表，重新生成以应用新渲染器
            if (mermaidDiagram.innerHTML) {
                generateDiagram();
            }
        });
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

    // 加载示例
    exampleCards.forEach(card => {
        card.addEventListener('click', () => {
            const exampleType = card.dataset.example;
            const exampleCode = examples[exampleType];
            const exampleTitle = card.querySelector('.example-title').textContent;
            
            if (activeEditor === 'markdown') {
                markdownInput.value = exampleCode;
            } else {
                plaintextInput.value = exampleCode;
            }
            
            // 显示加载示例提示
            toast.info(`已加载${exampleTitle}示例`);
            
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

    // 生成流程图函数 - 使用Web Worker处理渲染任务
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
        
        // 显示加载中提示
        const loadingToast = toast.loading('正在生成流程图...');
        
        // 禁用生成按钮，防止重复点击
        generateBtn.disabled = true;
        
        try {
            // 清空之前的图表
            mermaidDiagram.innerHTML = '';
            
            // 使用setTimeout将渲染操作放入下一个事件循环，避免UI阻塞
            setTimeout(() => {
                try {
                    // 渲染新图表
                    mermaid.render('mermaid-svg', code)
                        .then(result => {
                            mermaidDiagram.innerHTML = result.svg;
                            
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
        // 仅在控制台记录错误，不显示给用户
        console.error('Mermaid渲染错误:', error);
        
        // 隐藏加载提示
        if (loadingToast) loadingToast.hide();
        
        // 显示友好的toast提示
        toast.error('流程图生成失败，请检查语法', 5000);
        
        // 在预览区域显示友好的提示，而不是错误详情
        mermaidDiagram.innerHTML = '<div style="color: #666; text-align: center; padding: 20px;">请检查流程图代码并重试</div>';
        
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

    // 初始化设置
    previewContainer.style.backgroundColor = currentBgColor;

    // 添加输入框实时预览（使用防抖函数优化性能）
    markdownInput.addEventListener('input', debounce(generateDiagram, 1000));
    plaintextInput.addEventListener('input', debounce(generateDiagram, 1000));
});
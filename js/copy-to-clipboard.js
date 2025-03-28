/**
 * 复制图片到剪贴板功能
 * 提供将流程图复制到剪贴板的功能
 */

class CopyToClipboard {
    constructor() {
        this.previewContainer = null;
        this.copyButton = null;
    }

    /**
     * 初始化复制到剪贴板功能
     */
    init() {
        // 获取预览容器
        this.previewContainer = document.getElementById('preview-container');
        
        if (!this.previewContainer) {
            console.error('预览容器不存在');
            return;
        }
        
        // 创建复制按钮
        this.createCopyButton();
        
        // 监听语言变化事件
        document.addEventListener('languageChanged', this.updateButtonText.bind(this));
        
        console.log('复制到剪贴板功能初始化完成');
    }

    /**
     * 创建复制按钮
     */
    createCopyButton() {
        // 创建复制按钮
        this.copyButton = document.createElement('button');
        this.copyButton.className = 'image-control-btn copy-image-btn';
        this.copyButton.innerHTML = '📋';
        this.copyButton.title = '复制图片';
        
        // 添加点击事件
        this.copyButton.addEventListener('click', () => this.copyImageToClipboard());
        
        // 将按钮添加到预览卡片
        const previewCard = document.querySelector('.preview-card .card-body');
        if (previewCard) {
            previewCard.appendChild(this.copyButton);
        }
    }

    /**
     * 更新按钮文本（用于多语言支持）
     */
    updateButtonText(event) {
        if (!this.copyButton || !window.languageSwitcher) return;
        
        const language = event ? event.detail.language : window.languageSwitcher.currentLanguage;
        this.copyButton.title = window.languageSwitcher.getText('copy_image');
    }

    /**
     * 复制图片到剪贴板
     */
    async copyImageToClipboard() {
        const mermaidDiagram = document.getElementById('mermaid-diagram');
        
        if (!mermaidDiagram || !mermaidDiagram.innerHTML) {
            toast.error('请先生成流程图');
            return;
        }
        
        // 显示加载中提示
        const loadingToast = toast.loading('正在复制图片...');
        
        try {
            // 确保html2canvas已加载
            if (typeof html2canvas === 'undefined') {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }
            
            // 获取当前背景色
            const currentBgColor = this.previewContainer.style.backgroundColor || '#ffffff';
            
            // 使用html2canvas捕获图表
            const canvas = await html2canvas(this.previewContainer, {
                backgroundColor: currentBgColor,
                scale: 2, // 提高分辨率
                logging: false,
                allowTaint: true,
                useCORS: true
            });
            
            // 将Canvas转换为Blob
            canvas.toBlob(async (blob) => {
                try {
                    // 创建ClipboardItem对象
                    const item = new ClipboardItem({ 'image/png': blob });
                    
                    // 复制到剪贴板
                    await navigator.clipboard.write([item]);
                    
                    // 添加微动效
                    this.copyButton.classList.add('pulse');
                    setTimeout(() => {
                        this.copyButton.classList.remove('pulse');
                    }, 500);
                    
                    // 隐藏加载提示并显示成功提示
                    loadingToast.hide();
                    toast.success('图片已复制到剪贴板');
                } catch (error) {
                    console.error('复制到剪贴板错误:', error);
                    loadingToast.hide();
                    toast.error('复制图片失败，请重试');
                    
                    // 降级方案：提供下载链接
                    const link = document.createElement('a');
                    link.download = `流程图_${new Date().toISOString().slice(0, 10)}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    toast.info('已下载图片作为替代方案');
                }
            });
        } catch (error) {
            console.error('复制图片错误:', error);
            loadingToast.hide();
            toast.error('复制图片失败，请重试');
        }
    }
}

// 创建全局实例
const copyToClipboard = new CopyToClipboard();

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，确保其他组件已加载
    setTimeout(() => {
        copyToClipboard.init();
    }, 500);
});
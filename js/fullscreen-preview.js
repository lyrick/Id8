/**
 * 全屏预览功能
 * 提供流程图的全屏预览、高清加载和加载状态显示
 */

class FullscreenPreview {
    constructor() {
        this.modal = null;
        this.modalContent = null;
        this.modalBody = null;
        this.diagramContainer = null;
        this.originalDiagram = null;
        this.isOpen = false;
        this.zoomLevel = 1;
        this.minZoom = 0.5;
        this.maxZoom = 5; // 增大最大缩放比例，支持更高清预览
        this.zoomStep = 0.2;
        this.currentBgColor = '#ffffff';
    }

    /**
     * 初始化全屏预览功能
     */
    init() {
        // 创建模态框结构
        this.createModal();
        
        // 添加预览按钮到预览区域
        this.addPreviewButton();
        
        // 绑定事件
        this.bindEvents();
        
        console.log('全屏预览功能初始化完成');
    }

    /**
     * 创建模态框结构
     */
    createModal() {
        // 创建模态框容器
        this.modal = document.createElement('div');
        this.modal.className = 'fullscreen-modal';
        
        // 创建模态框内容
        this.modalContent = document.createElement('div');
        this.modalContent.className = 'fullscreen-modal-content';
        
        // 创建模态框头部
        const modalHeader = document.createElement('div');
        modalHeader.className = 'fullscreen-modal-header';
        
        const modalTitle = document.createElement('div');
        modalTitle.className = 'fullscreen-modal-title';
        modalTitle.textContent = '流程图全屏预览';
        
        const closeButton = document.createElement('button');
        closeButton.className = 'fullscreen-modal-close';
        closeButton.innerHTML = '&times;';
        closeButton.title = '关闭预览';
        closeButton.addEventListener('click', () => this.close());
        
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeButton);
        
        // 创建模态框主体
        this.modalBody = document.createElement('div');
        this.modalBody.className = 'fullscreen-modal-body';
        
        // 创建图表容器
        this.diagramContainer = document.createElement('div');
        this.diagramContainer.className = 'fullscreen-diagram-container';
        
        // 创建加载动画
        const loadingSpinner = document.createElement('div');
        loadingSpinner.className = 'loading-spinner';
        this.diagramContainer.appendChild(loadingSpinner);
        
        // 创建控制按钮
        const controls = document.createElement('div');
        controls.className = 'fullscreen-controls';
        
        const zoomInBtn = this.createControlButton('+', '放大', () => this.zoomIn());
        const zoomOutBtn = this.createControlButton('-', '缩小', () => this.zoomOut());
        const resetZoomBtn = this.createControlButton('↺', '重置缩放', () => this.resetZoom());
        const downloadBtn = this.createControlButton('↓', '下载高清图片', () => this.downloadHighRes());
        
        controls.appendChild(zoomInBtn);
        controls.appendChild(zoomOutBtn);
        controls.appendChild(resetZoomBtn);
        controls.appendChild(downloadBtn);
        
        // 组装模态框
        this.modalBody.appendChild(this.diagramContainer);
        this.modalBody.appendChild(controls);
        
        this.modalContent.appendChild(modalHeader);
        this.modalContent.appendChild(this.modalBody);
        
        this.modal.appendChild(this.modalContent);
        
        // 添加到文档
        document.body.appendChild(this.modal);
    }

    /**
     * 创建控制按钮
     * @param {string} icon - 按钮图标
     * @param {string} tooltip - 按钮提示文本
     * @param {Function} clickHandler - 点击事件处理函数
     * @returns {HTMLElement} 按钮元素
     */
    createControlButton(icon, tooltip, clickHandler) {
        const button = document.createElement('button');
        button.className = 'fullscreen-control-btn';
        button.innerHTML = icon;
        button.title = tooltip;
        button.addEventListener('click', clickHandler);
        return button;
    }

    /**
     * 添加预览按钮到预览区域
     */
    addPreviewButton() {
        const previewCard = document.querySelector('.preview-card .card-body');
        if (!previewCard) return;
        
        const previewBtn = document.createElement('button');
        previewBtn.className = 'image-control-btn fullscreen-btn';
        previewBtn.innerHTML = '⛶';
        previewBtn.title = '全屏预览';
        previewBtn.style.position = 'absolute';
        previewBtn.style.top = '15px';
        previewBtn.style.right = '15px';
        previewBtn.style.zIndex = '10';
        
        previewBtn.addEventListener('click', () => this.open());
        
        previewCard.appendChild(previewBtn);
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 按ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        // 点击模态框背景关闭模态框
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
        
        // 添加鼠标滚轮缩放支持
        this.modalBody.addEventListener('wheel', (e) => {
            if (this.isOpen) {
                e.preventDefault();
                
                if (e.deltaY < 0) {
                    // 向上滚动，放大
                    this.zoomIn();
                } else {
                    // 向下滚动，缩小
                    this.zoomOut();
                }
            }
        }, { passive: false });
        
        // 添加拖动支持
        let isDragging = false;
        let startX, startY;
        let translateX = 0, translateY = 0;
        
        this.modalBody.addEventListener('mousedown', (e) => {
            if (this.isOpen && e.target === this.diagramContainer || this.diagramContainer.contains(e.target)) {
                isDragging = true;
                startX = e.clientX - translateX;
                startY = e.clientY - translateY;
                this.diagramContainer.style.cursor = 'grabbing';
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                translateX = e.clientX - startX;
                translateY = e.clientY - startY;
                this.diagramContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${this.zoomLevel})`;
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.diagramContainer.style.cursor = 'grab';
            }
        });
    }

    /**
     * 打开全屏预览
     */
    open() {
        if (this.isOpen) return;
        
        // 获取原始图表
        this.originalDiagram = document.getElementById('mermaid-diagram');
        if (!this.originalDiagram || !this.originalDiagram.innerHTML) {
            toast.error('请先生成流程图');
            return;
        }
        
        // 获取当前背景色
        const previewContainer = document.getElementById('preview-container');
        if (previewContainer) {
            this.currentBgColor = previewContainer.style.backgroundColor || '#ffffff';
        }
        
        // 显示加载动画
        this.diagramContainer.innerHTML = '<div class="loading-spinner"></div>';
        
        // 显示模态框
        this.modal.classList.add('active');
        this.isOpen = true;
        
        // 设置背景色
        this.diagramContainer.style.backgroundColor = this.currentBgColor;
        
        // 重置缩放和位置
        this.resetZoom();
        
        // 克隆图表内容到全屏预览
        setTimeout(() => {
            // 移除加载动画
            this.diagramContainer.innerHTML = '';
            
            // 克隆原始图表
            const clonedContent = this.originalDiagram.cloneNode(true);
            clonedContent.style.transform = 'scale(1)';
            clonedContent.style.transformOrigin = 'center center';
            
            // 添加到容器
            this.diagramContainer.appendChild(clonedContent);
            
            // 设置初始样式
            this.diagramContainer.style.cursor = 'grab';
        }, 300);
    }

    /**
     * 关闭全屏预览
     */
    close() {
        if (!this.isOpen) return;
        
        this.modal.classList.remove('active');
        this.isOpen = false;
        
        // 清空容器
        setTimeout(() => {
            this.diagramContainer.innerHTML = '';
        }, 300);
    }

    /**
     * 放大图像
     */
    zoomIn() {
        if (this.zoomLevel < this.maxZoom) {
            this.zoomLevel += this.zoomStep;
            this.applyZoom();
        }
    }

    /**
     * 缩小图像
     */
    zoomOut() {
        if (this.zoomLevel > this.minZoom) {
            this.zoomLevel -= this.zoomStep;
            this.applyZoom();
        }
    }

    /**
     * 重置缩放
     */
    resetZoom() {
        this.zoomLevel = 1;
        this.applyZoom();
        
        // 重置位置
        this.diagramContainer.style.transform = `scale(${this.zoomLevel})`;
    }

    /**
     * 应用缩放
     */
    applyZoom() {
        const currentTransform = this.diagramContainer.style.transform;
        const translateMatch = currentTransform.match(/translate\((.*?)\)/);
        
        if (translateMatch && translateMatch[1]) {
            // 保持当前位置，只更新缩放
            const translate = translateMatch[0];
            this.diagramContainer.style.transform = `${translate} scale(${this.zoomLevel})`;
        } else {
            // 没有位置信息，只应用缩放
            this.diagramContainer.style.transform = `scale(${this.zoomLevel})`;
        }
    }

    /**
     * 下载高清图片
     */
    async downloadHighRes() {
        if (!this.isOpen || !this.diagramContainer.firstChild) {
            toast.error('无法下载图片');
            return;
        }
        
        // 显示加载中提示
        const loadingToast = toast.loading('正在生成高清图片...');
        
        try {
            // 确保html2canvas已加载
            if (typeof html2canvas === 'undefined') {
                // 动态加载html2canvas
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }
            
            // 临时提高缩放比例以获取高清图片
            const originalZoom = this.zoomLevel;
            const highResScale = 2; // 高清倍数
            
            // 创建临时容器，避免影响用户界面
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '-9999px';
            tempContainer.style.top = '-9999px';
            tempContainer.style.width = this.diagramContainer.offsetWidth + 'px';
            tempContainer.style.height = this.diagramContainer.offsetHeight + 'px';
            tempContainer.style.backgroundColor = this.currentBgColor;
            
            // 克隆当前图表到临时容器
            const clonedContent = this.diagramContainer.firstChild.cloneNode(true);
            clonedContent.style.transform = 'scale(1)'; // 重置缩放
            tempContainer.appendChild(clonedContent);
            document.body.appendChild(tempContainer);
            
            // 使用html2canvas捕获图表
            const canvas = await html2canvas(tempContainer, {
                backgroundColor: this.currentBgColor,
                scale: highResScale, // 提高分辨率
                logging: false,
                allowTaint: true,
                useCORS: true
            });
            
            // 移除临时容器
            document.body.removeChild(tempContainer);
            
            // 创建下载链接
            const link = document.createElement('a');
            link.download = `流程图_高清_${new Date().toISOString().slice(0, 10)}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            // 恢复原始缩放
            this.zoomLevel = originalZoom;
            this.applyZoom();
            
            // 隐藏加载提示并显示成功提示
            loadingToast.hide();
            toast.success('高清图片已成功下载');
        } catch (error) {
            console.error('下载高清图片错误:', error);
            loadingToast.hide();
            toast.error('下载图片失败，请重试');
        }
    }
}

// 初始化全屏预览功能
const fullscreenPreview = new FullscreenPreview();

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 确保在渲染器和图像控制器初始化后再初始化全屏预览
    setTimeout(() => {
        fullscreenPreview.init();
    }, 500);
});
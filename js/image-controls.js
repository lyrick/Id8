/**
 * 图像控制器组件
 * 提供图像预览的放大、缩小、重置和布局切换功能
 */

class ImageControls {
    constructor() {
        this.previewContainer = null;
        this.diagramContainer = null;
        this.controlsContainer = null;
        this.zoomLevel = 1;
        this.isHorizontalLayout = true; // 默认为横向布局
        this.minZoom = 0.5;
        this.maxZoom = 3;
        this.zoomStep = 0.1;
    }

    /**
     * 初始化图像控制器
     */
    init() {
        // 获取预览容器
        this.previewContainer = document.getElementById('preview-container');
        this.diagramContainer = document.getElementById('mermaid-diagram');
        
        if (!this.previewContainer || !this.diagramContainer) {
            console.error('预览容器或图表容器不存在');
            return;
        }
        
        // 创建控制器UI
        this.createControlsUI();
        
        // 添加鼠标滚轮缩放支持
        this.addWheelZoomSupport();
        
        // 添加拖动支持
        this.addDragSupport();
        
        // 监听语言变化事件
        document.addEventListener('languageChanged', this.updateControlsText.bind(this));
        
        console.log('图像控制器初始化完成');
    }

    /**
     * 创建控制器UI
     */
    createControlsUI() {
        // 创建控制器容器
        this.controlsContainer = document.createElement('div');
        this.controlsContainer.className = 'image-controls';
        
        // 创建缩放控制按钮
        const zoomInBtn = this.createControlButton('zoom-in', '+', '放大');
        const zoomOutBtn = this.createControlButton('zoom-out', '-', '缩小');
        const resetZoomBtn = this.createControlButton('reset-zoom', '↺', '重置缩放');
        const toggleLayoutBtn = this.createControlButton('toggle-layout', '⇄', '切换布局');
        
        // 添加点击事件
        zoomInBtn.addEventListener('click', () => this.zoomIn());
        zoomOutBtn.addEventListener('click', () => this.zoomOut());
        resetZoomBtn.addEventListener('click', () => this.resetZoom());
        toggleLayoutBtn.addEventListener('click', () => this.toggleLayout());
        
        // 将按钮添加到容器
        this.controlsContainer.appendChild(zoomInBtn);
        this.controlsContainer.appendChild(zoomOutBtn);
        this.controlsContainer.appendChild(resetZoomBtn);
        this.controlsContainer.appendChild(toggleLayoutBtn);
        
        // 将控制器添加到预览卡片
        const previewCard = document.querySelector('.preview-card .card-body');
        if (previewCard) {
            previewCard.appendChild(this.controlsContainer);
        }
    }

    /**
     * 创建控制按钮
     * @param {string} id - 按钮ID
     * @param {string} icon - 按钮图标
     * @param {string} tooltip - 按钮提示文本
     * @returns {HTMLElement} 按钮元素
     */
    createControlButton(id, icon, tooltip) {
        const button = document.createElement('button');
        button.id = id;
        button.className = 'image-control-btn';
        button.innerHTML = icon;
        button.title = tooltip;
        return button;
    }

    /**
     * 更新控制按钮文本（用于多语言支持）
     */
    updateControlsText(event) {
        if (!this.controlsContainer || !window.languageSwitcher) return;
        
        const language = event ? event.detail.language : window.languageSwitcher.currentLanguage;
        
        // 更新按钮提示文本
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        const resetZoomBtn = document.getElementById('reset-zoom');
        const toggleLayoutBtn = document.getElementById('toggle-layout');
        
        if (zoomInBtn) zoomInBtn.title = window.languageSwitcher.getText('zoom_in');
        if (zoomOutBtn) zoomOutBtn.title = window.languageSwitcher.getText('zoom_out');
        if (resetZoomBtn) resetZoomBtn.title = window.languageSwitcher.getText('reset_zoom');
        if (toggleLayoutBtn) toggleLayoutBtn.title = window.languageSwitcher.getText('toggle_layout');
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
        this.diagramContainer.style.transform = `scale(${this.zoomLevel})`;
    }

    /**
     * 切换布局（横向/纵向）
     */
    toggleLayout() {
        this.isHorizontalLayout = !this.isHorizontalLayout;
        
        // 更新预览容器类名
        this.previewContainer.classList.toggle('vertical-layout', !this.isHorizontalLayout);
        
        // 添加微动效
        const toggleBtn = document.getElementById('toggle-layout');
        if (toggleBtn) {
            toggleBtn.classList.add('pulse');
            setTimeout(() => {
                toggleBtn.classList.remove('pulse');
            }, 500);
        }
    }

    /**
     * 添加鼠标滚轮缩放支持
     */
    addWheelZoomSupport() {
        this.previewContainer.addEventListener('wheel', (e) => {
            // 仅在按住Ctrl键时进行缩放
            if (e.ctrlKey) {
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
    }

    /**
     * 添加拖动支持
     */
    addDragSupport() {
        let isDragging = false;
        let startX, startY;
        let translateX = 0, translateY = 0;
        
        // 鼠标按下事件
        this.previewContainer.addEventListener('mousedown', (e) => {
            // 仅在缩放级别大于1时允许拖动
            if (this.zoomLevel > 1) {
                isDragging = true;
                startX = e.clientX - translateX;
                startY = e.clientY - translateY;
                this.previewContainer.style.cursor = 'grabbing';
            }
        });
        
        // 鼠标移动事件
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                translateX = e.clientX - startX;
                translateY = e.clientY - startY;
                this.diagramContainer.style.transform = `scale(${this.zoomLevel}) translate(${translateX / this.zoomLevel}px, ${translateY / this.zoomLevel}px)`;
            }
        });
        
        // 鼠标释放事件
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.previewContainer.style.cursor = 'default';
            }
        });
        
        // 鼠标离开事件
        this.previewContainer.addEventListener('mouseleave', () => {
            if (isDragging) {
                isDragging = false;
                this.previewContainer.style.cursor = 'default';
            }
        });
    }
}

// 创建全局实例
const imageControls = new ImageControls();

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 延迟初始化，确保其他组件已加载
    setTimeout(() => {
        imageControls.init();
    }, 500);
});
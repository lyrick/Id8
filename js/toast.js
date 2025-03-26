/**
 * Toast 通知组件
 * 用于显示友好的提示信息，包括加载中和错误提示
 */

class Toast {
    constructor() {
        this.toastContainer = null;
        this.toastElement = null;
        this.hideTimeout = null;
        
        // 确保DOM已加载完成再创建Toast容器
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.createToastContainer());
        } else {
            this.createToastContainer();
        }
    }

    // 创建Toast容器
    createToastContainer() {
        // 检查是否已存在Toast容器
        if (document.getElementById('toast-container')) {
            this.toastContainer = document.getElementById('toast-container');
            return;
        }

        // 创建Toast容器
        this.toastContainer = document.createElement('div');
        this.toastContainer.id = 'toast-container';
        document.body.appendChild(this.toastContainer);
    }

    // 显示Toast
    show(message, type = 'info', duration = 3000) {
        // 确保容器已创建
        if (!this.toastContainer) {
            this.createToastContainer();
        }
        
        // 清除之前的定时器
        if (this.hideTimeout) {
            clearTimeout(this.hideTimeout);
            this.hideTimeout = null;
        }

        // 如果已有Toast，先移除
        if (this.toastElement) {
            this.toastElement.remove();
        }

        // 创建新的Toast元素
        this.toastElement = document.createElement('div');
        this.toastElement.className = `toast toast-${type}`;
        
        // 根据类型添加不同的图标
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
                break;
            case 'error':
                icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
                break;
            case 'loading':
                icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>';
                break;
            default:
                icon = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
        }

        // 设置Toast内容
        this.toastElement.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-message">${message}</div>
        `;

        // 添加到容器
        this.toastContainer.appendChild(this.toastElement);

        // 添加显示类
        setTimeout(() => {
            this.toastElement.classList.add('show');
        }, 10);

        // 如果不是加载中状态，设置自动隐藏
        if (type !== 'loading') {
            this.hideTimeout = setTimeout(() => {
                this.hide();
            }, duration);
        }

        return this;
    }

    // 隐藏Toast
    hide() {
        if (this.toastElement) {
            this.toastElement.classList.remove('show');
            setTimeout(() => {
                if (this.toastElement) {
                    this.toastElement.remove();
                    this.toastElement = null;
                }
            }, 300);
        }
        return this;
    }

    // 显示成功Toast
    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    }

    // 显示错误Toast
    error(message, duration = 3000) {
        return this.show(message, 'error', duration);
    }

    // 显示加载中Toast
    loading(message = '处理中...') {
        return this.show(message, 'loading', 0);
    }

    // 显示信息Toast
    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }
}

// 创建全局Toast实例
let toast;

// 确保DOM加载完成后再初始化toast实例
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        toast = new Toast();
    });
} else {
    toast = new Toast();
}
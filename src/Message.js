const prefixCls = 'xh-message';

const defaults = {
    top: 24,
    duration: 3
};

const iconTypeMap = {
    success: 'iconduihao',
    warning: 'icontanhao',
    error: 'iconguanbi',
    info: 'iconxinxi'
};

class Message {
    constructor() {
        this.$dom = null;
        this.messageInstance = null;
        this.linkStyle();
    }

    linkStyle(){
        let headHTML = document.getElementsByTagName('head')[0].innerHTML;
        headHTML += '<link type="text/css" rel="stylesheet" href="https://cdn.kuaiyugo.com/test/tianmu/_tmSDK_message.css">';
        document.getElementsByTagName('head')[0].innerHTML = headHTML;
    }

    getInnerHtml({ content, type }) {
        return `
      <div class="${prefixCls}-notice ${prefixCls}-notice-${type}"> 
        <div class="${prefixCls}-notice-content">
          <div class="${prefixCls}-notice-content-text">
            <div class="${prefixCls}-custom-content ${prefixCls}-${type}">
              <span class="${prefixCls}-content">${content}</span>
            </div>
          </div> 
        </div>
      </div>`;
    }
    getMessageInstance() {
        if (!this.messageInstance) {
            const $dom = document.createElement('div');
            $dom.className = prefixCls;

            this.$dom = $dom;
            document.body.appendChild($dom);
            return (this.messageInstance = this);
        }

        return this.messageInstance;
    }

    show({ content = '', type = 'info', duration = defaults.duration }) {
        if (!this.$dom) {
            this.getMessageInstance();
        }

        if (this.$dom && !this.$dom.classList.contains('active')) {
            this.$dom.innerHTML = this.getInnerHtml({ content, type });

            setTimeout(() => {
                this.$dom.classList.add('active');
            }, 100);

            setTimeout(() => {
                this.$dom.classList.remove('active');
            }, duration * 1000);
        }
    }

    success({ content = '', duration = defaults.duration }) {
        this.show({ content, duration, type: 'success' });
    }
    warning({ content = '', duration = defaults.duration }) {
        this.show({ content, duration, type: 'warning' });
    }
    error({ content = '', duration = defaults.duration }) {
        this.show({ content, duration, type: 'error' });
    }
    info({ content = '', duration = defaults.duration }) {
        this.show({ content, duration, type: 'info' });
    }

    destroy() {
        this.messageInstance = null;
        this.$dom && document.body.removeChild(this.$dom);
        this.$dom = null;
    }
}

export default new Message();

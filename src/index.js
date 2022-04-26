import md5 from 'md5';
import axios from 'axios';
import guide from './guide';
import loading from './loading';
import payWindow from './pay';

const TAGNAME = "tm_h5_sdk";

class TMSDK {
    constructor(props) {
        console.log('tmsdk init');
        this._appid = "";
        this._appKey = "";
        this._programId = "";
        let u = navigator.userAgent;
        let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1;
        this._device = isAndroid ? "android" : "ios";
        this._params = this.getWindowUrlParams();
        console.log('params', this._params);
        if (this.is_weixn()) {
            guide.create(!isAndroid);
        }

        this.addMeta("viewport", "width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0");
        // this.pay({
        //     coin: 1,//支付金额，单位角
        //     open_id: "abc",//用户open_id
        //     program_param: 'test',//参数
        //     goodsName: '测试商品',//商品名称
        //     zone: '无区服',//区服
        //     gameUid: '1234',//游戏id
        //     gameNickname: '张三'//游戏昵称
        // });
    }

    config({
               appid,
               appKey,
               programId
           }) {
        this._appid = appid;
        this._appKey = appKey;
        this._programId = programId;
    }

    sign({signBody, programId}) {
        let signatureStr = Object.keys(signBody).filter(function (key) {
            return signBody[key] !== undefined && signBody[key] !== '' && key !== "sign";
        }).sort().map(function (key) {
            return key + '=' + signBody[key];
        }).join('&') + programId;
        return md5(signatureStr);
    }

    addMeta(name, content) {
        let head = document.getElementsByTagName("head")[0];
        let meta = document.createElement("meta");
        meta.name = name;
        meta.content = content;
        head.appendChild(meta);
    }

    // programInfoInit() {
    //     let self = this;
    //     console.log('info', this._programId)
    //     axios.get(`https://api.kuaiyugo.com/api/config/v1/programs/${this._programId}/program_info`)
    //         .then(function (response) {
    //             console.log('program info', response.data);
    //             let links = document.getElementsByTagName("link");
    //             for (let i = 0; i < links.length; i++) {
    //                 if (links[i].rel === 'icon') {
    //                     links[i].parentNode.removeChild(links[i]);
    //                 }
    //             }
    //             document.title = response.data.data.program_name.trim();
    //             self.addLink("icon", response.data.data.program_icon, {type: "image/ico"});
    //             self.addLink("apple-touch-icon-precomposed", response.data.data.program_icon, {sizes: "120x120"});
    //             self.addLink("apple-touch-icon", response.data.data.program_icon);
    //             self.addMeta("apple-mobile-web-app-title", response.data.data.program_name);
    //             self.addMeta("application-name", response.data.data.program_name);
    //
    //             let gameIframe = document.createElement('iframe');
    //             if (response.data.data.h5_game_url.indexOf('?') !== -1) {
    //                 gameIframe.src = response.data.data.h5_game_url + `&st=${self._params["st"]}`;
    //             } else {
    //                 gameIframe.src = response.data.data.h5_game_url + `?st=${self._params["st"]}`;
    //             }
    //             gameIframe.className = 'full-screen';
    //             document.body.appendChild(gameIframe);
    //             // let link = document.createElement('link');
    //             // link.type = 'image/x-icon';
    //             // link.rel = 'icon';
    //             // link.href = response.data.data.program_icon;
    //             // document.getElementsByTagName('head')[0].appendChild(link);
    //         })
    // }

    // addLink(rel, href, obj) {
    //     let head = document.getElementsByTagName("head")[0];
    //     let link = document.createElement("link");
    //     link.href = href;
    //     link.rel = rel;
    //     if (obj) {
    //         let keys = Object.keys(obj)
    //         for (let i = 0; i < keys.length; i++) {
    //             link[keys[i]] = obj[keys[i]]
    //         }
    //     }
    //     head.appendChild(link);
    // }
    //
    // addMeta(name, content) {
    //     let head = document.getElementsByTagName("head")[0];
    //     let meta = document.createElement("meta");
    //     meta.name = name;
    //     meta.content = content;
    //     head.appendChild(meta);
    // }

    getWindowUrlParams() {
        let url = window.location.search;
        let index = url.indexOf('?');
        let obj = {};
        if (index !== -1) {
            let str = url.substr(1);
            let arr = str.split('&');
            for (let i = 0; i < arr.length; i++) {
                obj[arr[i].split('=')[0]] = arr[i].split('=')[1];
            }
        }
        return obj;
    }

    is_weixn() {
        let ua = navigator.userAgent.toLowerCase();
        if (ua.match(/MicroMessenger/i) == "micromessenger") {
            return true;
        } else {
            return false;
        }
    }

    login({
              code = ''
          }) {
        let copyCoce = (code || this._params["st"]) || '';
        console.log(TAGNAME, `tmsdk login with code : ${copyCoce}`);
        let timestamp = new Date().getTime();
        let data = {
            code: copyCoce,
            timestamp
        };
        return axios.post(
            `https://api.kuaiyugo.com/api/platuser/v1/programs/${this._programId}/h5_sessions`,
            Object.assign(
                data,
                {
                    sign: this.sign({
                        signBody: data,
                        programId: this._programId
                    })
                }
            )
        )
    }

    pay({
            coin, open_id, program_param, goodsName = "", zone = "", gameUid = "", gameNickname = ""
        }) {
        console.log('tmsdk pay');
        let self = this;
        let programId = this._programId;
        let timestamp = new Date().getTime();
        let data = {
            coin,
            program_param,
            open_id,
            goods_name: goodsName,
            zone,
            game_uid: gameUid,
            game_nickname: gameNickname,
            timestamp
        }
        return new Promise(function (resolve, reject) {
            payWindow.create({
                weChart: function () {
                    data.pay_type = 1;
                    console.log('order data', data);
                    loading.show();
                    axios.post(`https://api.kuaiyugo.com/api/payment/v1/programs/${self._programId}/h5_orders`,
                        Object.assign(
                            data,
                            {
                                sign: self.sign({
                                    signBody: data, programId
                                })
                            }
                        ), {
                            headers: {
                                'device': self._device
                            }
                        }
                    ).then(function (response) {
                        loading.hide();
                        console.log('pay url', response.data.data.url);
                        top.location.href = response.data.data.url;
                        payWindow.remove();
                        resolve(response);
                    })
                }, alipay: function () {
                    data.pay_type = 2;
                    console.log('order data', data);
                    loading.show();
                    axios.post(`https://api.kuaiyugo.com/api/payment/v1/programs/${self._programId}/h5_orders`,
                        Object.assign(
                            data,
                            {
                                sign: self.sign({
                                    signBody: data, programId
                                })
                            }
                        ), {
                            headers: {
                                'device': self._device
                            }
                        }
                    ).then(function (response) {
                        loading.hide();
                        payWindow.remove();
                        console.log('pay url', response.data.data.url);
                        top.location.href = response.data.data.url;
                        resolve(response);
                    })
                }
            });
        })
        // .then(function (response) {
        //     // let url ="weixin://wap/pay?prepayid"+ encodeURIComponent(response.data.data.item.mweb_url.replace("https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?prepay_id", "") +`&noncestr=${response.data.data.item.nonce_str}&sign=${response.data.data.item.sign}`)
        //     return Object.assign(
        //         response,
        //         {
        //             data: Object.assign(
        //                 response.data,
        //                 {
        //                     data: Object.assign(
        //                         response.data.data,
        //                         {
        //                             item: Object.assign(
        //                                 response.data.data.item,
        //                                 {
        //                                     // mweb_url: response.data.data.item.mweb_url + `&redirect_url=${encodeURIComponent(window.location.href)}`
        //                                     mweb_url: url
        //                                 }
        //                             )
        //                         }
        //                     )
        //                 }
        //             )
        //         }
        //     )
        // });
    }

    identifyQuery({
                      open_id
                  }) {
        console.log('tmsdk identifyQuery');
        let programId = this._programId;
        let timestamp = new Date().getTime();
        let data = {
            open_id,
            timestamp
        }
        return axios.get(`https://api.kuaiyugo.com/api/oauth/v1/programs/${this._programId}/h5_query_id_card?open_id=${open_id}&timestamp=${timestamp}&sign=${this.sign({
            signBody: data,
            programId
        })}`)
    }

    identify({
                 open_id,
                 name,
                 id_card
             }) {
        console.log('tmsdk identify');
        let timestamp = new Date().getTime();
        let data = {
            open_id,
            name,
            id_card,
            timestamp
        }
        let programId = this._programId;
        return axios.post(`https://api.kuaiyugo.com/api/oauth/v1/programs/${this._programId}/h5_check_id_card`,
            Object.assign(
                data,
                {
                    sign: this.sign({signBody: data, programId})
                }
            )
        )
    }

    identifyReport({open_id}) {
        console.log('tmsdk identifyReport');
        let programId = this._programId;
        let timestamp = new Date().getTime();
        let data = {
            open_id,
            timestamp,
            behavior: 1
        }
        return axios.get(`https://api.kuaiyugo.com/api/oauth/v1/programs/${this._programId}/h5_report_user_behavior?open_id=${open_id}&behavior=1&timestamp=${timestamp}&sign=${this.sign({
            signBody: data,
            programId
        })}`)
    }
}

module.exports = new TMSDK()


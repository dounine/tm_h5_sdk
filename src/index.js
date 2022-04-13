import md5 from 'md5';
import axios from 'axios';

const TAGNAME = "tm_h5_sdk";

class TMSDK {
    constructor(props) {
        console.log('init')
        this.appid = "";
        this.appKey = "";
        this.programId = "";
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

    login({
              code = ''
          }) {
        let copyCoce = (code || this.getWindowUrlParams()["st"]) || '';
        console.log(TAGNAME, `login with code : ${copyCoce}`)
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
        let programId = this._programId;
        let timestamp = new Date().getTime();
        let data = {
            coin,
            program_param,
            open_id,
            timestamp
        }
        return axios.post(`https://api.kuaiyugo.com/api/payment/v1/programs/${this._programId}/h5_orders`,
            Object.assign(
                data,
                {
                    sign: this.sign({signBody: data, programId})
                }
            )
        )
    }

    identifyQuery({
                      open_id
                  }) {
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


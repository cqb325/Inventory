const React = require('react');
const ReactDOM = require('react-dom');
const Component = React.Component;
const Label = require('../lib/Label');
const Button = require('../lib/Button');
const Tile = require('../Tile');
const Table = require('../lib/Table');
const Input = require('../lib/Input');
const Select = require('../lib/Select');
const Form = require('../lib/Form');
const DateTime = require('../lib/DateTime');
const moment = require('../lib/moment');
const FormControl = require('../lib/FormControl');
const MessageBox = require('../lib/MessageBox');
const AutoComplete = require('../lib/AutoComplete');
const Format = require('../format');
const FontIcon = require('../lib/FontIcon');
const TextArea = require('../lib/TextArea');
const Dialog = require('../lib/Dialog');
const OpenDialog = require('../lib/mixins/OpenDialog');
const ReactRouter = require('react-router');
const hashHistory = ReactRouter.hashHistory;

const ExportService = require("../services/ExportService");
const ProviderService = require("../services/ProviderService");
const ProductService = require("../services/ProductService");

let Page = React.createClass({
    mixins: [OpenDialog],
    getInitialState(){
        return {
            order: null,
            refresh: 0
        };
    },

    payResult(){
        if(this.refs.tip.getData()){
            //window.location.reload();
            //hashHistory.replace("export_payFund/"+this.props.params.ord_no);
            this.loadOrderInfo();
            this.loadPayFund();
        }
    },

    closeDialog(){
        this.refs.pay_dialog.close();
    },

    componentDidMount(){
        this.loadOrderInfo();
        this.loadProducts();
        this.loadPayFund();
    },

    loadOrderInfo(){
        ExportService.getOrder(this.props.params.ord_no, this.props.params.type, (order)=>{
            this.setState({order});
        });
    },

    loadProducts(){
        ExportService.getProducts(this.props.params.ord_no, (products)=>{
            this.refs.import_table.setData(products);
        });
    },

    loadPayFund(){
        ExportService.getPayFunds(this.props.params.ord_no, (funds)=>{
            this.refs.fundTable.setData(funds);
        });
    },

    submitFund(){
        let fund = this.refs.fund_ele.getValue();
        let comment = this.refs.fund_comment.getValue();
        let params = {
            ord_no: this.props.params.ord_no,
            fund: fund,
            comment: comment
        };
        let orderIn = this.state.order;
        ExportService.payFund(params, orderIn, (ret)=>{
            this.refs.pay_dialog.close();
            if(ret) {
                this.refs.tip.show("收款成功");
                this.refs.tip.setData(true);
            }else{
                this.refs.tip.show("收款失败");
                this.refs.tip.setData(false);
            }
        });
    },

    submitForm(){
        this.refs.form.submit();
    },

    renderStatus(){
        let order = this.state.order;
        let data = ["已签合同","预收款","已收款","已发货","已收货"];
        let status = 0;
        if(order){
            status = order.ord_status;
            data[0] = <span>已签合同<br/>({moment(order.ord_time).format("YYYY-MM-DD")})</span>;
        }
        let status_index = status;
        if(status == 2){
            data = ["已签合同","预收款已发货","已收款","已收货"];
            status_index = 1;
            data[1] = <span>预付款已发货<br/>({moment(order.send_time).format("YYYY-MM-DD")})</span>;
        }
        if(status == 3){
            status_index = 2;
        }
        if(status >= 3){
            data[2] = <span>已付款<br/>({moment(order.fund_time).format("YYYY-MM-DD")})</span>;
        }
        if(status == 4){
            status_index = 3;
            data[3] = <span>已发货<br/>({moment(order.send_time).format("YYYY-MM-DD")})</span>;
        }
        if(status >= 4){
            data[3] = <span>已发货<br/>({moment(order.send_time).format("YYYY-MM-DD")})</span>;
        }
        if(status == 10){
            status_index = 4;
            data[status_index] = <span>已收货<br/>({moment(order.arrival_time).format("YYYY-MM-DD")})</span>;
        }

        let eles = data.map((item, index)=>{
            let clazz = index <= status_index ? "active" : "";
            return <li className={clazz} key={index}><a><span>{item}</span><span className="caret"></span></a></li>
        });
        return(
            <ul className="nav nav-pills nav-justified step step-progress">
                {eles}
            </ul>
        );
    },

    renderForm(){
        let order = this.state.order;

        let props = {
            disabled: true
        };
        if(order){
            props = {
            };

            window.setTimeout(()=>{
                this.refs.fund_ele.setRule("max", order.ord_fund_remain );
                this.refs.fund_ele.setMessage("max", "收款金额在1~"+order.ord_fund_remain+"之间" );
            },0);
        }
        return (
            <Form ref="form" method="custom"  useDefaultSubmitBtn={false} submit={this.submitFund}>
                <FormControl label="收款金额: " ref="fund_ele" type="number" name="fund" {...props} required rules={{min: 1}}
                    messages={{min: "收款金额需大于1"}}/>
                <FormControl label="收款情况: " ref="fund_comment" type="textarea" name="comment" />
            </Form>
        );
    },

    sendResult(flag){
        if(flag){
            let isValida = this.refs.send_time.check();
            let isValidb = this.refs.send_tracking.check();
            if(isValida && isValidb) {
                let sendTime = this.refs.send_time.getValue();
                let send_tracking = this.refs.send_tracking.getValue();
                ExportService.setSendStatus(this.props.params.ord_no, Format.ORDER_STATUS.SEND, sendTime, send_tracking, (ret)=> {
                    if (ret) {
                        this.loadOrderInfo();
                    } else {
                        this.refs.tip.show("提交失败");
                        this.refs.tip.setData(false);
                    }
                });
            }else{
                return false;
            }
        }
        return true;
    },

    importResult(flag){
        if(flag){
            let isValid = this.refs.arrival_time.check();
            if(isValid) {
                let arrivalTime = this.refs.arrival_time.getValue();
                ExportService.setStatus(this.props.params.ord_no, Format.ORDER_STATUS.IMPORTED, arrivalTime, (ret)=> {
                    if (ret) {
                        this.loadOrderInfo();
                    } else {
                        this.refs.tip.show("提交失败");
                        this.refs.tip.setData(false);
                    }
                });
            }else{
                return false;
            }
        }
        return true;
    },

    saveVoucher(flag){
        if(flag){
            let isValid = this.refs.voucher.check();
            if(isValid){
                let voucher = this.refs.voucher.getValue();
                ExportService.setVoucher(this.props.params.ord_no, voucher, (ret)=> {
                    if (ret) {
                        this.loadOrderInfo();
                    } else {
                        this.refs.tip.show("提交失败");
                        this.refs.tip.setData(false);
                    }
                });
            }else{
                return false;
            }
        }

        return true;
    },

    renderPayButton(){
        let orderIn = this.state.order;
        let voucherBtn = null;
        if(orderIn){
            if(!orderIn.voucher){
                voucherBtn = <Button theme="success" className="ml-20" raised={true} icon="paypal" ref="btn_2" data-toggle="dialog" data-target="voucherTip">填写凭证号</Button>;
            }
            if(orderIn.ord_fund_remain > 0) {
                return (
                    <Label className="mt-20 text-center mb-30">
                        <Button theme="success" raised={true} icon="cc-visa" ref="btn_4" data-toggle="dialog" data-target="pay_dialog">收 款</Button>
                        {voucherBtn}
                    </Label>
                );
            }else{
                if(orderIn.ord_status == Format.ORDER_STATUS.FUNDED){
                    return <Label className="mt-20 text-center mb-30">
                        <Button theme="success" raised={true} icon="cc-visa" ref="btn_5" data-toggle="dialog" data-target="sendTip">已发货</Button>
                        {voucherBtn}
                    </Label>
                }else if(orderIn.ord_status == Format.ORDER_STATUS.SEND){
                    return <Label className="mt-20 text-center mb-30">
                        <Button theme="success" raised={true} icon="cc-visa" ref="btn_3" data-toggle="dialog" data-target="importTip">已收货</Button>
                        {voucherBtn}
                    </Label>
                }else {
                    return <Label className="mt-20 text-center mb-30">{voucherBtn}</Label>;
                }
            }
        }
        return <Label className="mt-20 text-center mb-30"></Label>;
    },

    initInvoiceData(){
        let order = this.state.order;
        if(order) {
            let start = order.invoice_start ? moment(order.invoice_start).format("YYYY-MM-DD") : "";
            this.refs.invoice_start.setValue(start);
            let invoice_tracking = order.invoice_tracking ? order.invoice_tracking : "";
            this.refs.invoice_tracking.setValue(invoice_tracking);
        }
    },

    saveInvoice(flag){
        if(flag){
            let invoice_start = this.refs.invoice_start.getValue();
            let invoice_tracking = this.refs.invoice_tracking.getValue();
            if(invoice_start || invoice_tracking){
                let params = {};
                if(invoice_start){
                    params["invoice_start"] = invoice_start;
                }
                if(invoice_tracking){
                    params["invoice_tracking"] = invoice_tracking;
                }

                ExportService.saveInvoice(this.props.params.ord_no, params, (ret)=>{
                    if (ret) {
                        this.loadOrderInfo();
                    } else {
                        this.refs.tip.show("提交失败");
                        this.refs.tip.setData(false);
                    }
                });
            }
        }
        return true;
    },

    render(){
        let scope = this;
        let orderIn = this.state.order;

        let amountFormat = function(value, column, row){
            return value+"("+Format.unitDataMap[row.prod_unit]+")";
        };
        let header = [
            {name: "prod_name", text: "名称", tip: true},
            {name: "price", text: "单价"},
            {name: "prod_model", text: "型号"},
            {name: "prod_amount", text: "数量", format: amountFormat},
            {name: "prod_fund", text: "总价"}
        ];

        let fundHeader = [
            {name: "time", text: "收款时间", width: "25%"},
            {name: "fund", text: "收款金额(元)", width: "25%"},
            {name: "remain", text: "未收款金额(元)", width: "25%"},
            {name: "comment", text: "收款情况", width: "25%"}
        ];

        let details_footers = {
            components: [
                <Button theme="success" className="mr-20" onClick={this.submitForm} raised={true} icon="check">提 交</Button>,
                <Button theme="info"  className="ml-20" onClick={this.closeDialog} raised={true} icon="times">取 消</Button>
            ]
        };

        return (
            <div className="main-container">
                <Dialog title="收款" ref="pay_dialog" grid={0.3} footers={details_footers}>
                    <Label grid={0.5}>总金额: {orderIn? orderIn.ord_fund : "--"}元</Label>
                    <Label grid={0.5}>剩余金额: {orderIn? orderIn.ord_fund_remain : "--"}元</Label>
                    <div className="mt-20">
                        {this.renderForm()}
                    </div>
                </Dialog>

                <Dialog title="填写凭证号" ref="voucherTip" grid={0.3} onConfirm={this.saveVoucher}>
                    <div className="mt-20">
                        <FormControl label="凭证号: " className="flex" ref="voucher" name="voucher" required>
                            <Input type="text" className="auto" />
                        </FormControl>
                    </div>
                </Dialog>

                <Dialog title="已发货" ref="sendTip" grid={0.3} onConfirm={this.sendResult}>
                    <div className="mt-20">
                        <FormControl label="发货时间: " className="flex vertical-center" ref="send_time" name="sendTime" required>
                            <DateTime dateOnly={true} className="auto" />
                        </FormControl>
                        <FormControl label="发货单号: " className="flex" ref="send_tracking" name="send_tracking" required>
                            <Input className="auto" />
                        </FormControl>
                    </div>
                </Dialog>

                <Dialog title="已收货" ref="importTip" grid={0.3} onConfirm={this.importResult}>
                    <div className="mt-20">
                        <FormControl label="收货时间: " ref="arrival_time" type="datetime" dateOnly={true} required/>
                    </div>
                </Dialog>

                <Dialog title="修改发票信息" ref="invoiceTip" grid={0.3} onConfirm={this.saveInvoice} onOpen={this.initInvoiceData}>
                    <div className="mt-20">
                        <FormControl label="开票时间: " className="flex vertical-center" ref="invoice_start" name="invoice_start">
                            <DateTime dateOnly={true} className="auto" />
                        </FormControl>
                        <FormControl label="快递单号: " className="flex" ref="invoice_tracking" name="invoice_tracking">
                            <Input className="auto" />
                        </FormControl>
                    </div>
                </Dialog>

                <MessageBox title="提示" ref="tip" confirm={this.payResult}/>
                <Label className="searchTools mt-30 mb-20" component="div">
                    <Label grid={0.3}>
                        <h4>出库信息</h4>
                    </Label>
                    <Label grid={0.7} className="text-right">
                        <Button icon="mail-reply" theme="info" raised={true} href="javascript:history.go(-1)">返 回</Button>
                    </Label>
                </Label>

                <Tile header={<span><img src={IMGPATH+"contract.png"}/> 合同信息</span>}>
                    {this.renderStatus()}

                    <Label grid={1} className="mt-30">
                        <Label grid={0.5} className="mt-10">
                            <div className="flex">
                                <span className="details-label"><img src={IMGPATH+"contract.png"}/> 合同号: </span>
                                <span className="ml-10 underline auto">{orderIn? orderIn.ord_contract : ""}</span>
                            </div>
                        </Label>
                        <Label grid={0.5} className="mt-10">
                            <div className="flex">
                                <span className="details-label"><img src={IMGPATH+"icon-gys.png"}/> 客户: </span>
                                <span className="ml-10 underline auto">{orderIn? orderIn.cli_name||orderIn.staff_name : ""}</span>
                            </div>
                        </Label>
                        <Label grid={0.5} className="mt-10">
                            <div className="flex">
                                <span className="details-label"><img src={IMGPATH+"icon-clock.png"}/> 签单日期: </span>
                                <span className="ml-10 underline auto">{orderIn? moment(orderIn.ord_time).format("YYYY-MM-DD") : ""}</span>
                            </div>
                        </Label>
                        <Label grid={0.5} className="mt-10">
                            <div className="flex">
                                <span className="details-label"><img src={IMGPATH+"icon-user.png"}/> 签署人: </span>
                                <span className="ml-10 underline auto">{orderIn? orderIn.sign_user : ""}</span>
                            </div>
                        </Label>
                        <Label grid={0.5} className="mt-10">
                            <div className="flex">
                                <span className="details-label"><img src={IMGPATH+"icon-pz.png"}/> 凭证号: </span>
                                <span className="ml-10 underline auto">{orderIn? orderIn.voucher : ""}</span>
                            </div>
                        </Label>
                        <Label grid={0.5} className="mt-10">
                            <div className="flex">
                                <span className="details-label"><img src={IMGPATH+"icon-qrcode.png"}/> 发货单号: </span>
                                <span className="ml-10 underline auto">{orderIn? orderIn.send_tracking : ""}</span>
                            </div>
                        </Label>
                        <Label grid={0.5} className="mt-10">
                            <div className="flex">
                                <span className="details-label"><img src={IMGPATH+"icon-comment.png"}/> 备注: </span>
                                <span className="ml-10 underline auto">{orderIn? orderIn.ord_comment : ""}</span>
                            </div>
                        </Label>
                    </Label>
                </Tile>

                <Label grid={1} className="mt-20">
                    <span>总价: <span ref="total">{orderIn? orderIn.ord_fund : "--"}</span>元</span>
                    <span className="ml-30">剩余: <span ref="remain" style={{color: "red"}}>{orderIn? orderIn.ord_fund_remain : "--"}</span>元</span>
                    <Tile header={<span><FontIcon icon="dropbox" style={{color: "#EA8010" }}/> 出库产品</span>} >
                        <Table ref="import_table" header={header} data={[]} striped={true} className="text-center"/>
                    </Tile>
                </Label>

                <Label grid={1} className="mt-20">
                    <Tile header={<span><FontIcon icon="ticket" style={{color: "#EA8010" }}/> 收款记录</span>} >
                        <Table ref="fundTable" header={fundHeader} data={[]} striped={true} className="text-center"/>
                    </Tile>
                </Label>

                <Label grid={1} className="mt-20">
                    <Tile header={<span className="flex vertical-center"><img src={IMGPATH+"icon-fp.png"}/> 发票信息
                            <span className="auto text-right">
                            <Button icon="edit" theme="success" className="editBtn" ref="btn_1" data-toggle="dialog" data-target="invoiceTip">编辑</Button>
                            </span>
                        </span>} >
                        <Label grid={0.5} className="mt-10">
                            <div className="flex">
                                <span className="details-label"><img src={IMGPATH+"icon-clock.png"}/> 开票时间: </span>
                                <span className="ml-10 auto">{orderIn && orderIn.invoice_start ? moment(orderIn.invoice_start).format("YYYY-MM-DD") : ""}</span>
                            </div>
                        </Label>
                        <Label grid={0.5} className="mt-10">
                            <div className="flex">
                                <span className="details-label"><img src={IMGPATH + "icon-qrcode.png"}/> 快递单号: </span>
                                <span className="ml-10 auto">{orderIn && orderIn.invoice_tracking ? orderIn.invoice_tracking : ""}</span>
                            </div>
                        </Label>
                    </Tile>
                </Label>

                {this.renderPayButton()}
            </div>
        );
    }
});

module.exports = Page;
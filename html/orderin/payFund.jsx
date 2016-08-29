const React = require('react');
const ReactDOM = require('react-dom');
const Component = React.Component;
const Label = require('../lib/Label');
const Button = require('../lib/Button');
const Tile = require('../Tile');
const Table = require('../lib/Table');
const Input = require('../lib/Input');
const Select = require('../lib/Select');
const DateTime = require('../lib/DateTime');
const Form = require('../lib/Form');
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

const ImportService = require("../services/ImportService");
const ProviderService = require("../services/ProviderService");
const ProductService = require("../services/ProductService");

let Page = React.createClass({
    mixins: [OpenDialog],
    getInitialState(){
        return {
            orderIn: null
        };
    },

    payResult(){
        if(this.refs.tip.getData()){
            window.location.reload();
        }
    },

    closeDialog(){
        this.refs.pay_dialog.close();
    },

    componentDidMount(){
        this.loadOrderInInfo();
        this.loadProducts();
        this.loadPayFund();
    },

    loadOrderInInfo(){
        ImportService.getOrderIn(this.props.params.ord_no, (orderIn)=>{
            this.setState({orderIn});
        });
    },

    loadProducts(){
        ImportService.getProducts(this.props.params.ord_no, (products)=>{
            this.refs.import_table.setData(products);
        });
    },

    loadPayFund(){
        ImportService.getPayFunds(this.props.params.ord_no, (funds)=>{
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
        let orderIn = this.state.orderIn;
        ImportService.payFund(params, orderIn, (ret)=>{
            if(ret) {
                this.refs.tip.show("付款成功");
                this.refs.tip.setData(true);
            }else{
                this.refs.tip.show("付款失败");
                this.refs.tip.setData(false);
            }
        });
    },

    submitForm(){
        this.refs.form.submit();
    },

    renderStatus(){
        let orderIn = this.state.orderIn;
        let data = ["已签合同","预付款","已付款","已发货","已入库"];
        let status = 0;
        if(orderIn){
            status = orderIn.ord_status;
            data[0] = <span>已签合同<br/>({moment(orderIn.ord_time).format("YYYY-MM-DD")})</span>;
        }
        let status_index = status;
        if(status == 2){
            data = ["已签合同","预付款已发货","已付款","已入库"];
            status_index = 1;
            data[1] = <span>预付款已发货<br/>({moment(orderIn.send_time).format("YYYY-MM-DD")})</span>;
        }
        if(status == 3){
            status_index = 2;
        }
        if(status >= 3){
            data[2] = <span>已付款<br/>({moment(orderIn.fund_time).format("YYYY-MM-DD")})</span>;
        }
        if(status == 4){
            status_index = 3;
            data[3] = <span>已发货<br/>({moment(orderIn.send_time).format("YYYY-MM-DD")})</span>;
        }
        if(status >= 4){
            data[3] = <span>已发货<br/>({moment(orderIn.send_time).format("YYYY-MM-DD")})</span>;
        }
        if(status == 10){
            status_index = 4;
            data[status_index] = <span>已入库<br/>({moment(orderIn.arrival_time).format("YYYY-MM-DD")})</span>;
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
        let orderIn = this.state.orderIn;

        let props = {
            disabled: true
        };
        if(orderIn){
            props = {
            };

            window.setTimeout(()=>{
                this.refs.fund_ele.setRule("max", orderIn.ord_fund_remain );
                this.refs.fund_ele.setMessage("max", "付款金额在1~"+orderIn.ord_fund_remain+"之间" );
            },0);
        }
        return (
            <Form ref="form" method="custom"  useDefaultSubmitBtn={false} submit={this.submitFund}>
                <FormControl label="付款金额: " ref="fund_ele" type="number" name="fund" {...props} required rules={{min: 1}}
                    messages={{min: "付款金额需大于1"}}/>
                <FormControl label="付款情况: " ref="fund_comment" type="textarea" name="comment" />
            </Form>
        );
    },

    closeSendDialog(){
        this.refs.sendTip.close();
    },

    sendResult(){
        let isValid = this.refs.send_time.check();
        if(isValid) {
            let sendTime = this.refs.send_time.getValue();
            ImportService.setStatus(this.props.params.ord_no, Format.ORDER_STATUS.SEND, sendTime, (ret)=> {
                if (ret) {
                    window.location.reload();
                } else {
                    this.refs.tip.show("提交失败");
                    this.refs.tip.setData(false);
                }
            });
        }
    },

    closeImportDialog(){
        this.refs.importTip.close();
    },

    importResult(){
        let isValid = this.refs.arrival_time.check();
        if(isValid) {
            let arrivalTime = this.refs.arrival_time.getValue();
            ImportService.setStatus(this.props.params.ord_no, Format.ORDER_STATUS.IMPORTED, arrivalTime, (ret)=> {
                if (ret) {
                    window.location.reload();
                } else {
                    this.refs.tip.show("提交失败");
                    this.refs.tip.setData(false);
                }
            });
        }
    },

    saveVoucher(flag){
        if(flag){
            let isValid = this.refs.voucher.check();
            if(isValid){
                let voucher = this.refs.voucher.getValue();
                ImportService.setVoucher(this.props.params.ord_no, voucher, (ret)=> {
                    if (ret) {
                        window.location.reload();
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
        let orderIn = this.state.orderIn;
        let voucherBtn = null;
        if(orderIn){
            if(!orderIn.voucher){
                voucherBtn = <Button theme="success" className="ml-20" raised={true} icon="paypal" ref="btn_2" data-toggle="dialog" data-target="voucherTip">填写凭证号</Button>;
            }

            if(orderIn.ord_fund_remain > 0) {
                return (
                    <Label className="mt-20 text-center mb-30">
                        <Button theme="success" raised={true} icon="cc-visa" ref="btn_4" data-toggle="dialog" data-target="pay_dialog">付 款</Button>
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
                        <Button theme="success" raised={true} icon="cc-visa" ref="btn_3" data-toggle="dialog" data-target="importTip">已入库</Button>
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
        let order = this.state.orderIn;
        if(order) {
            let start = order.invoice_start ? moment(order.invoice_start).format("YYYY-MM-DD") : "";
            this.refs.invoice_start.setValue(start);
            let end = order.invoice_arrival ? moment(order.invoice_arrival).format("YYYY-MM-DD") : "";
            this.refs.invoice_arrival.setValue(end);
        }
    },

    saveInvoice(flag){
        if(flag){
            let invoice_start = this.refs.invoice_start.getValue();
            let invoice_arrival = this.refs.invoice_arrival.getValue();
            if(invoice_start || invoice_arrival){
                let params = {};
                if(invoice_start){
                    params["invoice_start"] = invoice_start;
                }
                if(invoice_arrival){
                    params["invoice_arrival"] = invoice_arrival;
                }

                ImportService.saveInvoice(this.props.params.ord_no, params, (ret)=>{
                    if (ret) {
                        window.location.reload();
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
        let orderIn = this.state.orderIn;

        let amountFormat = function(value, column, row){
            return value+"("+row.prod_unit+")";
        };
        let header = [
            {name: "prod_name", text: "名称", tip: true},
            {name: "prod_price", text: "单价"},
            {name: "prod_model", text: "型号"},
            {name: "prod_amount", text: "数量", format: amountFormat},
            {name: "prod_fund", text: "总价"}
        ];

        let fundHeader = [
            {name: "time", text: "付款时间", width: "25%"},
            {name: "fund", text: "付款金额(元)", width: "25%"},
            {name: "remain", text: "未付款金额(元)", width: "25%"},
            {name: "comment", text: "付款情况", width: "25%"}
        ];

        let details_footers = {
            components: [
                <Button theme="success" className="mr-20" onClick={this.submitForm} raised={true} icon="check">提 交</Button>,
                <Button theme="info"  className="ml-20" onClick={this.closeDialog} raised={true} icon="times">取 消</Button>
            ]
        };

        let send_footers = {
            components: [
                <Button theme="success" className="mr-20" onClick={this.sendResult} raised={true} icon="check">确 定</Button>,
                <Button theme="info"  className="ml-20" onClick={this.closeSendDialog} raised={true} icon="times">取 消</Button>
            ]
        };

        let arrival_footers = {
            components: [
                <Button theme="success" className="mr-20" onClick={this.importResult} raised={true} icon="check">确 定</Button>,
                <Button theme="info"  className="ml-20" onClick={this.closeImportDialog} raised={true} icon="times">取 消</Button>
            ]
        };

        return (
            <div className="main-container">
                <Dialog title="预付款" ref="pay_dialog" grid={0.3} footers={details_footers}>
                    <Label grid={0.5}>总金额: {orderIn? orderIn.ord_fund : "--"}元</Label>
                    <Label grid={0.5}>剩余金额: {orderIn? orderIn.ord_fund_remain : "--"}元</Label>
                    <div className="mt-20">
                        {this.renderForm()}
                    </div>
                </Dialog>

                <Dialog title="已发货" ref="sendTip" grid={0.3} footers={send_footers}>
                    <div className="mt-20">
                        <FormControl label="填写发货时间: " ref="send_time" type="datetime" name="sendTime" dateOnly={true} required/>
                    </div>
                </Dialog>

                <Dialog title="已入库" ref="importTip" grid={0.3} footers={arrival_footers}>
                    <div className="mt-20">
                        <FormControl label="填写入库时间: " ref="arrival_time" type="datetime" dateOnly={true} required/>
                    </div>
                </Dialog>

                <Dialog title="填写凭证号" ref="voucherTip" grid={0.3} onConfirm={this.saveVoucher}>
                    <div className="mt-20">
                        <FormControl label="凭证号: " className="flex" ref="voucher" name="voucher" required>
                            <Input type="text" className="auto" />
                        </FormControl>
                    </div>
                </Dialog>

                <Dialog title="修改发票信息" ref="invoiceTip" grid={0.3} onConfirm={this.saveInvoice} onOpen={this.initInvoiceData}>
                    <div className="mt-20">
                        <FormControl label="开票时间: " className="flex vertical-center" ref="invoice_start" name="invoice_start">
                            <DateTime dateOnly={true} className="auto" />
                        </FormControl>
                        <FormControl label="到票时间: " className="flex" ref="invoice_arrival" name="invoice_arrival">
                            <DateTime dateOnly={true} className="auto" />
                        </FormControl>
                    </div>
                </Dialog>

                <MessageBox title="提示" ref="tip" confirm={this.payResult}/>
                <Label className="searchTools mt-30 mb-20" component="div">
                    <Label grid={0.3}>
                        <h4>入库信息</h4>
                    </Label>
                </Label>

                <Tile header={<span><img src={IMGPATH+"contract.png"}/> 合同信息</span>}>
                    {this.renderStatus()}

                    <Label grid={1} className="mt-30">
                        <Label grid={0.5} className="mt-10">
                            <div className="flex">
                                <span className="details-label"><img src={IMGPATH+"contract.png"}/> 采购合同号: </span>
                                <span className="ml-10 underline auto">{orderIn? orderIn.ord_contract : ""}</span>
                            </div>
                        </Label>
                        <Label grid={0.5} className="mt-10">
                            <div className="flex">
                                <span className="details-label"><img src={IMGPATH+"contract.png"}/> 销售合同号: </span>
                                <span className="ml-10 underline auto">{orderIn? orderIn.sale_contract : ""}</span>
                            </div>
                        </Label>
                        <Label grid={0.5} className="mt-10">
                            <div className="flex">
                                <span className="details-label"><img src={IMGPATH+"icon-gys.png"}/> <span className="letter-space-1">供应商</span>: </span>
                                <span className="ml-10 underline auto">{orderIn? orderIn.prov_name : ""}</span>
                            </div>
                        </Label>
                        <Label grid={0.5} className="mt-10">
                            <div className="flex">
                                <span className="details-label"><img src={IMGPATH+"icon-clock.png"}/> <span className="letter-space-2">签订日期</span>: </span>
                                <span className="ml-10 underline auto">{orderIn? moment(orderIn.ord_time).format("YYYY-MM-DD") : ""}</span>
                            </div>
                        </Label>
                        <Label grid={0.5} className="mt-10">
                            <div className="flex">
                                <span className="details-label"><img src={IMGPATH+"icon-pz.png"}/> <span className="letter-space-1">凭证号</span>: </span>
                                <span className="ml-10 underline auto">{orderIn? orderIn.voucher : ""}</span>
                            </div>
                        </Label>
                        <Label grid={1} className="mt-10">
                            <div className="flex">
                                <span className="details-label"><img src={IMGPATH+"icon-comment.png"}/> <span className="letter-space-3">备注</span>: </span>
                                <span className="ml-10 underline auto">{orderIn? orderIn.ord_comment : ""}</span>
                            </div>
                        </Label>
                    </Label>
                </Tile>

                <Label grid={1} className="mt-20">
                    <span>总价: <span ref="total">{orderIn? orderIn.ord_fund : "--"}</span>元</span>
                    <span className="ml-30">剩余: <span ref="remain" style={{color: "red"}}>{orderIn? orderIn.ord_fund_remain : "--"}</span>元</span>
                    <Tile header={<span><FontIcon icon="dropbox" style={{color: "#EA8010" }}/> 入库产品</span>} >
                        <Table ref="import_table" header={header} data={[]} striped={true} className="text-center"/>
                    </Tile>
                </Label>

                <Label grid={1} className="mt-20">
                    <Tile header={<span><FontIcon icon="ticket" style={{color: "#EA8010" }}/> 付款记录</span>} >
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
                                <span className="details-label"><img src={IMGPATH + "icon-clock.png"}/> 到票时间: </span>
                                <span className="ml-10 auto">{orderIn && orderIn.invoice_arrival ? moment(orderIn.invoice_arrival).format("YYYY-MM-DD") : ""}</span>
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
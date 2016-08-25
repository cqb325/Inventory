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
const moment = require('../lib/moment');
const FormControl = require('../lib/FormControl');
const MessageBox = require('../lib/MessageBox');
const AutoComplete = require('../lib/AutoComplete');
const Format = require('../format');
const FontIcon = require('../lib/FontIcon');
const TextArea = require('../lib/TextArea');
const Dialog = require('../lib/Dialog');
const ReactRouter = require('react-router');
const hashHistory = ReactRouter.hashHistory;

const ImportService = require("../services/ImportService");
const ProviderService = require("../services/ProviderService");
const ProductService = require("../services/ProductService");

let Page = React.createClass({

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

    showPayDialog(){
        this.refs.pay_dialog.open();
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
        let params = {
            ord_no: this.props.params.ord_no,
            fund: fund
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
        }
        let status_index = status;
        if(status == 2){
            data = ["已签合同","预付款已发货","已付款","已入库"];
            status_index = 1;
        }
        if(status == 3){
            status_index = 2;
        }
        if(status == 4){
            status_index = 3;
        }
        if(status == 10){
            status_index = 4;
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
            </Form>
        );
    },

    showSendDialog(){
        this.refs.sendTip.show("确认已经发货?");
    },

    sendResult(flag){
        if(flag){
            ImportService.setStatus(this.props.params.ord_no, Format.ORDER_STATUS.SEND, (ret)=>{
                if(ret){
                    window.location.reload();
                }else{
                    this.refs.tip.show("提交失败");
                    this.refs.tip.setData(false);
                }
            });
        }
        return true;
    },

    showImportedDialog(){
        this.refs.importTip.show("确认已经入库?");
    },

    importResult(flag){
        if(flag){
            ImportService.setStatus(this.props.params.ord_no, Format.ORDER_STATUS.IMPORTED, (ret)=>{
                if(ret){
                    window.location.reload();
                }else{
                    this.refs.tip.show("提交失败");
                    this.refs.tip.setData(false);
                }
            });
        }
        return true;
    },

    renderPayButton(){
        let orderIn = this.state.orderIn;
        if(orderIn){
            if(orderIn.ord_fund_remain > 0) {
                return (
                    <Label className="mt-20 text-center mb-30">
                        <Button theme="success" raised={true} icon="cc-visa" onClick={this.showPayDialog}>付 款</Button>
                    </Label>
                );
            }else{
                if(orderIn.ord_status == Format.ORDER_STATUS.FUNDED){
                    return <Label className="mt-20 text-center mb-30">
                        <Button theme="success" raised={true} icon="cc-visa" onClick={this.showSendDialog}>已发货</Button>
                    </Label>
                }else if(orderIn.ord_status == Format.ORDER_STATUS.SEND){
                    return <Label className="mt-20 text-center mb-30">
                        <Button theme="success" raised={true} icon="cc-visa" onClick={this.showImportedDialog}>已入库</Button>
                    </Label>
                }else {
                    return <Label className="mt-20 text-center mb-30"></Label>;
                }
            }
        }
        return <Label className="mt-20 text-center mb-30"></Label>;
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
            {name: "time", text: "付款时间", width: "50%"},
            {name: "fund", text: "付款金额(元)", width: "50%"}
        ];

        let details_footers = {
            components: [
                <Button theme="success" className="mr-20" onClick={this.submitForm} raised={true} icon="check">提 交</Button>,
                <Button theme="info"  className="ml-20" onClick={this.closeDialog} raised={true} icon="times">取 消</Button>
            ]
        };

        return (
            <div className="main-container">
                <Dialog title="预付款" ref="pay_dialog" grid={0.3} footers={details_footers}>
                    <Label grid={0.5}>总金额: {orderIn? orderIn.ord_fund : "--"}</Label>
                    <Label grid={0.5}>剩余金额: {orderIn? orderIn.ord_fund_remain : "--"}</Label>
                    <div className="mt-20">
                        {this.renderForm()}
                    </div>
                </Dialog>

                <MessageBox title="提示" ref="tip" confirm={this.payResult}/>
                <MessageBox title="提示" type="confirm" ref="sendTip" confirm={this.sendResult}/>
                <MessageBox title="提示" type="confirm" ref="importTip" confirm={this.importResult}/>
                <Label className="searchTools mt-30 mb-20" component="div">
                    <Label grid={0.3}>
                        <h4>入库信息</h4>
                    </Label>
                    <Label grid={0.7} className="text-right">
                        <Button icon="mail-reply" theme="info" raised={true} href="javascript:history.go(-1)">返 回</Button>
                    </Label>
                </Label>

                <Tile header={<span><img src={IMGPATH+"contract.png"}/> 合同信息</span>}>
                    {this.renderStatus()}

                    <Label grid={1} className="mt-30">
                        <Label grid={1} className="mt-10">
                            <span><img src={IMGPATH+"contract.png"}/> 合同号: </span>
                            <span className="ml-10 underline">{orderIn? orderIn.ord_contract : ""}</span>
                        </Label>
                        <Label grid={1} className="mt-10">
                            <span><img src={IMGPATH+"icon-gys.png"}/> 供应商: </span>
                            <span className="ml-10 underline">{orderIn? orderIn.prov_name : ""}</span>
                        </Label>
                        <Label grid={1} className="mt-10">
                            <span><img src={IMGPATH+"icon-clock.png"}/> 下单时间: </span>
                            <span className="ml-10 underline">{orderIn? moment(orderIn.ord_time).format("YYYY-MM-DD HH:mm:ss") : ""}</span>
                        </Label>
                        <Label grid={1} className="mt-10">
                            <span><img src={IMGPATH+"icon-comment.png"}/> 备注: </span>
                            <span className="ml-10 underline">{orderIn? orderIn.ord_comment : ""}</span>
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

                {this.renderPayButton()}
            </div>
        );
    }
});

module.exports = Page;
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
const FormControl = require('../lib/FormControl');
const MessageBox = require('../lib/MessageBox');
const AutoComplete = require('../lib/AutoComplete');
const Format = require('../format');
const TextArea = require('../lib/TextArea');
const moment = require('../lib/moment');

const ImportService = require("../services/ImportService");
const ExportService = require("../services/ExportService");
const StaffService = require("../services/StaffService");
const ProductService = require("../services/ProductService");

let Page = React.createClass({

    getInitialState(){

        this.products = null;
        return {
            order: null
        };
    },

    componentDidMount(){
        this.loadOrderInfo();
        this.getBorrowedProducts(this.props.params.ord_no);
    },

    gotoList(flag){
        if(flag){
            window.location.href = "#import_backList";
        }
    },

    loadOrderInfo(){
        ExportService.getOrder(this.props.params.ord_no, Format.ORDER_TYPE.INNER_BORROW, (order)=>{
            this.setState({order});
        });
    },

    getBorrowedProducts(ord_no){
        ImportService.getProducts(ord_no, (products)=>{
            this.products = products;
            this.refs.table.setData(products);
        });
    },

    saveForm(){
        let order = this.state.order;
        let formItems = this.refs.form.getItems();
        if(!this.refs.form.isValid()){
            return false;
        }
        let params = {
            prov_id: order.prov_id,
            ord_comment: formItems["ord_comment"].ref.getValue(),
            sale_contract: order.sale_contract,
            ord_time: formItems["ord_time"].ref.getValue()
        };

        let prod_params = [];
        this.products.forEach((item)=>{
            prod_params.push({
                prod_id: item.prod_id,
                prod_amount: item.prod_amount,
                prod_fund: item.prod_fund,
                prod_price: item.prod_price
            });
        });

        ImportService.back(params, prod_params, (ret)=>{
            if(ret){
                this.refs.tip.show("提交成功");
                this.refs.tip.setData(ret);
            }else{
                this.refs.tip.show("提交失败");
                this.refs.tip.setData(false);
            }
        });
    },

    render(){
        let scope = this;
        let order = this.state.order;

        let header = [
            {name: "prod_name", text: "产品名称"},
            {name: "prod_amount", text: "数量"}
        ];

        return (
            <div className="main-container">
                <MessageBox title="提示" ref="tip" confirm={this.gotoList}/>
                <Label className="searchTools mt-30 mb-20" component="div">
                    <Label grid={0.3}>
                        <h4>产品归还</h4>
                    </Label>
                    <Label grid={0.7} className="text-right">
                        <Button icon="mail-reply" theme="info" raised={true} href="javascript:history.go(-1)">返 回</Button>
                    </Label>
                </Label>
                <Tile header="入库信息" >
                    <Form ref="form" method="custom" layout="stack" useDefaultSubmitBtn={false}>
                        <FormControl label={<span><img src={IMGPATH+"icon-clock.png"}/> 归还日期: </span>} type="datetime" dateOnly={true} value={moment().format("YYYY-MM-DD")} endDate={moment()} name="ord_time" grid={1} required></FormControl>
                        <FormControl label={<span><img src={IMGPATH+"icon-gys.png"}/> 归还人: </span>} ref="staff" reacdOnly={true} type="text" value={order? order.staff_name: ""} grid={1} required></FormControl>
                        <Input type="hidden" name="staff_id" value={order? order.staff_id: ""}/>
                        <FormControl label={<span><img src={IMGPATH+"icon-comment.png"}/> 备注: </span>} type="textarea" name="ord_comment" grid={1}></FormControl>
                    </Form>
                </Tile>

                <Tile header="产品列表" contentStyle={{padding: "0px"}}>
                    <div style={{overflow: 'hidden'}}>
                        <Table ref="table" header={header} data={[]} striped={true} className="text-center"/>
                    </div>
                </Tile>

                <Label className="mt-20 text-center mb-30">
                    <Button theme="success" raised={true} onClick={this.saveForm}>归还</Button>
                </Label>
            </div>
        );
    }
});

module.exports = Page;
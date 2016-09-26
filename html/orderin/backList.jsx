const React = require('react');
const ReactDOM = require('react-dom');
const Component = React.Component;
const Label = require('../lib/Label');
const Button = require('../lib/Button');
const Tile = require('../Tile');
const Table = require('../lib/Table');
const Dialog = require('../lib/Dialog');
const MessageBox = require('../lib/MessageBox');
const Format = require('../format');
const OpenDialog = require('../lib/mixins/OpenDialog');

const ImportService = require("../services/ImportService");

let Page = React.createClass({
    mixins: [OpenDialog],
    getInitialState(){
        this.products = {};
        this.funds = {};
        this.counts = {};
        this.prices = {};
        return {
        };
    },

    payFund(){
        let ord_no = this.refs.tip.getData();
        if(ord_no){
            window.location.href = "#import_payFund/"+ord_no;
        }
    },

    componentDidMount(){
        this.reloadTableData();
    },

    reloadTableData(){
        ImportService.getAllUnBackInnerOrders((orders)=>{
            this.refs.table.setData(orders);
        });
    },

    getBorrowedProducts(ord_no){
        ImportService.getProducts(ord_no, (products)=>{
            this.refs.ptable.setData(products);
        });
    },

    openDetails(ord_no){
        this.refs.details_dialog.open();
        this.refs.details_dialog.setData(ord_no);
        this.getBorrowedProducts(ord_no);
    },

    render(){
        let scope = this;
        let btnFormat = function(value, column, row){
            return (<span>
                <Button icon="mail-reply-all" theme="success" flat={true} href={"#import_back/"+row.ord_no}>归还</Button>
                <Button icon="list" className="ml-10" theme="success" flat={true} onClick={scope.openDetails.bind(scope, row.ord_no)}>详情</Button>
            </span>);
        };

        let header = [
            {name: "staff_name", text: "借用员工"},
            {name: "ord_time", text: "借用时间", format: "DateTimeFormat"},
            {name: "ops", text: "操作", format: btnFormat}
        ];

        let pheader = [
            {name: "prod_name", text: "产品名称"},
            {name: "prod_amount", text: "数量"}
        ];

        return (
            <div className="main-container">
                <MessageBox title="提示" ref="tip" confirm={this.payFund}/>

                <Dialog title="借用产品列表" ref="details_dialog" grid={0.3}>
                    <div className="mt-20">
                        <Table ref="ptable" header={pheader} data={[]} striped={true} className="text-center"/>
                    </div>
                </Dialog>

                <Label className="searchTools mt-30 mb-20" component="div">
                    <Label grid={0.3}>
                        <h4>产品归还</h4>
                    </Label>
                    <Label grid={0.7} className="text-right">
                        <Button icon="mail-reply" theme="info" raised={true} href="javascript:history.go(-1)">返 回</Button>
                    </Label>
                </Label>
                <Tile header="借用列表" contentStyle={{padding: "0px"}}>
                    <div style={{overflow: 'hidden'}}>
                        <Table ref="table" header={header} data={[]} striped={true} className="text-center"/>
                    </div>
                </Tile>
            </div>
        );
    }
});

module.exports = Page;
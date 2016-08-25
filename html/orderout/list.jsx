/**
 * Created by cqb32_000 on 2016-07-19.
 */

const React = require('react');
const ReactDOM = require('react-dom');
const Component = React.Component;
const Label = require('../lib/Label');
const Button = require('../lib/Button');
const Tile = require('../Tile');
const Table = require('../lib/Table');
const Pagination = require('../lib/Pagination');
const Input = require('../lib/Input');
const Select = require('../lib/Select');
const DateRange = require('../lib/DateRange');
const moment = require('../lib/moment');
const FormControl = require('../lib/FormControl');
const MessageBox = require('../lib/MessageBox');
const Format = require('../format');

const ExportService = require("../services/ExportService");

let List = React.createClass({

    getInitialState(){
        this.pageNum = 1;
        this.pageSize = 15;
        return {};
    },

    reloadTableData(pageNum, pageSize){
        let dateRange = this.refs.dateRange.getValue();
        let params = Object.assign({},{
            pageNum: pageNum,
            pageSize: pageSize,
            cli_name: this.refs.cli_name.getValue(),
            startDate: dateRange[0],
            endDate: dateRange[1],
            ord_contract: this.refs.ord_contract.getValue(),
            ord_status: this.refs.ord_status.getValue()
        });

        ExportService.getPageList(params, (ret)=>{
            this.refs.table.setData(ret.data);
            this.refs.pagination.update({
                current: ret.pageNum,
                pageSize: ret.pageSize,
                total: ret.total
            });

            this.pageNum = ret.pageNum;
            this.pageSize = ret.pageSize;
        });
    },

    search(){
        this.reloadTableData(this.pageNum, this.pageSize);
    },

    showConfirm(id){
        this.refs.confirm.show("确认删除该合同记录？");
        this.refs.confirm.setData(id);
    },

    confirmDelete(flag){
        if(flag) {
            var ord_no = this.refs.confirm.getData();
            ExportService.deleteOrder(ord_no, (ret)=>{
                if(ret){
                    this.refs.tip.show("删除成功");
                    this.refs.tip.setData(true);
                }else{
                    this.refs.tip.show("删除失败");
                    this.refs.tip.setData(false);
                }
            });

            return true;
        }
    },

    confirmDRefresh(){
        if(this.refs.tip.getData()){
            this.search();
        }
    },

    componentDidMount(){
        this.reloadTableData();
    },

    sendConfirm(ord_no){
        this.refs.sendTip.show("确认已经发货?");
        this.refs.sendTip.setData(ord_no);
    },

    importConfirm(ord_no){
        this.refs.importTip.show("确认对方已经收货?");
        this.refs.importTip.setData(ord_no);
    },

    sendResult(flag){
        let ord_no = this.refs.sendTip.getData();
        if(flag){
            ExportService.setStatus(ord_no, Format.ORDER_STATUS.SEND, (ret)=>{
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

    importResult(flag){
        let ord_no = this.refs.importTip.getData();
        if(flag){
            ExportService.setStatus(ord_no, Format.ORDER_STATUS.IMPORTED, (ret)=>{
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

    render(){
        let scope = this;
        let btnFormat = function (value, column, row) {
            let btns = [];

            let deleteBtn = <Button key="1" theme="success" className="ml-10" icon="trash" flat={true} onClick={scope.showConfirm.bind(scope, row.prov_id)}>删除</Button>;
            let payBtn = <Button key="2" theme="success" className="ml-10" icon="cc-visa" flat={true} href={"#export_payFund/"+row.ord_no}>收款</Button>;
            let sendBtn = <Button key="3" theme="success" className="ml-10" icon="cc-visa" flat={true} onClick={scope.sendConfirm.bind(scope, row.ord_no)}>已发货</Button>;
            let importBtn = <Button key="4" theme="success" className="ml-10" icon="cc-visa" flat={true} onClick={scope.importConfirm.bind(scope, row.ord_no)}>已收货</Button>;
            if(row.ord_status < Format.ORDER_STATUS.FUND){
                btns.push(deleteBtn);
                btns.push(payBtn);
            }else if(row.ord_status == Format.ORDER_STATUS.FUND){
                btns.push(payBtn);
                btns.push(sendBtn);
            }else if(row.ord_status == Format.ORDER_STATUS.FUND_SEND){
                btns.push(payBtn);
            }else if(row.ord_status == Format.ORDER_STATUS.FUNDED){
                btns.push(sendBtn);
            }else if(row.ord_status == Format.ORDER_STATUS.SEND){
                btns.push(importBtn);
            }
            return (<span>
                {btns}
            </span>);
        };

        let statusFormatData = {
            "0": "已签合同",
            "1": "预收款",
            "2": "预收款已发货",
            "3": "已收款",
            "4": "已发货",
            "10": "已收货"
        };

        let statusFormat = function(value, column, row){
            return statusFormatData[value];
        };

        let header = [
            {name: "ord_contract", text: "合同编号"},
            {name: "ord_time", text: "合同签订时间", format: "DateTimeFormat"},
            {name: "cli_name", text: "客户"},
            {name: "ord_fund", text: "金额"},
            {name: "ord_status", text: "合同状态", format: statusFormat},
            {name: "ops", text: "操作", format: btnFormat}
        ];

        let statusData = [
            {id: "0", text: "已签合同"},
            {id: "1", text: "预收款"},
            {id: "2", text: "预收款已发货"},
            {id: "3", text: "已收款"},
            {id: "4", text: "已发货"},
            {id: "10", text: "已收货"}
        ];

        return (
            <div className="main-container">
                <MessageBox title="提示" ref="confirm" type="confirm" confirm={this.confirmDelete}/>
                <MessageBox title="提示" ref="tip" confirm={this.confirmDRefresh}/>
                <MessageBox title="提示" type="confirm" ref="sendTip" confirm={this.sendResult}/>
                <MessageBox title="提示" type="confirm" ref="importTip" confirm={this.importResult}/>
                <Label className="searchTools mt-30 mb-20" component="div">
                    <Label className="" grid={0.15}>
                        <Button icon="plus" theme="success" href="#export_add">新增出库</Button>
                    </Label>

                    <Label className="text-right" grid={0.85}>
                        <FormControl ref="dateRange" label="时间: " type="daterange" endDate={moment()}></FormControl>
                        <FormControl ref="ord_contract" label="合同号: " type="text"></FormControl>
                        <FormControl ref="ord_status" label="状态: " type="select" data={statusData} className="text-left"
                                     placeholder="选择合同状态" choiceText="选择合同状态" hasEmptyOption="true"></FormControl>
                        <FormControl ref="cli_name" label="客户名称: " type="text"></FormControl>
                        <Button icon="search" theme="success" raised={true} className="ml-10" onClick={this.search}>查 询</Button>
                    </Label>
                </Label>

                <Tile header="出库列表" contentStyle={{padding: "0px"}}>
                    <div style={{overflow: 'hidden'}}>
                        <Table ref="table" header={header} data={[]} striped={true} className="text-center"/>
                        <Pagination ref="pagination"
                                    current={this.pageNum}
                                    pageSize={this.pageSize}
                                    total={0}
                                    onChange={this.reloadTableData}
                                    onShowSizeChange={this.reloadTableData}/>
                    </div>
                </Tile>
            </div>
        );
    }
});

module.exports = List;
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
const moment = require('../lib/moment');
const DateRange = require('../lib/DateRange');
const FormControl = require('../lib/FormControl');
const MessageBox = require('../lib/MessageBox');
const Format = require('../format');

const ImportService = require("../services/ImportService");

let List = React.createClass({
    displayName: 'List',


    getInitialState() {
        this.pageNum = 1;
        this.pageSize = 15;
        return {};
    },

    reloadTableData(pageNum, pageSize) {
        let dateRange = this.refs.dateRange.getValue();
        let params = Object.assign({}, {
            pageNum: pageNum,
            pageSize: pageSize,
            prov_name: this.refs.prov_name.getValue(),
            startDate: dateRange[0],
            endDate: dateRange[1],
            ord_contract: this.refs.ord_contract.getValue(),
            ord_status: this.refs.ord_status.getValue()
        });

        ImportService.getPageList(params, ret => {
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

    search() {
        this.reloadTableData(this.pageNum, this.pageSize);
    },

    showConfirm(ord_no) {
        this.refs.confirm.show("确认删除该合同？");
        this.refs.confirm.setData(ord_no);
    },

    confirmDelete(flag) {
        if (flag) {
            var ord_no = this.refs.confirm.getData();
            ImportService.deleteOrder(ord_no, ret => {
                if (ret) {
                    this.refs.tip.show("删除成功");
                    this.refs.tip.setData(true);
                } else {
                    this.refs.tip.show("删除失败");
                    this.refs.tip.setData(false);
                }
            });

            return true;
        }
    },

    confirmDRefresh() {
        if (this.refs.tip.getData()) {
            this.search();
        }
    },

    componentDidMount() {
        this.reloadTableData();
    },

    sendConfirm(ord_no) {
        this.refs.sendTip.show("确认已经发货?");
        this.refs.sendTip.setData(ord_no);
    },

    importConfirm(ord_no) {
        this.refs.importTip.show("确认已经入库?");
        this.refs.importTip.setData(ord_no);
    },

    sendResult(flag) {
        let ord_no = this.refs.sendTip.getData();
        if (flag) {
            ImportService.setStatus(ord_no, Format.ORDER_STATUS.SEND, ret => {
                if (ret) {
                    window.location.reload();
                } else {
                    this.refs.tip.show("提交失败");
                    this.refs.tip.setData(false);
                }
            });
        }
        return true;
    },

    importResult(flag) {
        let ord_no = this.refs.importTip.getData();
        if (flag) {
            ImportService.setStatus(ord_no, Format.ORDER_STATUS.IMPORTED, ret => {
                if (ret) {
                    window.location.reload();
                } else {
                    this.refs.tip.show("提交失败");
                    this.refs.tip.setData(false);
                }
            });
        }
        return true;
    },

    render() {
        let scope = this;
        let btnFormat = function (value, column, row) {
            let btns = [];

            let deleteBtn = React.createElement(
                Button,
                { key: '1', theme: 'success', className: 'ml-10', icon: 'trash', flat: true, onClick: scope.showConfirm.bind(scope, row.ord_no) },
                '删除'
            );
            let payBtn = React.createElement(
                Button,
                { key: '2', theme: 'success', className: 'ml-10', icon: 'cc-visa', flat: true, href: "#import_payFund/" + row.ord_no },
                '付款'
            );
            let sendBtn = React.createElement(
                Button,
                { key: '3', theme: 'success', className: 'ml-10', icon: 'truck', flat: true, onClick: scope.sendConfirm.bind(scope, row.ord_no) },
                '已发货'
            );
            let importBtn = React.createElement(
                Button,
                { key: '4', theme: 'success', className: 'ml-10', icon: 'archive', flat: true, onClick: scope.importConfirm.bind(scope, row.ord_no) },
                '已入库'
            );
            let detailBtn = React.createElement(
                Button,
                { key: '5', theme: 'success', className: 'ml-10', icon: 'bars', flat: true, href: "#import_payFund/" + row.ord_no },
                '查看'
            );
            if (row.ord_status < Format.ORDER_STATUS.FUND) {
                btns.push(deleteBtn);
                btns.push(payBtn);
            } else if (row.ord_status == Format.ORDER_STATUS.FUND) {
                btns.push(payBtn);
                btns.push(sendBtn);
            } else if (row.ord_status == Format.ORDER_STATUS.FUND_SEND) {
                btns = [payBtn];
            } else if (row.ord_status == Format.ORDER_STATUS.FUNDED) {
                btns.push(sendBtn);
                btns.push(detailBtn);
            } else if (row.ord_status == Format.ORDER_STATUS.SEND) {
                btns.push(importBtn);
                btns.push(detailBtn);
            } else if (row.ord_status == Format.ORDER_STATUS.IMPORTED) {
                btns.push(detailBtn);
            }
            return React.createElement(
                'span',
                null,
                btns
            );
        };

        let statusFormatData = {
            "0": "已签合同",
            "1": "预付款未发货",
            "2": "预付款已发货",
            "3": "已付款",
            "4": "已发货",
            "10": "已入库"
        };

        let statusFormat = function (value, column, row) {
            return statusFormatData[value];
        };

        let fundedFormat = function (value, column, row) {
            let remain = row.ord_fund_remain || 0;
            return row.ord_fund - row.ord_fund_remain;
        };

        let fundedPercentFormat = function (value, column, row) {
            let remain = row.ord_fund_remain || 0;
            let funded = row.ord_fund - row.ord_fund_remain;
            let ret = Math.round(funded / row.ord_fund * 100);
            return ret + "%";
        };

        let header = [{ name: "ord_contract", text: "采购合同编号" }, { name: "sale_contract", text: "销售合同编号" }, { name: "ord_time", text: "签订日期", format: "DateFormat" }, { name: "prov_name", text: "供应商" }, { name: "ord_fund", text: "金额(元)" }, { name: "ord_funded", text: "付款(元)", format: fundedFormat }, { name: "ord_fund_remain", text: "余款(元)" }, { name: "fund_percent", text: "付款比例", format: fundedPercentFormat }, { name: "send_time", text: "发货日期", format: "DateFormat" }, { name: "arrival_time", text: "入库日期", format: "DateFormat" }, { name: "voucher", text: "凭证号" }, { name: "ord_status", text: "合同状态", format: statusFormat }, { name: "ops", text: "操作", format: btnFormat }];

        let statusData = [{ id: "0", text: "已签合同" }, { id: "1", text: "预付款" }, { id: "2", text: "预付款已发货" }, { id: "3", text: "已付款" }, { id: "4", text: "已发货" }, { id: "10", text: "已入库" }];

        return React.createElement(
            'div',
            { className: 'main-container' },
            React.createElement(MessageBox, { title: '提示', ref: 'confirm', type: 'confirm', confirm: this.confirmDelete }),
            React.createElement(MessageBox, { title: '提示', ref: 'tip', confirm: this.confirmDRefresh }),
            React.createElement(MessageBox, { title: '提示', type: 'confirm', ref: 'sendTip', confirm: this.sendResult }),
            React.createElement(MessageBox, { title: '提示', type: 'confirm', ref: 'importTip', confirm: this.importResult }),
            React.createElement(
                Label,
                { className: 'searchTools mt-30 mb-20', component: 'div' },
                React.createElement(
                    Label,
                    { className: '', grid: 0.3 },
                    React.createElement(
                        Button,
                        { icon: 'plus', theme: 'success', href: '#import_add' },
                        '新采购'
                    )
                ),
                React.createElement(
                    Label,
                    { className: 'text-right', grid: 0.7 },
                    React.createElement(FormControl, { ref: 'dateRange', label: '时间: ', type: 'daterange', endDate: moment(), clear: 'true' }),
                    React.createElement(FormControl, { ref: 'ord_contract', label: '合同号: ', type: 'text' }),
                    React.createElement(FormControl, { ref: 'ord_status', label: '状态: ', type: 'select', data: statusData, className: 'text-left',
                        placeholder: '选择合同状态', choiceText: '选择合同状态', hasEmptyOption: 'true' }),
                    React.createElement(FormControl, { ref: 'prov_name', label: '供应商名称: ', type: 'text' }),
                    React.createElement(
                        Button,
                        { icon: 'search', theme: 'success', raised: true, className: 'ml-10', onClick: this.search },
                        '查 询'
                    )
                )
            ),
            React.createElement(
                Tile,
                { header: '入库列表', contentStyle: { padding: "0px" } },
                React.createElement(
                    'div',
                    { style: { overflow: 'hidden' } },
                    React.createElement(Table, { ref: 'table', header: header, data: [], striped: true, className: 'text-center' }),
                    React.createElement(Pagination, { ref: 'pagination',
                        current: this.pageNum,
                        pageSize: this.pageSize,
                        total: 0,
                        onChange: this.reloadTableData,
                        onShowSizeChange: this.reloadTableData })
                )
            )
        );
    }
});

module.exports = List;
